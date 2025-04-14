import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/auth/presentation/controllers/auth_controller.dart'; // Auth controller
import 'package:ionhive/utils/widgets/button/custom_button.dart'; // Custom button
import 'package:ionhive/utils/widgets/input_field/email_inputfield.dart'; // Email input field
import 'package:ionhive/utils/responsive/responsive.dart'; // Import responsive utilities

class LoginPage extends StatelessWidget {
  LoginPage({super.key});
  final controller = Get.put(AuthController());

  @override
  Widget build(BuildContext context) {
    controller.validationError.value =
        null; // Reset validation error when the page is rebuilt
    final theme = Theme.of(context);

    // Get screen dimensions for responsive sizing
    final screenWidth = context.screenWidth;
    final screenHeight = context.screenHeight;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  child: ResponsivePadding(
                    horizontal: 24.0,
                    vertical: 16.0,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Column(
                          children: [
                            ClipRRect(
                              borderRadius:
                                  BorderRadius.circular(context.rRadius(35.0)),
                              child: ResponsiveImage(
                                imagePath: "assets/ionHive_logo's/ionHive.png",
                                width: 90.0,
                                height: 90.0,
                                fit: BoxFit.cover,
                              ),
                            ),
                            ResponsiveSizedBox(height: 10),
                            ResponsiveText(
                              text: "ion Hive",
                              style: theme.textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            ResponsiveSizedBox(height: 16),
                            ResponsiveText(
                              text:
                                  "Electric vehicle charging station for everyone.\nDiscover. Charge. Pay.",
                              textAlign: TextAlign.center,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: Colors.grey.shade600,
                              ),
                            ),
                            ResponsiveSizedBox(height: 32),
                          ],
                        ),
                        Obx(() {
                          return EmailInput(
                            controller: controller.emailController,
                            errorText: controller.validationError.value,
                            onChanged: (value) {
                              // Call your validation here
                              controller.validationError.value =
                                  controller.validateEmail();
                            },
                          );
                        }),
                        ResponsiveSizedBox(height: 16),
                        Obx(() {
                          return CustomButton(
                            text: "Get OTP",
                            isLoading: controller.isLoading.value,
                            onPressed: () {
                              FocusScope.of(context).unfocus();
                              controller.handleGetOTP();
                            },
                            borderRadius: context.rRadius(16.0),
                            textStyle: theme.textTheme.bodyLarge!.copyWith(
                              fontSize: context.rFontSize(
                                  theme.textTheme.bodyLarge!.fontSize ?? 16),
                            ),
                            boxShadow: BoxShadow(
                              color: theme.primaryColor.withOpacity(0.5),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          );
                        }),
                        ResponsiveSizedBox(height: 24),
                        // Terms and conditions
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Obx(() {
                              return Transform.translate(
                                offset: Offset(0, -context.rSpacing(10)),
                                child: Theme(
                                  data: ThemeData(
                                    unselectedWidgetColor: Colors.green,
                                  ),
                                  child: SizedBox(
                                    width: context.rWidth(24),
                                    height: context.rHeight(24),
                                    child: Checkbox(
                                      value: controller.isChecked.value,
                                      onChanged: (value) {
                                        controller.isChecked.value =
                                            value ?? false;
                                      },
                                      activeColor: Colors.green,
                                      checkColor: Colors.black,
                                      side: BorderSide(
                                        color: Colors.grey.shade600,
                                        width: 1,
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }),
                            ResponsiveSizedBox(width: 8),
                            Flexible(
                              child: Text.rich(
                                TextSpan(
                                  text: "By continuing, I accept the ",
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: Colors.grey.shade600,
                                    fontSize: context.rFontSize(
                                        theme.textTheme.bodySmall?.fontSize ??
                                            12),
                                  ),
                                  children: [
                                    TextSpan(
                                      text: "Terms & Conditions",
                                      style:
                                          theme.textTheme.bodySmall?.copyWith(
                                        color: theme.primaryColor,
                                        fontSize: context.rFontSize(theme
                                                .textTheme
                                                .bodySmall
                                                ?.fontSize ??
                                            12),
                                      ),
                                    ),
                                    TextSpan(
                                      text: " and ",
                                      style: TextStyle(
                                        fontSize: context.rFontSize(theme
                                                .textTheme
                                                .bodySmall
                                                ?.fontSize ??
                                            12),
                                      ),
                                    ),
                                    TextSpan(
                                      text: "Privacy Policy",
                                      style:
                                          theme.textTheme.bodySmall?.copyWith(
                                        color: theme.primaryColor,
                                        fontSize: context.rFontSize(theme
                                                .textTheme
                                                .bodySmall
                                                ?.fontSize ??
                                            12),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.only(bottom: context.rSpacing(16.0)),
              child: Align(
                alignment: Alignment.center,
                child: ResponsiveText(
                  text: "Powered by \nOutdid Unified Pvt Ltd",
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade600,
                    fontSize: context.rFontSize(10),
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
