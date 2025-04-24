import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/auth/presentation/pages/login_page.dart';
import 'package:ionhive/feature/landing_page_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/account/domain/repositories/account_repository.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

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
    "Other" // Changed from "Something Else" to "Other" to match our implementation
  ];
  final RxBool isLoading = false.obs;
  Rx<String?> validationError = Rx<String?>(null);

  // Observable for selected reason
  var selectedReason = ''.obs;

  // Observable for other reason text when "Other" is selected
  var otherReason = ''.obs;

  // Logic for deleting account with confirmation
  Future<void> deleteAccount() async {
    final email = sessionController.emailId.value;
    final userId = sessionController.userId.value;
    final authToken = sessionController.token.value;

    // Get the reason - if "Other" is selected, use the otherReason text
    String finalReason;
    if (selectedReason.value.isEmpty) {
      CustomSnackbar.showWarning(message: "Please select a reason to proceed.");
      return;
    } else if (selectedReason.value == "Other") {
      if (otherReason.value.isEmpty) {
        CustomSnackbar.showWarning(message: "Please specify your reason.");
        return;
      }
      finalReason = "Other: ${otherReason.value}";
    } else {
      finalReason = selectedReason.value;
    }

    // Show confirmation dialog instead of snackbar
    Get.dialog(
      AlertDialog(
        title: Text("Confirm Deletion"),
        content: Text("Are you sure you want to delete your account?"),
        actions: [
          TextButton(
            onPressed: () => Get.back(), // Close dialog
            child: Text("Cancel"),
          ),
          TextButton(
            onPressed: () async {
              Get.back(); // Close dialog
              isLoading.value = true;
              try {
                final deleteAccountResponse =
                    await _accountRepository.DeleteAccount(
                        email, finalReason, userId, authToken);

                if (!deleteAccountResponse.error) {
                  CustomSnackbar.showSuccess(
                    message: "Your account has been deleted successfully.",
                  );
                  handleLogout(); // Log out the user after successful deletion
                } else {
                  validationError.value = deleteAccountResponse.message;
                  CustomSnackbar.showError(
                    message: deleteAccountResponse.message,
                  );
                }
              } catch (e) {
                validationError.value = e.toString();
                debugPrint("Error: $e");
                CustomSnackbar.showError(
                  message: "Something went wrong. Please try again.",
                );
              } finally {
                isLoading.value = false;
              }
            },
            child: Text("Yes, Delete", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
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

@override
void onClose() {
  Get.closeAllSnackbars(); // Close all active snackbars
}
