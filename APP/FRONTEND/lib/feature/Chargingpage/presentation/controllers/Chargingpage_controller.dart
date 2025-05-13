import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:ionhive/core/Networks/websocket_service.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/core/core.dart';
import 'package:ionhive/core/services/notification_service.dart';
import 'package:ionhive/feature/Chargingpage/domain/models/Chargingpage_model.dart';
import 'package:ionhive/feature/Chargingpage/domain/repositories/Chargingpage_repositories.dart';
import 'package:ionhive/feature/landing_page.dart';
import 'package:flutter/material.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';
import 'package:ionhive/feature/session_history/presentation/pages/session_bill.dart';

class ChargingPageController extends GetxController {
  final Chargingpagerepo _repo = Chargingpagerepo();
  var isLoading = false.obs;
  var chargingData = Rx<ChargerStatusData?>(null);
  final sessionController = Get.find<SessionController>();
  var isInitialLoading = true.obs;
  var isEndingSession = false.obs;

  var isWaitingForStatusUpdate = false.obs;
  Timer? _statusUpdateTimeout;
  Timer? _periodicCheckTimer;

  WebSocketService? _webSocketService;
  var isWebSocketConnected = false.obs;
  var webSocketError = ''.obs;
  var isPageActive = true.obs;
  var isReconnecting = false.obs;

  static final List<WebSocketService> _openWebSocketServices = [];

  var voltage = Rx<double?>(null);
  var current = Rx<double?>(null);
  var power = Rx<double?>(null);
  var energy = Rx<double?>(null);
  var frequency = Rx<double?>(null);
  var powerFactor = Rx<double?>(null);

  RxDouble livePrice = 0.0.obs;

  var startedAt = Rx<DateTime?>(null);
  var showMeterValues = true.obs;

  // Track if a notification has been sent for this session
  var hasSentNotification = false.obs;

  late final String chargerId;
  late final int connectorId;
  late final int connectorType;

  @override
  void onInit() {
    super.onInit();
    hasSentNotification.value = false; // Reset notification flag on init
    Future.delayed(const Duration(seconds: 2), () async {
      if (isPageActive.value) {
        await fetchLastStatusData();
        isInitialLoading.value = false;
      }
    });
    initWebSocket();
  }

  @override
  void onReady() {
    super.onReady();
    if (!isPageActive.value) {
      debugPrint(
          'ChargingPageController: onReady called - reinitializing page');
      isPageActive.value = true;
      hasSentNotification.value = false; // Reset notification flag on re-init
      Future.delayed(const Duration(seconds: 2), () async {
        if (isPageActive.value) {
          await fetchLastStatusData();
          isInitialLoading.value = false;
        }
      });
      initWebSocket();
    }
  }

  @override
  void onClose() {
    debugPrint('ChargingPageController: onClose called - cleaning up');
    isPageActive.value = false;
    _cancelPeriodicCheckTimer();
    disconnectWebSocket();
    _cancelStatusUpdateTimeout();
    super.onClose();
  }

  @override
  void dispose() {
    debugPrint('ChargingPageController: dispose called - cleaning up');
    isPageActive.value = false;
    _cancelPeriodicCheckTimer();
    disconnectWebSocket();
    _cancelStatusUpdateTimeout();
    super.dispose();
  }

