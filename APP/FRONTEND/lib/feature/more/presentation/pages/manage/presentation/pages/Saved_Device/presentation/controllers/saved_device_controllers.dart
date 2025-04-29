import 'package:flutter/cupertino.dart';
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
    fetchSavedDevices();
  }

  Future<void> fetchSavedDevices() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    isLoading.value = true;
    errorMessage.value = '';

    try {
      final response =
      await _savedDeviceRepoistory.fetchprofile(userId, emailId, authToken);
      if (response.success) {
        if (response.saveddevice != null) {
          final chargerDetails = response.saveddevice as List<dynamic>? ?? [];
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
        } else {
          savedDevices.clear();
        }
      } else {
        errorMessage.value = response.message;
      }
    } catch (e) {
      errorMessage.value = "Failed to fetch devices: ${e.toString()}";
      debugPrint("Error fetching devices: $e");
    } finally {
      isLoading.value = false;
    }
  }

  void toggleConnectorDetails(int index) {
    expandedConnectorIndices[index] = !(expandedConnectorIndices[index] ?? false);
    update(['connectors', 'viewMoreButton']);
  }

  void setSelectedConnector(String chargerId, int connectorIndex) {
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

  @override
  void onClose() {
    super.onClose();
    Get.closeAllSnackbars();
  }
}