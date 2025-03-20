import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/header/domain/repositories/header_repository.dart';

class HeaderController extends GetxController {
  final HeaderRepository _headerRepository = HeaderRepository();
  final sessionController = Get.find<SessionController>();

  // Text controllers for editing profile
  final TextEditingController usernameController = TextEditingController();
  TextEditingController phoneNumberController = TextEditingController();

  final RxBool isLoading = false.obs;
  final RxnString updateProfileValidationError =
      RxnString(); // Holds validation errors

  @override
  void onInit() {
    super.onInit();
    // Initialize text controllers with existing values
    usernameController.text = sessionController.username.value;
  }

// Function to update the profile
  Future<void> updateProfile() async {
    String newUsername = usernameController.text.trim();
    String phoneNumberText = phoneNumberController.text.trim();

    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    // Basic validation
    if (newUsername.isEmpty || phoneNumberText.isEmpty) {
      Get.snackbar(
        "Note",
        "Fields cannot be empty",
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return;
    }

    // Convert phone number to int safely
    int? newPhoneNumber;
    try {
      newPhoneNumber = int.parse(phoneNumberText);
    } catch (e) {
      Get.snackbar(
        "Note",
        "Invalid phone number",
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return;
    }

    isLoading.value = true;
    try {
      // Call API to complete profile update
      final authenticateResponse = await _headerRepository.CompleteProfile(
        newUsername,
        userId,
        emailId,
        newPhoneNumber,
        authToken,
      );

      if (!authenticateResponse.error) {
        // Update session with new username
        sessionController.username.value = newUsername;

        // Close the bottom sheet
        Get.back();
        phoneNumberController.clear();
        usernameController.clear();

        // Show success message
        Get.snackbar(
          "Success",
          "Profile updated successfully",
          backgroundColor: Colors.green,
          colorText: Colors.white,
        );
      } else {
        updateProfileValidationError.value = authenticateResponse.message;
      }
    } catch (e) {
      updateProfileValidationError.value =
          e.toString(); // Show actual error message
      debugPrint("Error updating profile: $e");
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    usernameController.dispose();
    phoneNumberController.dispose();
    super.onClose();
  }
}