  void initWebSocket() {
    try {
      final wsUrl = iOnHiveCore.getChargingWebSocketUrl(chargerId, connectorId);
      debugPrint('Creating new WebSocket connection to: $wsUrl');

      _webSocketService = WebSocketService(wsUrl);
      _webSocketService!.connect();

      _openWebSocketServices.add(_webSocketService!);
      debugPrint(
          'Total open WebSocket connections: ${_openWebSocketServices.length}');

      isWebSocketConnected(_webSocketService!.isConnected);
      if (_webSocketService!.isConnected) {
        isReconnecting(false);
      } else {
        isReconnecting(true);
      }

      _webSocketService!.stream.listen(
        (dynamic message) {
          if (isPageActive.value) {
            debugPrint('WebSocket message received in controller');
            handleWebSocketMessage(message);
            isWebSocketConnected(true);
            isReconnecting(false);
          }
        },
        onError: (error) {
          debugPrint('WebSocket error in controller: $error');
          webSocketError.value = error.toString();
          isWebSocketConnected(false);
          isReconnecting(true);
          if (isPageActive.value) {
            _scheduleReconnection();
          }
        },
        onDone: () {
          debugPrint('WebSocket connection closed in controller');
          isWebSocketConnected(false);
          isReconnecting(true);
          if (isPageActive.value) {
            _scheduleReconnection();
          }
        },
      );

      _periodicCheckTimer = Timer.periodic(Duration(seconds: 30), (timer) {
        if (!isPageActive.value) {
          timer.cancel();
          return;
        }

        if (_webSocketService != null &&
            !_webSocketService!.isConnectionActive()) {
          debugPrint(
              'Periodic check: WebSocket connection is not active, reconnecting...');
          isWebSocketConnected(false);
          isReconnecting(true);
          _scheduleReconnection();
        }
      });
    } catch (e) {
      debugPrint('Failed to initialize WebSocket: $e');
      webSocketError.value = e.toString();
      isWebSocketConnected(false);
      isReconnecting(true);
      if (isPageActive.value) {
        _scheduleReconnection();
      }
    }
  }

  void _scheduleReconnection() {
    if (!isPageActive.value) return;

    Future.delayed(const Duration(seconds: 3), () {
      if (!isWebSocketConnected.value && isPageActive.value) {
        debugPrint('Attempting to reconnect WebSocket');
        initWebSocket();
      }
    });
  }

  void disconnectWebSocket() {
    debugPrint('Disconnecting all WebSocket connections...');
    for (var wsService in _openWebSocketServices) {
      try {
        wsService.disconnect();
        debugPrint('WebSocket disconnected successfully');
      } catch (e) {
        debugPrint('Error disconnecting WebSocket: $e');
      }
    }
    _openWebSocketServices.clear();
    debugPrint(
        'All WebSocket connections closed. Total open connections: ${_openWebSocketServices.length}');

    _webSocketService = null;
    isWebSocketConnected(false);
    isReconnecting(false);
  }

  void handleWebSocketMessage(dynamic message) {
    try {
      final Map<String, dynamic> data = jsonDecode(message);
      debugPrint('WebSocket message received: $data');

      final messageChargerId = data['DeviceID']?.toString();
      if (messageChargerId != null && messageChargerId != chargerId) {
        debugPrint(
            'Ignoring message for chargerId: $messageChargerId (current chargerId: $chargerId)');
        return;
      }

      if (data.containsKey('charger_status')) {
        final updatedData = ChargerStatusData.fromJson(data);
        chargingData.value = updatedData;
      } else if (data.containsKey('DeviceID') && data.containsKey('message')) {
        final deviceId = data['DeviceID'];
        final messageArray = data['message'] as List;

        if (messageArray.length >= 4) {
          final messageType = messageArray[2];
          final messageData = messageArray[3] as Map<String, dynamic>;

          if (messageData.containsKey('connectorId')) {
            final int msgConnectorId = messageData['connectorId'] is String
                ? int.tryParse(messageData['connectorId']) ?? 0
                : messageData['connectorId'] ?? 0;

            if (msgConnectorId != connectorId) {
              debugPrint(
                  'Ignoring message for connector: $msgConnectorId (current connector: $connectorId)');
              return;
            }
          }

          if (messageType == 'StatusNotification') {
            handleStatusNotification(deviceId, messageData);
          } else if (messageType == 'Heartbeat') {
            updateTimestamp();
          } else if (messageType == 'ForceDisconnect') {
            handleForceDisconnect(deviceId, messageData);
          } else if (messageType == 'MeterValues') {
            handleMeterValues(messageData);
          } else if (messageType == 'StartTransaction') {
            handleStartTransaction(messageData);
          } else if (messageType == 'StopTransaction') {
            handleStopTransaction(messageData);
          } else if (messageType == 'ChargerLivePrice') {
            final priceData = messageArray[3];
            livePrice.value =
                (priceData['livePrice'] as num?)?.toDouble() ?? 0.0;
          }
        }
      }
    } catch (e) {
      debugPrint('Error parsing WebSocket message: $e');
    }
  }

