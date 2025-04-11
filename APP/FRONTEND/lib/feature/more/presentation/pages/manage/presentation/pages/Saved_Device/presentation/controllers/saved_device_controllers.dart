import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/Saved_Device/domain/repository/saved_device_repoistory.dart';

class SavedDeviceControllers extends GetxController {
  final SavedDeviceRepoistory _savedDeviceRepoistory = SavedDeviceRepoistory();
  final sessionController = Get.find<SessionController>();

  final RxBool isLoading = false.obs;
  final RxList<Map<String, dynamic>> savedDevices = <Map<String, dynamic>>[].obs;
  final RxString errorMessage = ''.obs;

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
      final response = await _savedDeviceRepoistory.fetchprofile(userId, emailId, authToken);
      print("fetching saved device body : $response"); // Debug the full response

      if (response.success && response.saveddevice != null) {
        // Process favChargersDetails into savedDevices
        final chargerDetails = response.saveddevice as List<dynamic>? ?? [];
        savedDevices.assignAll(chargerDetails.map((charger) {
          final connectors = (charger['connectors'] as List<dynamic>?)?.take(2).toList() ?? [];
          return {
            'charger_id': charger['charger_id'],
            'model': charger['model'],
            'type': charger['charger_type'],
            'vendor': charger['vendor'],
            'address': charger['address'],
            'landmark': charger['landmark'],
            'unit_price': charger['unit_price'],
            'connectors': connectors,
            'last_used': '10/04/2025', // Placeholder; replace with actual data if available
            'max_power': '${charger['max_power']}W', // Example formatting
          };
        }).toList());
        print("Processed savedDevices: $savedDevices"); // Debug the processed data
      } else {
        errorMessage.value = response.message ?? 'Failed to fetch devices';
      }
    } catch (e) {
      errorMessage.value = "Failed to fetch devices: ${e.toString()}";
      debugPrint("Error fetching devices: $e");
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    super.onClose();
    Get.closeAllSnackbars();
  }
}