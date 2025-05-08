import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/Saved_Device/domain/repository/saved_device_repoistory.dart';

class SavedDeviceControllers extends GetxController {
  final SavedDeviceRepoistory _savedDeviceRepoistory = SavedDeviceRepoistory();
  final sessionController = Get.find<SessionController>();

  final RxBool isLoading = false.obs;
  final RxList<Map<String, dynamic>> savedDevices =
      <Map<String, dynamic>>[].obs;
  final RxString errorMessage = ''.obs;

  // Add state for expanded connectors
  final Map<int, bool> expandedConnectorIndices = {};
  bool isToggling = false;

  // Track the single selected connector across all devices
  final RxMap<String, dynamic> selectedConnector = <String, dynamic>{
    'chargerId': '',
    'connectorIndex': -1,
  }.obs;

  @override
  void onInit() {
    super.onInit();
    // Use a post-frame callback to ensure the widget is fully built
    WidgetsBinding.instance.addPostFrameCallback((_) {
      fetchSavedDevices();
    });
  }

  // Flag to track if a fetch is already in progress
  final RxBool _isFetching = false.obs;
  int _retryCount = 0;
  static const int _maxRetries = 3;

  Future<void> fetchSavedDevices() async {
    // Prevent multiple simultaneous fetches
    if (_isFetching.value) {
      debugPrint('Fetch already in progress, skipping duplicate call');
      return;
    }

    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    // Check if we have valid credentials
    if (authToken.isEmpty || userId <= 0 || emailId.isEmpty) {
      debugPrint('Invalid credentials, cannot fetch saved devices');
      errorMessage.value = "Please log in to view saved devices";
      return;
    }

    _isFetching.value = true;
    isLoading.value = true;
    errorMessage.value = '';

    try {
      debugPrint('Fetching saved devices for user $userId');
      final response =
          await _savedDeviceRepoistory.fetchprofile(userId, emailId, authToken);

      if (response.success) {
        if (response.saveddevice != null) {
          final chargerDetails = response.saveddevice as List<dynamic>? ?? [];
          debugPrint('Received ${chargerDetails.length} saved devices');

          if (chargerDetails.isNotEmpty) {
            savedDevices.assignAll(chargerDetails.map((charger) {
              final connectors =
                  (charger['connectors'] as List<dynamic>?)?.toList() ?? [];
              return {
                'charger_id': charger['charger_id'],
                'model': charger['model'],
                'type': charger['charger_type'],
                'vendor': charger['vendor'],
                'address': charger['address'],
                'landmark': charger['landmark'],
                'unit_price': charger['unit_price'],
                'connectors': connectors,
                'last_used': charger['last_used'] ?? 'N/A',
                'max_power': '${charger['max_power']}W',
              };
            }).toList());
          } else {
            savedDevices.clear();
          }

          // Reset retry count on success
          _retryCount = 0;
        } else {
          savedDevices.clear();
        }
      } else {
        errorMessage.value = response.message;
        debugPrint('Error from API: ${response.message}');

        // Retry on API error
        _maybeRetry();
      }
    } catch (e) {
      errorMessage.value = "Failed to fetch devices: ${e.toString()}";
      debugPrint("Error fetching devices: $e");

      // Retry on exception
      _maybeRetry();
    } finally {
      isLoading.value = false;
      _isFetching.value = false;
    }
  }

  // Helper method to retry fetching with exponential backoff
  void _maybeRetry() {
    if (_retryCount < _maxRetries) {
      _retryCount++;
      final delay = Duration(
          milliseconds: 500 * (1 << _retryCount)); // Exponential backoff
      debugPrint(
          'Retrying fetch in ${delay.inMilliseconds}ms (attempt $_retryCount)');

      Future.delayed(delay, () {
        if (Get.isRegistered<SavedDeviceControllers>()) {
          fetchSavedDevices();
        }
      });
    }
  }

  void toggleConnectorDetails(int index) {
    expandedConnectorIndices[index] =
        !(expandedConnectorIndices[index] ?? false);
    update(['connectors', 'viewMoreButton']);
  }

  void setSelectedConnector(String chargerId, int connectorIndex) {
    // Check if the device still exists before setting the connector
    final deviceExists = savedDevices
        .any((device) => device['charger_id'].toString() == chargerId);

    if (!deviceExists) {
      // If device doesn't exist, reset selection
      selectedConnector.value = {
        'chargerId': '',
        'connectorIndex': -1,
      };
      return;
    }

    if (selectedConnector['chargerId'] == chargerId &&
        selectedConnector['connectorIndex'] == connectorIndex) {
      // Unselect if re-tapped
      selectedConnector.value = {
        'chargerId': '',
        'connectorIndex': -1,
      };
    } else {
      // Select the new connector and deselect any previous selection
      selectedConnector.value = {
        'chargerId': chargerId,
        'connectorIndex': connectorIndex,
      };
    }
    selectedConnector.refresh(); // Notify listeners of the change
    update(['connectors']);
  }

  // Method to safely remove a device
  void removeDevice(String chargerId) {
    // Reset selected connector if it's from the device being removed
    if (selectedConnector['chargerId'] == chargerId) {
      selectedConnector.value = {
        'chargerId': '',
        'connectorIndex': -1,
      };
    }

    // Remove the device from the list
    final deviceIndex = savedDevices
        .indexWhere((device) => device['charger_id'].toString() == chargerId);

    if (deviceIndex != -1) {
      savedDevices.removeAt(deviceIndex);
      update();
    }
  }

  @override
  void onClose() {
    super.onClose();
    Get.closeAllSnackbars();
  }
}
