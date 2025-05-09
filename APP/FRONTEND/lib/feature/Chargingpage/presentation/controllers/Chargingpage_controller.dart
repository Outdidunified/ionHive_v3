import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:ionhive/core/Networks/websocket_service.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/core/core.dart';
import 'package:ionhive/feature/Chargingpage/domain/models/Chargingpage_model.dart';
import 'package:ionhive/feature/Chargingpage/domain/repositories/Chargingpage_repositories.dart';
import 'package:ionhive/feature/landing_page.dart';
import 'package:flutter/material.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

class ChargingPageController extends GetxController {
  final Chargingpagerepo _repo = Chargingpagerepo();
  var isLoading = false.obs;
  var chargingData = Rx<ChargerStatusData?>(null);
  final sessionController = Get.find<SessionController>();
  var isInitialLoading = true.obs;
  var isEndingSession = false.obs;

  // New variable to track if we're waiting for a WebSocket status update
  var isWaitingForStatusUpdate = false.obs;
  Timer? _statusUpdateTimeout;

  // WebSocket related variables
  WebSocketService? _webSocketService;
  var isWebSocketConnected = false.obs;
  var webSocketError = ''.obs;
  var isPageActive = true.obs;
  var isReconnecting = false.obs;

  // Static list to track all open WebSocket connections
  static final List<WebSocketService> _openWebSocketServices = [];

  // Charging metrics
  var voltage = Rx<double?>(null);
  var current = Rx<double?>(null);
  var power = Rx<double?>(null);
  var energy = Rx<double?>(null);
  var frequency = Rx<double?>(null);
  var powerFactor = Rx<double?>(null);

  RxDouble livePrice = 0.0.obs;

  // New variables for "Started At" timestamp and meter values visibility
  var startedAt = Rx<DateTime?>(null);
  var showMeterValues = true.obs;

  late final String chargerId;
  late final int connectorId;
  late final int connectorType;

  @override
  void onInit() {
    super.onInit();
    Future.delayed(const Duration(seconds: 2), () async {
      await fetchLastStatusData();
      isInitialLoading.value = false;
    });
    initWebSocket();
  }

  @override
  void onClose() {
    debugPrint('ChargingPageController: onClose called - closing all WebSocket connections');
    isPageActive(false);
    disconnectWebSocket();
    _cancelStatusUpdateTimeout();
    super.onClose();
  }

  @override
  void dispose() {
    debugPrint('ChargingPageController: dispose called - closing all WebSocket connections');
    isPageActive(false);
    disconnectWebSocket();
    _cancelStatusUpdateTimeout();
    super.dispose();
  }