  Future<void> _pushNotification({
    required String status,
    String? errorCode,
    double? energy,
    double? cost,
  }) async {
    if (hasSentNotification.value) {
      debugPrint('Notification already sent for this session, skipping');
      return;
    }

    NotificationService? notificationService;
    try {
      notificationService = Get.find<NotificationService>();
      debugPrint('Successfully retrieved NotificationService for notification');
    } catch (e) {
      debugPrint('Error finding NotificationService: $e');
      CustomSnackbar.showError(message: 'Notification service unavailable: $e');
      return;
    }

    try {
      // Only show fault notification if there's a real fault (status is Faulted AND errorCode is not NoError)
      if (status == 'Faulted' &&
          (errorCode != null && errorCode != 'NoError')) {
        debugPrint(
            'Pushing Charging Faulted notification: errorCode=$errorCode, energy=$energy, cost=$cost');
        await notificationService.showChargingFaultNotification(
          errorCode: errorCode,
          energy: energy != null && energy > 0 ? energy : null,
          cost: cost != null && cost > 0 ? cost : null,
        );
      } else if (status == 'Finishing' ||
          (status == 'Available' && errorCode == 'Stopped by user')) {
        // Show completion notification for normal finish or user-stopped sessions
        debugPrint(
            'Pushing Charging Complete notification: energy=$energy, cost=$cost');
        await notificationService.showChargingCompleteNotification(
          energy: energy ?? 0.0,
          cost: cost ?? 0.0,
        );
      }
      hasSentNotification.value = true; // Mark notification as sent
      debugPrint('Notification pushed successfully');
    } catch (e) {
      debugPrint('Failed to push notification: $e');
      CustomSnackbar.showError(message: 'Failed to show notification: $e');
    }
  }

