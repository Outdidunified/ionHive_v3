import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/header/presentation/controllers/controller.dart';
import 'package:ionhive/utils/widgets/button/custom_button.dart';
import 'package:ionhive/utils/widgets/input_field/phonenumber_inputfield.dart';
import 'package:ionhive/utils/widgets/input_field/username_inputfield.dart';

class HeaderCard extends StatelessWidget {
  final ThemeData theme;
  final int userId;
  final String username;
  final String emailId;
  final String token;
  HeaderCard({super.key, required this.theme, required this.userId, required this.username, required this.emailId, required this.token});

  final sessionController = Get.find<SessionController>();
  final controller = Get.put(HeaderController());



  @override
  Widget build(BuildContext context) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;

    // Fetch wallet balance when the widget is built
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.fetchwalletbalance();
    });
    // Fetch wallet balance when the widget is built
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.fetchtotalsession();
    });


    return Stack(
      alignment: Alignment.topCenter,
      children: [
        // Gradient Background from Theme
        Container(
          width: double.infinity,
          height: screenHeight * 0.33, // 32% of screen height
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.lightGreen, // Gradient start from theme
                Colors.black, // Gradient end from theme
              ],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
        ),

        // White Curved Background
        Positioned(
          bottom: 0,
          child: Container(
            width: screenWidth,
            height: screenHeight * 0.24, // 23% of screen height
            decoration: BoxDecoration(
              color: theme.colorScheme.background, // Theme background
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(40),
                topRight: Radius.circular(40),
              ),
            ),
          ),
        ),

        // Profile Image & User Details
        Positioned(
          top: screenHeight * 0.10, // 10% of screen height
          child: Column(
            children: [
              Stack(
                children: [
                  // Profile Image with Border
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: theme.primaryColor, // Border color from theme
                        width: 3.0,
                      ),
                    ),
                    child: CircleAvatar(
                      radius: screenWidth * 0.10, // 10% of screen width
                      backgroundColor: Colors.transparent,
                      child: Obx(() {
                        String email = sessionController.emailId.value;
                        return Text(
                          email.isNotEmpty ? email[0].toUpperCase() : '?',
                          style: theme.textTheme.headlineMedium?.copyWith(
                            fontSize: screenWidth * 0.08, // 8% of screen width
                            fontWeight: FontWeight.bold,
                          ),
                        );
                      }),
                    ),
                  ),

                  // Edit Icon Positioned at Bottom Right
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: GestureDetector(
                      onTap: () {
                        showEditProfileDialog(context);
                      },
                      child: CircleAvatar(
                        backgroundColor: theme.colorScheme.primary,
                        radius: screenWidth * 0.035, // 3.5% of screen width
                        child: Icon(
                          Icons.edit,
                          size: screenWidth * 0.03, // 3% of screen width
                          color: theme.colorScheme.onPrimary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              SizedBox(height: screenHeight * 0.01), // 1% of screen height

              // User Name
              Obx(() {
                return Text(
                  sessionController.username.value.isNotEmpty
                      ? sessionController.username.value
                      : "Complete your profile",
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                );
              }),

              // User Email
              Obx(() {
                return Text(
                  sessionController.emailId.value.isNotEmpty
                      ? sessionController.emailId.value
                      : "Complete your profile",
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                );
              }),

              SizedBox(height: screenHeight * 0.02), // 1% of screen height

              // Stats Row
              Container(
                width: screenWidth, // Full screen width
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(child: Obx(() => _buildStatItem(
                      controller.walletBalance.value, // Use fetched wallet balance
                      "Wallet Balance",
                    )),),
                    Container(
                      height: screenHeight * 0.05, // 5% of screen height
                      width: screenWidth * 0.003, // 0.3% of screen width
                      color: Colors.grey.shade300,
                    ),
                    Expanded(child: Obx(() => _buildStatItem(
                      controller.totalsession.value, // Use fetched wallet balance
                      "Total Session",
                    )),),
                    Container(
                      height: screenHeight * 0.05, // 5% of screen height
                      width: screenWidth * 0.003, // 0.3% of screen width
                      color: Colors.grey.shade300,
                    ),
                    Expanded(child: _buildStatItem("Active", "Status")),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem(String value, String label) {
    return Column(
      children: [
        if (label == "Status") // Conditionally add green dot for "Status"
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 10, // Width of the green dot
                height: 10, // Height of the green dot
                decoration: BoxDecoration(
                  color: Colors.green, // Green color for the dot
                  shape: BoxShape.circle, // Circular shape
                ),
              ),
              SizedBox(width: 8), // Spacing between the dot and text
              Text(
                value,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          )
        else
          Text(
            value,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        // 0.5% of screen height
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurface.withOpacity(0.6),
          ),
        ),
      ],
    );
  }


}

void showEditProfileDialog(BuildContext context) {
  final controller = Get.find<HeaderController>();

  // Fetch user details first
  controller.fetchprofile().then((_) {
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

              // Username Input Field (Shows fetched value or empty)
              UsernameInputField(
                controller: controller.usernameController,
              ),
              const SizedBox(height: 12),

              // Phone Number Input Field (Shows fetched value or empty)
              AdvancedPhoneNumberInput(
                controller: controller.phoneNumberController,
                onChanged: (phone) {},
                onCountryChanged: (countryCode) {},
              ),
              const SizedBox(height: 16),

              // Save Button
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
  });
}


