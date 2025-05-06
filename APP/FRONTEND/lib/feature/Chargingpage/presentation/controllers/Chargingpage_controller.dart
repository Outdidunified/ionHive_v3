import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/Networks/websocket_service.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/core/core.dart';
import 'package:ionhive/feature/Chargingpage/domain/models/Chargingpage_model.dart';
import 'package:ionhive/feature/Chargingpage/domain/repositories/Chargingpage_repositories.dart';
import 'package:ionhive/feature/landing_page.dart';
import 'package:flutter/material.dart';

class ChargingPageController extends GetxController {
  final Chargingpagerepo _repo = Chargingpagerepo();
  var isLoading = false.obs;
  var chargingData = Rx<ChargerStatusData?>(null);
  final sessionController = Get.find<SessionController>();
  var isInitialLoading = true.obs;
  var isEndingSession = false.obs;

  // WebSocket related variables
  WebSocketService? _webSocketService;
  var isWebSocketConnected = false.obs;
  var webSocketError = ''.obs;
  var isPageActive = true.obs;

  // Static variables to track the active WebSocket connection
  static String? _activeChargerId;
  static int? _activeConnectorId;
  static WebSocketService? _activeWebSocketService;

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
    debugPrint('ChargingPageController: onClose called - closing WebSocket connection');
    isPageActive(false);
    disconnectWebSocket();
    super.onClose();
  }

  @override
  void dispose() {
    debugPrint('ChargingPageController: dispose called - closing WebSocket connection');
    isPageActive(false);
    disconnectWebSocket();
    super.dispose();
  }

  void initWebSocket() {
    try {
      if (_activeChargerId != null &&
          _activeConnectorId != null &&
          (_activeChargerId != chargerId || _activeConnectorId != connectorId)) {
        debugPrint(
            'Existing WebSocket connection found for chargerId: $_activeChargerId, connectorId: $_activeConnectorId. Closing it.');
        _activeWebSocketService?.disconnect();
        _activeWebSocketService = null;
        _activeChargerId = null;
        _activeConnectorId = null;
      }

      if (_activeChargerId == chargerId && _activeConnectorId == connectorId) {
        debugPrint('Reusing existing WebSocket connection for chargerId: $chargerId, connectorId: $connectorId');
        _webSocketService = _activeWebSocketService;
        isWebSocketConnected(_webSocketService!.isConnected);
        return;
      }

      disconnectWebSocket();

      final wsUrl = iOnHiveCore.getChargingWebSocketUrl(chargerId, connectorId);
      debugPrint('Connecting to WebSocket: $wsUrl');

      _webSocketService = WebSocketService(wsUrl);
      _webSocketService!.connect();
      isWebSocketConnected(_webSocketService!.isConnected);

      _activeWebSocketService = _webSocketService;
      _activeChargerId = chargerId;
      _activeConnectorId = connectorId;

      _webSocketService!.stream.listen(
            (dynamic message) {
          handleWebSocketMessage(message);
        },
        onError: (error) {
          debugPrint('WebSocket error: $error');
          webSocketError.value = error.toString();
          isWebSocketConnected(false);
          Future.delayed(const Duration(seconds: 3), () {
            if (!isWebSocketConnected.value && isPageActive.value) {
              debugPrint('Attempting to reconnect WebSocket after error');
              initWebSocket();
            }
          });
        },
        onDone: () {
          debugPrint('WebSocket connection closed');
          isWebSocketConnected(false);
          Future.delayed(const Duration(seconds: 3), () {
            if (!isWebSocketConnected.value && isPageActive.value) {
              debugPrint('Attempting to reconnect WebSocket after connection closed');
              initWebSocket();
            }
          });
        },
      );
    } catch (e) {
      debugPrint('Failed to initialize WebSocket: $e');
      webSocketError.value = e.toString();
      isWebSocketConnected(false);
    }
  }

  void disconnectWebSocket() {
    debugPrint('Disconnecting WebSocket...');
    if (_webSocketService != null) {
      try {
        _webSocketService!.disconnect();
        debugPrint('WebSocket disconnected successfully');
      } catch (e) {
        debugPrint('Error disconnecting WebSocket: $e');
      } finally {
        if (_activeChargerId == chargerId && _activeConnectorId == connectorId) {
          _activeWebSocketService = null;
          _activeChargerId = null;
          _activeConnectorId = null;
        }
        _webSocketService = null;
        isWebSocketConnected(false);
      }
    }
  }

  void handleWebSocketMessage(dynamic message) {
    try {
      final Map<String, dynamic> data = jsonDecode(message);
      debugPrint('WebSocket message received: $data');

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
            final data = message['message'][3];
            livePrice.value = (data['livePrice'] as num?)?.toDouble() ?? 0.0;
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
        final updatedData = currentData.copyWith(
          chargerStatus: mapOcppStatusToChargerStatus(messageData['status']),
          timestamp: DateTime.parse(messageData['timestamp']),
          errorCode: messageData['errorCode'] ?? currentData.errorCode,
        );

        chargingData.value = updatedData;

        if (updatedData.chargerStatus != 'Charging') {
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
    // You can update any necessary state when charging starts
  }

  void handleStopTransaction(Map<String, dynamic> messageData) {
    debugPrint('Charging session stopped: $messageData');
    clearMetrics();
    showMeterValues.value = false; // Hide meter values after stopping
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
      isInitialLoading(false);
    } catch (e) {
      isInitialLoading(false);
      Get.snackbar('Error', 'Failed to fetch charging data: $e');
      rethrow;
    }
  }

  Future<void> endChargingSession({
    required int connectorId,
    required String chargerId,
  }) async {
    try {
      isLoading(true);
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      await _repo.endchargingsession(
        userId,
        emailId,
        authToken,
        connectorId,
        chargerId,
      );
      isLoading(false);
      Get.off(() => LandingPage());
    } catch (e) {
      isLoading(false);
      Get.snackbar('Error', 'Failed to end charging session: $e');
      rethrow;
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

      startedAt.value = DateTime.now(); // Set the "Started At" timestamp
      showMeterValues.value = true; // Ensure meter values are visible after starting
      await fetchLastStatusData();
    } catch (e) {
      Get.snackbar('Error', 'Failed to start charging session: $e');
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

      showMeterValues.value = false; // Hide meter values after stopping
      startedAt.value = null; // Clear the "Started At" timestamp
      await fetchLastStatusData();
    } catch (e) {
      Get.snackbar('Error', 'Failed to stop charging session: $e');
      rethrow;
    } finally {
      isLoading(false);
    }
  }
}