  void handleStatusNotification(
      String deviceId, Map<String, dynamic> messageData) {
    final int notificationConnectorId = messageData['connectorId'] is String
        ? int.tryParse(messageData['connectorId']) ?? 0
        : messageData['connectorId'] ?? 0;

    if (notificationConnectorId == connectorId) {
      debugPrint(
          'Processing status notification for our connector: $messageData');

      // final currentData = chargingData.value;
      // if (currentData != null) {
      //   final newStatus = mapOcppStatusToChargerStatus(messageData['status']);
      //   final DateTime timestamp = DateTime.parse(messageData['timestamp']);
      //   final formattedTime =
      //       '${timestamp.day.toString().padLeft(2, '0')}-${timestamp.month.toString().padLeft(2, '0')}-${timestamp.year} ${timestamp.hour.toString().padLeft(2, '0')}:${timestamp.minute.toString().padLeft(2, '0')}:${timestamp.second.toString().padLeft(2, '0')}';

      //   final updatedData = currentData.copyWith(
      //     chargerStatus: newStatus,
      //     timestamp: timestamp,
      //     timestampIST: formattedTime,
      //     errorCode: messageData['errorCode'] ?? currentData.errorCode,
      //   );

      //   chargingData.value = updatedData;

      //   if (isWaitingForStatusUpdate.value) {
      //     debugPrint(
      //         'Received status update ($newStatus), stopping loading indicator');
      //     isWaitingForStatusUpdate.value = false;
      //     _cancelStatusUpdateTimeout();
      //   }

      //   if (newStatus == 'Finishing') {
      //     debugPrint('Charger is finishing, generating bill');
      //     generateBillOnFinish();
      //   } else if (newStatus == 'Faulted') {
      //     final errorCode = messageData['errorCode'] ?? 'Unknown error';

      //     if (energy.value != null && energy.value! > 0) {
      //       debugPrint(
      //           'Charger faulted during active charging (energy: ${energy.value}), generating bill');
      //       generateBillOnFinish();
      //     } else if (errorCode != 'NoError') {
      //       // Only show fault notification if there's a real error
      //       debugPrint(
      //           'Charger faulted before charging started (energy: ${energy.value}), pushing notification and navigating');
      //       // Push notification for early fault
      //       _pushNotification(
      //         status: 'Faulted',
      //         errorCode: errorCode,
      //       ).then((_) {
      //         // Navigate after notification is pushed
      //         Future.delayed(const Duration(seconds: 2), () {
      //           if (isPageActive.value) {
      //             isPageActive.value = false;
      //             disconnectWebSocket();
      //             Get.offAll(
      //               () => LandingPage(),
      //               transition: Transition.rightToLeft,
      //               duration: const Duration(milliseconds: 300),
      //             );
      //           }
      //         });
      //       });
      //     } else {
      //       // If status is Faulted but errorCode is NoError, treat it as a normal completion
      //       debugPrint(
      //           'Status is Faulted but errorCode is NoError, treating as normal completion');
      //       generateBillOnFinish();
      //     }
      //   } else if (newStatus != 'Charging') {
      //     clearMetrics();
      //   } else if (newStatus == 'Charging') {
      //     fetchStartedAt();
      //   }
      // }
      final currentData = chargingData.value;
      if (currentData != null) {
        final newStatus = mapOcppStatusToChargerStatus(messageData['status']);
        final DateTime timestamp = DateTime.parse(messageData['timestamp']);
        final formattedTime =
            '${timestamp.day.toString().padLeft(2, '0')}-${timestamp.month.toString().padLeft(2, '0')}-${timestamp.year} ${timestamp.hour.toString().padLeft(2, '0')}:${timestamp.minute.toString().padLeft(2, '0')}:${timestamp.second.toString().padLeft(2, '0')}';

        // Determine error code, using vendorErrorCode for InternalError
        final rawErrorCode = messageData['errorCode'] ?? currentData.errorCode;
        final errorCode = rawErrorCode == 'InternalError' &&
                messageData.containsKey('vendorErrorCode') &&
                messageData['vendorErrorCode'] is String &&
                messageData['vendorErrorCode'].isNotEmpty
            ? messageData['vendorErrorCode']
            : rawErrorCode;

        debugPrint('Using errorCode: $errorCode for status: $newStatus');

        final updatedData = currentData.copyWith(
          chargerStatus: newStatus,
          timestamp: timestamp,
          timestampIST: formattedTime,
          errorCode: errorCode,
        );

        chargingData.value = updatedData;

        if (isWaitingForStatusUpdate.value) {
          debugPrint(
              'Received status update ($newStatus), stopping loading indicator');
          isWaitingForStatusUpdate.value = false;
          _cancelStatusUpdateTimeout();
        }

        if (newStatus == 'Finishing') {
          debugPrint('Charger is finishing, generating bill');
          generateBillOnFinish();
        } else if (newStatus == 'Faulted') {
          if (energy.value != null && energy.value! > 0) {
            debugPrint(
                'Charger faulted during active charging (energy: ${energy.value}), generating bill');
            generateBillOnFinish();
          } else if (errorCode != 'NoError') {
            // Only show fault notification if there's a real error
            debugPrint(
                'Charger faulted before charging started (energy: ${energy.value}), pushing notification and navigating');
            // Push notification for early fault with determined errorCode
            _pushNotification(
              status: 'Faulted',
              errorCode: errorCode,
            ).then((_) {
              // Navigate after notification is pushed
              Future.delayed(const Duration(seconds: 2), () {
                if (isPageActive.value) {
                  isPageActive.value = false;
                  disconnectWebSocket();
                  Get.offAll(
                    () => LandingPage(),
                    transition: Transition.rightToLeft,
                    duration: const Duration(milliseconds: 300),
                  );
                }
              });
            });
          } else {
            // If status is Faulted but errorCode is NoError, treat it as a normal completion
            debugPrint(
                'Status is Faulted but errorCode is NoError, treating as normal completion');
            generateBillOnFinish();
          }
        } else if (newStatus != 'Charging') {
          clearMetrics();
        } else if (newStatus == 'Charging') {
          fetchStartedAt();
        }
      }
    }
  }

