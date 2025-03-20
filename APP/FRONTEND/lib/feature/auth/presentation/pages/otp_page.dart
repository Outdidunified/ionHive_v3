import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:ionhive/feature/auth/presentation/controllers/auth_controller.dart'; //Auth Controller
import 'package:ionhive/utils/widgets/button/custom_button.dart'; // Custom Button
import 'package:ionhive/utils/widgets/input_field/otp_inputfield.dart'; // OTP Input Field

class OtpPage extends StatelessWidget {
  final String email;
  final AuthController controller = Get.find();

  OtpPage({super.key, required this.email});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        "Enter OTP",
                        style: theme.textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "A verification code has been sent to $email. Please enter it below.",
                        style: theme.textTheme.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),
                      OtpInputPage(
                        controller: controller.otpController,
                        errorText: controller.otpValidationError,
                      ),
                      const SizedBox(height: 32),
                      Obx(() {
                        return CustomButton(
                          text: "Continue",
                          onPressed: () {
                            FocusScope.of(context).unfocus();
                            final otp = controller.otpController.text.trim();
                            if (otp.isNotEmpty) {
                              controller.isLoading.value = false;
                              controller.authenticateOTPandHandleLogin();
                            } else {
                              controller.otpValidationError.value =
                                  "Please enter a valid OTP";
                            }
                          },
                          isLoading: controller.isLoading.value,
                          borderRadius: 16.0,
                          textStyle: theme.textTheme.bodyLarge!,
                          boxShadow: BoxShadow(
                            color: theme.primaryColor.withOpacity(0.5),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: Align(
                alignment: Alignment.center,
                child: Text(
                  "Powered by \nOutdid Unified Pvt Ltd",
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
