import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/auth/presentation/pages/login_page.dart';
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/account/domain/repositories/account_repository.dart';

class AccountController extends GetxController {
  final AccountRepository _accountRepository = AccountRepository();
  final sessionController = Get.find<SessionController>();

  final List<String> reasons = [
    "App doesn't fulfill my purpose",
    "I downloaded this out of curiosity, I do not own an EV",
    "Payment related issues",
    "Charger not available in my location",
    "I do not feel safe while using this app",
    "The app is buggy and really slow",
    "Switching to another competitor",
    "Bad charging experience",
    "Something Else"
  ];
  final RxBool isLoading = false.obs;
  Rx<String?> validationError = Rx<String?>(null);

  // Observable for selected reason
  var selectedReason = ''.obs;

  // Logic for deleting account with confirmation
  Future<void> deleteAccount() async {
    final email = sessionController.emailId.value;
    final userId = sessionController.userId.value;
    final authToken = sessionController.token.value;
    final reason = selectedReason.value;
    if (reason.isEmpty) {
      Get.snackbar("Note", "Please select a reason to proceed.",
          snackPosition: SnackPosition.BOTTOM);
      return;
    }

    // Show confirmation Snackbar before proceeding
    Get.snackbar(
      "Confirm Deletion",
      "Are you sure you want to delete your account?",
      snackPosition: SnackPosition.BOTTOM,
      mainButton: TextButton(
        onPressed: () async {
          isLoading.value = true;
          try {
            final deleteAccountResponse =
                await _accountRepository.DeleteAccount(
                    email, reason, userId, authToken); // Passing correct types

            if (!deleteAccountResponse.error) {
              Get.snackbar(
                "Account Deleted",
                "Your account has been deleted successfully.",
                snackPosition: SnackPosition.BOTTOM,
              );
              // Close the confirmation Snackbar and navigate to the login page
              Get.back(); // Close the Snackbar
              handleLogout(); // Log out the user after successful deletion
            } else {
              validationError.value = deleteAccountResponse.message;
              Get.snackbar(
                "Note",
                deleteAccountResponse.message,
                snackPosition: SnackPosition.BOTTOM,
              );
            }
          } catch (e) {
            validationError.value = e.toString(); // Show actual error message
            debugPrint("Error: $e");
            Get.snackbar(
              "Note",
              "Something went wrong. Please try again.",
              snackPosition: SnackPosition.BOTTOM,
            );
          } finally {
            isLoading.value = false;
          }
        },
        child: Text("Yes, Delete"),
      ),
      icon: Icon(Icons.delete_forever),
    );
  }

// Function to handle logout
  void handleLogout() {
    final landingPageController = Get.find<LandingPageController>();

    // Clear the page index
    landingPageController.clearPageIndex();
    Get.find<SessionController>().clearSession();
    Get.offAll(() => LoginPage());
  }
}
