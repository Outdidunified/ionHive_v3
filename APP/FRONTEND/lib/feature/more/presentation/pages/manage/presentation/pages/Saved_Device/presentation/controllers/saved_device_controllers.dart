import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/Saved_Device/domain/repository/saved_device_repoistory.dart';

class SavedDeviceControllers extends GetxController {
  final SavedDeviceRepoistory _savedDeviceRepoistory = SavedDeviceRepoistory();
  final sessionController = Get.find<SessionController>();

  final RxBool isLoading = false.obs;

  // Store fetched profile data
  RxMap<String, dynamic>? saveddevicedata = RxMap();

  @override
  void onInit() {
    super.onInit();

    fetchsaveddevice(); // Fetch profile data on init
  }

  Future<void> fetchsaveddevice() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    isLoading.value = true;
    try {
      print("Fetching profile...");
      final fetchResponseModel =
          await _savedDeviceRepoistory.fetchprofile(userId, emailId, authToken);

      print("Fetch response: ${fetchResponseModel.toJson()}");
    } catch (e, stackTrace) {
      print("Error fetching profile: $e");
      print("Stack trace: $stackTrace");
      Get.snackbar(
        "Error",
        "Failed to fetch profile: $e",
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    super.onClose();
    Get.closeAllSnackbars(); // Close all active snackbars
  }
}
