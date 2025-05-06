import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/utils/widgets/dropdowns/select_reason_dropdown.dart';
import 'package:ionhive/feature/more/presentation/pages/account/presentation/controllers/account_controller.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';
import 'package:ionhive/utils/widgets/loading/loading_indicator.dart';

class DeleteAccountPage extends StatelessWidget {
  DeleteAccountPage({super.key});
  final controller = Get.put(AccountController());

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Obx(() => Scaffold(
          appBar: AppBar(
            title: const Text(
              'Delete Account',
              style: TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
            centerTitle: true,
            backgroundColor: controller.isLoading.value
                ? Colors.transparent
                : theme.appBarTheme.backgroundColor,
            elevation: controller.isLoading.value ? 0 : null,
          ),
          body: Stack(
            children: [
              SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Seems like you had a bad experience using the app. Please let us know what went wrong and why you want to delete the account. This would help us serve other customers better.',
                      style: theme.textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Please select the reason why you want to delete your account?',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 20),
                    SelectReasonDropdown(
                      reasons: controller.reasons,
                      selectedReason: controller.selectedReason,
                      otherReason: controller.otherReason,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'If you continue, your profile and account details will be deleted. You will not be able to login to your account.',
                      style: theme.textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 40),
                    ElevatedButton(
                      onPressed: () {
                        if (controller.selectedReason.value.isEmpty) {
                          CustomSnackbar.showWarning(
                              message: "Please select a reason to proceed.");
                        } else if (controller.selectedReason.value == "Other" &&
                            controller.otherReason.value.isEmpty) {
                          CustomSnackbar.showWarning(
                              message: "Please specify your reason.");
                        } else {
                          controller.deleteAccount();
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor:
                            Colors.red, // Set background color to red
                        foregroundColor: Colors.white, // Set text color to red

                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Delete'),
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton(
                      onPressed: () {
                        Get.back();
                      },
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(
                            color: Colors.red), // Set border color to red
                        foregroundColor: Colors.red, // Set text color to red
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Cancel'),
                    ),
                  ],
                ),
              ),
              // Loading overlay that covers the entire screen including app bar
              Obx(() => controller.isLoading.value
                  ? Positioned.fill(
                      child: Container(
                        color: Colors.black.withOpacity(0.7),
                        child: Center(
                          child: Container(
                            height: 70,
                            width: 220,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.2),
                                  blurRadius: 10,
                                  offset: const Offset(0, 5),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const SizedBox(width: 20),
                                SizedBox(
                                  height: 30,
                                  width: 30,
                                  child: LoadingIndicator(
                                    color: theme.colorScheme.primary,
                                    size: 30.0,
                                  ),
                                ),
                                const SizedBox(width: 20),
                                Text(
                                  'Deleting account...',
                                  style: TextStyle(
                                    color: Colors.black87,
                                    fontWeight: FontWeight.w500,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    )
                  : const SizedBox.shrink()),
            ],
          ),
        ));
  }
}