  void initWebSocket() {
    try {
      // Always create a new WebSocket connection
      final wsUrl = iOnHiveCore.getChargingWebSocketUrl(chargerId, connectorId);
      debugPrint('Creating new WebSocket connection to: $wsUrl');

      _webSocketService = WebSocketService(wsUrl);
      _webSocketService!.connect();

      // Add the new connection to the list of open connections
      _openWebSocketServices.add(_webSocketService!);
      debugPrint('Total open WebSocket connections: ${_openWebSocketServices.length}');

      // Update connection status
      isWebSocketConnected(_webSocketService!.isConnected);
      if (_webSocketService!.isConnected) {
        isReconnecting(false);
      } else {
        isReconnecting(true);
      }

      // Set up stream listener
      _webSocketService!.stream.listen(
            (dynamic message) {
          debugPrint('WebSocket message received in controller');
          handleWebSocketMessage(message);
          // Confirm connection is working when we receive messages
          isWebSocketConnected(true);
          isReconnecting(false);
        },
        onError: (error) {
          debugPrint('WebSocket error in controller: $error');
          webSocketError.value = error.toString();
          isWebSocketConnected(false);
          isReconnecting(true);

          // Schedule reconnection attempt
          _scheduleReconnection();
        },
        onDone: () {
          debugPrint('WebSocket connection closed in controller');
          isWebSocketConnected(false);
          isReconnecting(true);

          // Schedule reconnection attempt
          _scheduleReconnection();
        },
      );

      // Periodically check if the connection is still active
      Timer.periodic(Duration(seconds: 30), (timer) {
        if (!isPageActive.value) {
          timer.cancel();
          return;
        }

        if (_webSocketService != null && !_webSocketService!.isConnectionActive()) {
          debugPrint('Periodic check: WebSocket connection is not active, reconnecting...');
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

      // Schedule reconnection attempt
      _scheduleReconnection();
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
    // Close all WebSocket connections in the list
    for (var wsService in _openWebSocketServices) {
      try {
        wsService.disconnect();
        debugPrint('WebSocket disconnected successfully');
      } catch (e) {
        debugPrint('Error disconnecting WebSocket: $e');
      }
    }
    // Clear the list of open connections
    _openWebSocketServices.clear();
    debugPrint('All WebSocket connections closed. Total open connections: ${_openWebSocketServices.length}');

    _webSocketService = null;
    isWebSocketConnected(false);
    isReconnecting(false);
  }

  void handleWebSocketMessage(dynamic message) {
    try {
      final Map<String, dynamic> data = jsonDecode(message);
      debugPrint('WebSocket message received: $data');

      // First check if this message is for our charger
      final messageChargerId = data['DeviceID']?.toString();
      if (messageChargerId != null && messageChargerId != chargerId) {
        debugPrint('Ignoring message for chargerId: $messageChargerId (current chargerId: $chargerId)');
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

          // For connector-specific messages, check if it's for our connector
          if (messageData.containsKey('connectorId')) {
            final int msgConnectorId = messageData['connectorId'] is String
                ? int.tryParse(messageData['connectorId']) ?? 0
                : messageData['connectorId'] ?? 0;

            if (msgConnectorId != connectorId) {
              debugPrint('Ignoring message for connector: $msgConnectorId (current connector: $connectorId)');
              return;
            }
          }

          // Process the message only if it's for our charger and connector
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
            livePrice.value = (priceData['livePrice'] as num?)?.toDouble() ?? 0.0;
          }
        }
      }
    } catch (e) {
      debugPrint('Error parsing WebSocket message: $e');
    }
  }

  void handleStatusNotification(String deviceId, Map<String, dynamic> messageData) {
    final int notificationConnectorId = messageData['connectorId'] is String
        ? int.tryParse(messageData['connectorId']) ?? 0
        : messageData['connectorId'] ?? 0;

    if (notificationConnectorId == connectorId) {
      debugPrint('Processing status notification for our connector: $messageData');

      final currentData = chargingData.value;
      if (currentData != null) {
        final newStatus = mapOcppStatusToChargerStatus(messageData['status']);
        final updatedData = currentData.copyWith(
          chargerStatus: newStatus,
          timestamp: DateTime.parse(messageData['timestamp']),
          errorCode: messageData['errorCode'] ?? currentData.errorCode,
        );

        chargingData.value = updatedData;

        // Stop showing loading once we receive a new status
        if (isWaitingForStatusUpdate.value) {
          debugPrint('Received status update ($newStatus), stopping loading indicator');
          isWaitingForStatusUpdate.value = false;
          _cancelStatusUpdateTimeout();
        }

        // Handle different status conditions
        if (newStatus == 'Finishing') {
          debugPrint('Charger is finishing, preparing for bill generation');
        } else if (newStatus == 'Faulted') {
          if (energy.value != null && energy.value! > 0) {
            debugPrint('Charger faulted during active charging, will generate bill');
          } else {
            debugPrint('Charger faulted before charging started, no bill needed');
          }
        } else if (newStatus != 'Charging') {
          clearMetrics();
        }
      }
    }
  }

  void handleMeterValues(Map<String, dynamic> messageData) {
    try {
      final meterValues = messageData['meterValue'] as List?;
      if (meterValues != null && meterValues.isNotEmpty) {
        final sampledValues = meterValues.first['sampledValue'] as List;

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
      }
    } catch (e) {
      debugPrint('Error parsing meter values: $e');
    }
  }

  void handleStartTransaction(Map<String, dynamic> messageData) {
    debugPrint('Charging session started: $messageData');
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

  void handleForceDisconnect(String deviceId, Map<String, dynamic> messageData) {
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
        isPageActive.value = false;
        disconnectWebSocket();
        Get.off(() => LandingPage());
        Get.delete<ChargingPageController>();
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
      chargingData.value = currentData.copyWith(
        timestamp: DateTime.now(),
      );
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
          (currentStatus == 'Faulted' && energy.value != null && energy.value! > 0);

      debugPrint('Ending charging session. Status: $currentStatus, Generate bill: $shouldGenerateBill');

      // Close all WebSocket connections
      isPageActive(false);
      disconnectWebSocket();

      await _repo.endchargingsession(
        userId,
        emailId,
        authToken,
        connectorId,
        chargerId,
      );

      Get.off(() => LandingPage());
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

      final startedAtResponse = await _repo.Startedat(
        userId,
        emailId,
        authToken,
        connectorId,
        chargerId,
        connectorType,
      );

      if (startedAtResponse.error) {
        CustomSnackbar.showError(message: 'Failed to fetch start time: ${startedAtResponse.message}');
      } else {
        try {
          if (startedAtResponse.data != null) {
            final startedAtValue = DateTime.parse(startedAtResponse.data!);
            startedAt.value = startedAtValue;
          } else {
            CustomSnackbar.showError(message: 'Start time data is missing');
          }
        } catch (e) {
          CustomSnackbar.showError(message: 'Failed to parse start time: $e');
        }
      }

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

      debugPrint(
          'updateUserTimeVal: ${settings['autostop_time']}, '
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
        updateUserPrice_isChecked: settings['autostop_price_is_checked'] as bool,
      );

      await fetchLastStatusData();

      CustomSnackbar.showSuccess(message: 'Auto-stop settings updated');

      Future.delayed(const Duration(seconds: 2), () {
        debugPrint('Closing modal after success snackbar');
        Get.close(1);
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
        CustomSnackbar.showError(message: 'Timed out waiting for charger status update');
      }
    });
  }

  void _cancelStatusUpdateTimeout() {
    _statusUpdateTimeout?.cancel();
    _statusUpdateTimeout = null;
  }
}