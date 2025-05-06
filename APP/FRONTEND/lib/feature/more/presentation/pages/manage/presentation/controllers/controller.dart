import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/domain/models/manage_model.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/domain/repositories/manage_repository.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

class ManageController extends GetxController {
  final Managerepository repository = Managerepository();
  Rx<Fetchrfidmodel?> rfidData = Rx<Fetchrfidmodel?>(null);
  RxBool isLoading = false.obs;

  Future<void> fetchRFIDData(String email, String token) async {
    try {
      isLoading.value = true;

      final Fetchrfidmodel response = await repository.Fetchrfid(email, token);

      if (response.error) {
        // Get.snackbar("Message", response.message);
        // debugPrint(response.message);
      } else {
        // final message = response.message; // ✅ Extract message object
        // debugPrint(message);
        // Get.snackbar(
        //     "Success",
        //     "RFID: ${message['tag_id']}, Assigned: ${message['tag_id_assigned']}"
        // );
      }

      // Store the response
      rfidData.value = response;
    } catch (e) {
      CustomSnackbar.showError(
          message: "An unexpected error occurred: ${e.toString()}");
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> Deactivaterfidc(
      String email, String token, int userid, String tagid, bool status) async {
    try {
      isLoading.value = true;

      final DeactivateRfid response = await repository.DeactivateRfidrep(
          email, token, userid, tagid, status);

      if (response.error) {
        Get.snackbar("Message", response.message);
        debugPrint(response.message);
      } else {
        final message = response.message; // ✅ Extract message object
        debugPrint(message);
        CustomSnackbar.showSuccess(
            message: "You have successfully deactivated your RFID card.");
      }

      // Store the response
    } catch (e) {
      CustomSnackbar.showError(
          message: "An unexpected error occurred: ${e.toString()}");
      // debugPrint("An unexpected error occurred: ${e.toString()}");
    } finally {
      isLoading.value = false;
    }
  }
}

@override
void onClose() {
  Get.closeAllSnackbars(); // Close all active snackbars
}
