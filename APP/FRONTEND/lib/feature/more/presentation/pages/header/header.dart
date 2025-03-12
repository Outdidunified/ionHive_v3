import 'package:flutter/material.dart';
import 'package:get/get.dart'; // Ensure you have GetX imported for Get.find() and Get.offAll()
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/header/presentation/controllers/controller.dart';
import 'package:ionhive/utils/widgets/button/custom_button.dart';
import 'package:ionhive/utils/widgets/input_field/phonenumber_inputfield.dart';
import 'package:ionhive/utils/widgets/input_field/username_inputfield.dart';

class HeaderCard extends StatelessWidget {
  final ThemeData theme;

  HeaderCard({super.key, required this.theme});
  final sessionController = Get.find<SessionController>();
  final controller = Get.put(HeaderController());

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 60.0, left: 16.0, right: 16.0),
      child: Container(
        decoration: BoxDecoration(
          color: theme.cardColor, // Theme-based background
          borderRadius: BorderRadius.circular(16),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Profile avatar with edit button
              Stack(
                alignment: Alignment.center,
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: theme.cardColor, // Theme-based color
                    child: CircleAvatar(
                      radius: 48,
                      backgroundColor:
                          theme.primaryColorLight, // Theme-based background
                      child: Obx(() {
                        String email = sessionController.emailId.value;
                        return Text(
                          email.isNotEmpty
                              ? email[0].toUpperCase()
                              : '?', // Default to '?' if empty
                          style: TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                            color: theme.textTheme.bodyLarge
                                ?.color, // Theme-based text color
                          ),
                        );
                      }),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: GestureDetector(
                      onTap: () {
                        showEditProfileDialog(context);

                        // Navigate to the Edit Profile page
                      },
                      child: CircleAvatar(
                        backgroundColor: theme.primaryColor,
                        radius: 16,
                        child: Icon(
                          Icons.edit,
                          size: 16,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 16), // Spacing between avatar and details
              // Column with email, username, and status
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Obx(() {
                      return Text(
                        sessionController.username.value.isNotEmpty
                            ? sessionController.username.value
                            : 'Complete your profile',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: theme.primaryColor,
                        ),
                      );
                    }),
                    const SizedBox(height: 8),
                    Obx(() {
                      return Text(
                        sessionController.emailId.value,
                        style: TextStyle(
                          fontSize: 14,
                          color: theme.textTheme.bodyMedium?.color,
                        ),
                      );
                    }),
                    const SizedBox(height: 8),
                    Text(
                      "Status: Active",
                      style: TextStyle(
                        fontSize: 14,
                        color: theme.primaryColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void showEditProfileDialog(BuildContext context) {
    final controller = Get.find<HeaderController>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            bottom: MediaQuery.of(context).viewInsets.bottom + 16,
            top: 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Slide Indicator
              Container(
                width: 40,
                height: 5,
                decoration: BoxDecoration(
                  color: Colors.grey[400],
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              const SizedBox(height: 8),

              const Text(
                "Complete your profile",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              UsernameInputField(
                controller: controller.usernameController,
              ),
              const SizedBox(height: 12),

              // Using Custom Phone Number Input Widget
              AdvancedPhoneNumberInput(
                controller: controller.phoneNumberController,
                onChanged: (phone) {},
                onCountryChanged: (countryCode) {},
              ),
              const SizedBox(height: 16),

              // Custom Button for Save
              CustomButton(
                text: "Save",
                onPressed: () {
                  controller.updateProfile();
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
