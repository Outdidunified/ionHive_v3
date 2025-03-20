import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/utils/widgets/dropdowns/select_reason_dropdown.dart';
import 'package:ionhive/feature/more/presentation/pages/account/presentation/controllers/account_controller.dart';

class DeleteAccountPage extends StatelessWidget {
  DeleteAccountPage({super.key});
  final controller = Get.put(AccountController());

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Delete Account'),
        centerTitle: true,
        backgroundColor: theme.primaryColor,
      ),
      body: SingleChildScrollView(
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
            const SizedBox(height: 8),
            // Obx(() {
            SelectReasonDropdown(
              reasons: controller.reasons,
              selectedReason: controller.selectedReason,
            ),
            // }),
            const SizedBox(height: 16),
            Text(
              'If you continue, your profile and account details will be deleted. You will not be able to login to your account.',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: () {
                if (controller.selectedReason.value.isEmpty) {
                  Get.snackbar("Note", "Please select a reason to proceed.",
                      snackPosition: SnackPosition.BOTTOM);
                } else {
                  controller.deleteAccount();
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red, // Set background color to red
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
                side: BorderSide(color: Colors.red), // Set border color to red
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
    );
  }
}