  Future<void> fetchStartedAt() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    try {
      final startedAtResponse = await _repo.Startedat(
        userId,
        emailId,
        authToken,
        connectorId,
        chargerId,
        connectorType,
      );

      if (startedAtResponse.error) {
        CustomSnackbar.showError(
            message:
                'Failed to fetch start time: ${startedAtResponse.message}');
        return;
      }

      if (startedAtResponse.data == null) {
        CustomSnackbar.showError(message: 'Start time data is missing');
        return;
      }

      final startedAtValue = DateTime.parse(startedAtResponse.data!);
      startedAt.value = startedAtValue;
    } catch (e) {
      debugPrint('Failed to parse start time: $e');
      CustomSnackbar.showError(message: 'Failed to parse start time: $e');
    }
  }

  Future<void> generateBillOnFinish() async {
    try {
      // await Future.delayed(const Duration(seconds: 2));

      Get.dialog(
        const AlertDialog(
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Generating Charging Bill...'),
            ],
          ),
        ),
        barrierDismissible: false,
      );

      isLoading.value = true;

      final billGenerationFuture = _repo.generatechargingbill(
        sessionController.userId.value,
        sessionController.emailId.value,
        sessionController.token.value,
        connectorId,
        chargerId,
        connectorType,
      );

      await Future.wait([
        billGenerationFuture,
        Future.delayed(const Duration(seconds: 2)),
      ]);

      final response = await billGenerationFuture;

      if (Get.isDialogOpen == true) {
        Get.back();
      }

      if (response.error) {
        throw response.message;
      }

      if (response.chargingSession == null) {
        throw 'Charging session data is missing in the response';
      }

      Map<String, dynamic> sessionData = response.chargingSession!.toJson();
      sessionData['user'] = response.user?.username ?? 'Unknown';
      sessionData['Error'] = sessionData['stop_reason'] ?? 'Unknown';

      final errorCode = sessionData['stop_reason']?.toString() ?? '';
      final energyUsed =
          (sessionData['unit_consummed'] as num?)?.toDouble() ?? 0.0;
      final totalCost = (sessionData['price'] as num?)?.toDouble() ?? 0.0;
      final currentStatus = chargingData.value?.chargerStatus ?? '';

      // Push notification based on the status
      await _pushNotification(
        status: currentStatus,
        errorCode: errorCode,
        energy: energyUsed,
        cost: totalCost,
      );

      // Navigate to SessionBill after notification
      Future.delayed(const Duration(seconds: 1), () {
        if (isPageActive.value) {
          isPageActive.value = false;
          disconnectWebSocket();
          Get.off(
            () => SessionBill(sessionData),
            transition: Transition.rightToLeft,
            duration: const Duration(milliseconds: 300),
          );
        }
      });
    } catch (e) {
      if (Get.isDialogOpen == true) {
        Get.back();
      }
      debugPrint('Failed to generate bill: $e');
      CustomSnackbar.showError(message: 'Failed to generate charging bill: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void handleMeterValues(Map<String, dynamic> messageData) {
    try {
      final meterValues = messageData['meterValue'] as List?;
      if (meterValues != null && meterValues.isNotEmpty) {
        final sampledValues = meterValues.first['sampledValue'] as List;

        updateTimestamp();

        for (final value in sampledValues) {
          final val = double.tryParse(value['value']?.toString() ?? '0');
          switch (value['measurand']) {
            case 'Voltage':
              voltage.value = val;
              break;
            case 'Current.Import':
              current.value = val;
              break;
            case 'Power.Active.Import':
              power.value = val;
              break;
            case 'Energy.Active.Import.Register':
              energy.value = val;
              break;
            case 'Frequency':
              frequency.value = val;
              break;
            case 'Power.Factor':
              powerFactor.value = val;
              break;
          }
        }

        update();
      }
    } catch (e) {
      debugPrint('Error parsing meter values: $e');
    }
  }

  void handleStartTransaction(Map<String, dynamic> messageData) {
    debugPrint('Charging session started: $messageData');
    hasSentNotification.value =
        false; // Reset notification flag when a new session starts
  }

  void handleStopTransaction(Map<String, dynamic> messageData) {
    debugPrint('Charging session stopped: $messageData');
    clearMetrics();
    showMeterValues.value = false;
  }

  void clearMetrics() {
    voltage.value = null;
    current.value = null;
    power.value = null;
    energy.value = null;
    frequency.value = null;
    powerFactor.value = null;
  }

  void handleForceDisconnect(
      String deviceId, Map<String, dynamic> messageData) {
    final int notificationConnectorId = messageData['connectorId'] is String
        ? int.tryParse(messageData['connectorId']) ?? 0
        : messageData['connectorId'] ?? 0;

    if (notificationConnectorId == connectorId) {
      final String alertMessage = messageData['message']?.toString() ??
          'No action attempted. Automatically redirecting to home page.';

      Get.dialog(
        AlertDialog(
          title: const Text('Session Ended'),
          content: Text(alertMessage),
          actions: [],
        ),
        barrierDismissible: false,
      );

      Future.delayed(const Duration(seconds: 4), () {
        if (isPageActive.value) {
          isPageActive.value = false;
          disconnectWebSocket();
          Get.offAll(
            () => LandingPage(),
            transition: Transition.rightToLeft,
            duration: const Duration(milliseconds: 300),
          );
        }
      });
    }
  }

  String mapOcppStatusToChargerStatus(String ocppStatus) {
    switch (ocppStatus) {
      case 'Available':
        return 'Available';
      case 'Preparing':
        return 'Preparing';
      case 'Charging':
        return 'Charging';
      case 'SuspendedEVSE':
      case 'SuspendedEV':
        return 'Suspended';
      case 'Finishing':
        return 'Finishing';
      case 'Reserved':
        return 'Reserved';
      case 'Unavailable':
        return 'Unavailable';
      case 'Faulted':
        return 'Faulted';
      default:
        return 'Unknown';
    }
  }

  void updateTimestamp() {
    final currentData = chargingData.value;
    if (currentData != null) {
      final now = DateTime.now();
      final formattedTime =
          '${now.day.toString().padLeft(2, '0')}-${now.month.toString().padLeft(2, '0')}-${now.year} ${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}:${now.second.toString().padLeft(2, '0')}';

      chargingData.value = currentData.copyWith(
        timestamp: now,
        timestampIST: formattedTime,
      );

      update();
    }
  }

  Future<void> fetchLastStatusData() async {
    try {
      isInitialLoading(true);
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      final response = await _repo.fetchlastdata(
        userId,
        emailId,
        authToken,
        connectorId,
        chargerId,
        connectorType,
      );

      chargingData.value = response.data;
    } catch (e) {
      CustomSnackbar.showError(message: 'Failed to fetch charging data: $e');
      rethrow;
    } finally {
      isInitialLoading(false);
    }
  }

  Future<void> endChargingSession({
    required int connectorId,
    required String chargerId,
  }) async {
    try {
      isEndingSession(true);
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      final currentStatus = chargingData.value?.chargerStatus;
      final shouldGenerateBill = currentStatus == 'Finishing' ||
          (currentStatus == 'Faulted' &&
              energy.value != null &&
              energy.value! > 0);

      debugPrint(
          'Ending charging session. Status: $currentStatus, Generate bill: $shouldGenerateBill');

      isPageActive(false);
      disconnectWebSocket();

      await _repo.endchargingsession(
        userId,
        emailId,
        authToken,
        connectorId,
        chargerId,
      );

      Get.offAll(
        () => LandingPage(),
        transition: Transition.rightToLeft,
        duration: const Duration(milliseconds: 300),
      );
    } catch (e) {
      CustomSnackbar.showError(message: 'Failed to end charging session: $e');
      rethrow;
    } finally {
      isEndingSession(false);
      isLoading(false);
      isWaitingForStatusUpdate(false);
      _cancelStatusUpdateTimeout();
    }
  }

  Future<void> startChargingSession({
    required int connectorId,
    required String chargerId,
  }) async {
    try {
      isLoading(true);
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      await _repo.StartCharging(
        userId,
        emailId,
        authToken,
        connectorId,
        chargerId,
        connectorType,
      );

      // final startedAtResponse = await _repo.Startedat(
      //   userId,
      //   emailId,
      //   authToken,
      //   connectorId,
      //   chargerId,
      //   connectorType,
      // );

      // if (startedAtResponse.error) {
      //   CustomSnackbar.showError(
      //       message:
      //           'Failed to fetch start time: ${startedAtResponse.message}');
      // } else {
      //   try {
      //     if (startedAtResponse.data != null) {
      //       final startedAtValue = DateTime.parse(startedAtResponse.data!);
      //       startedAt.value = startedAtValue;
      //     } else {
      //       CustomSnackbar.showError(message: 'Start time data is missing');
      //     }
      //   } catch (e) {
      //     CustomSnackbar.showError(message: 'Failed to parse start time: $e');
      //   }
      // }

      showMeterValues.value = true;
      await fetchLastStatusData();

      isWaitingForStatusUpdate.value = true;
      _startStatusUpdateTimeout();
    } catch (e) {
      CustomSnackbar.showError(message: 'Failed to start charging session: $e');
      isWaitingForStatusUpdate.value = false;
      _cancelStatusUpdateTimeout();
      rethrow;
    } finally {
      isLoading(false);
    }
  }

  Future<void> stopchargingsession({
    required int connectorId,
    required String chargerId,
  }) async {
    try {
      isLoading(true);
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      await _repo.StopCharging(
        userId,
        emailId,
        authToken,
        connectorId,
        chargerId,
        connectorType,
      );

      showMeterValues.value = false;
      startedAt.value = null;
      await fetchLastStatusData();

      isWaitingForStatusUpdate.value = true;
      _startStatusUpdateTimeout();
    } catch (e) {
      CustomSnackbar.showError(message: 'Failed to stop charging session: $e');
      isWaitingForStatusUpdate.value = false;
      _cancelStatusUpdateTimeout();
      rethrow;
    } finally {
      isLoading(false);
    }
  }

  Future<void> updateAutoStopSettings(Map<String, dynamic> settings) async {
    try {
      isLoading(true);
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      debugPrint('updateUserTimeVal: ${settings['autostop_time']}, '
          'updateUserUnitVal: ${settings['autostop_unit']}, '
          'updateUserPriceVal: ${settings['autostop_price']}, '
          'updateUserTime_isChecked: ${settings['autostop_time_is_checked']}, '
          'updateUserUnit_isChecked: ${settings['autostop_unit_is_checked']}, '
          'updateUserPrice_isChecked: ${settings['autostop_price_is_checked']}');

      await _repo.updateAutoStopSettings(
        user_id: userId,
        email: emailId,
        authToken: authToken,
        updateUserTimeVal: settings['autostop_time'] as int?,
        updateUserUnitVal: settings['autostop_unit'] as int?,
        updateUserPriceVal: settings['autostop_price'] as double?,
        updateUserTime_isChecked: settings['autostop_time_is_checked'] as bool,
        updateUserUnit_isChecked: settings['autostop_unit_is_checked'] as bool,
        updateUserPrice_isChecked:
            settings['autostop_price_is_checked'] as bool,
      );

      await fetchLastStatusData();

      CustomSnackbar.showSuccess(message: 'Auto-stop settings updated');

      Future.delayed(const Duration(seconds: 2), () {
        if (isPageActive.value) {
          debugPrint('Closing modal after success snackbar');
          Get.close(1);
        }
      });
    } catch (e) {
      CustomSnackbar.showError(message: 'Failed to update settings: $e');
      rethrow;
    } finally {
      isLoading(false);
    }
  }

  void _startStatusUpdateTimeout() {
    _cancelStatusUpdateTimeout();
    _statusUpdateTimeout = Timer(Duration(seconds: 30), () {
      if (isWaitingForStatusUpdate.value) {
        debugPrint('Timeout waiting for status update, stopping loading');
        isWaitingForStatusUpdate.value = false;
        CustomSnackbar.showError(
            message: 'Timed out waiting for charger status update');
      }
    });
  }

  void _cancelStatusUpdateTimeout() {
    _statusUpdateTimeout?.cancel();
    _statusUpdateTimeout = null;
  }

  void _cancelPeriodicCheckTimer() {
    _periodicCheckTimer?.cancel();
    _periodicCheckTimer = null;
  }
}
