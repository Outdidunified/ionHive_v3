import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/auth/presentation/controllers/auth_controller.dart'; // Auth controller
import 'package:ionhive/feature/landing_page.dart' show LandingPage;
import 'package:ionhive/utils/widgets/button/custom_button.dart'; // Custom button
import 'package:ionhive/utils/widgets/input_field/email_inputfield.dart';
import 'package:url_launcher/url_launcher.dart'; // Email input field

class LoginPage extends StatelessWidget {
  LoginPage({super.key});
  final controller = Get.put(AuthController());

  @override
  Widget build(BuildContext context) {
    controller.validationError.value =
        null; // Reset validation error when the page is rebuilt
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Column(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(35.0),
                              child: Image.asset(
                                "assets/ionHive_logo/ionHive.png",
                                width: 90.0,
                                height: 90.0,
                                fit: BoxFit.cover,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              "ion Hive",
                              style: theme.textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              "Electric vehicle charging station for everyone.\nDiscover. Charge. Pay.",
                              textAlign: TextAlign.center,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 32),
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
                            readOnly: controller.isLoading.value,
                          );
                        }),
                        const SizedBox(height: 16),
                        Obx(() {
                          return CustomButton(
                            text: "Get OTP",
                            isLoading: controller.isLoading.value,
                            onPressed: () {
                              FocusScope.of(context).unfocus();
                              controller.handleGetOTP();
                            },
                            borderRadius: 16.0,
                            textStyle: theme.textTheme.bodyLarge!,
                            boxShadow: BoxShadow(
                              color: theme.primaryColor.withOpacity(0.5),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          );
                        }),
                        const SizedBox(height: 24),
                        // Terms and conditions
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Obx(() {
                              return Transform.translate(
                                offset: const Offset(0, -10),
                                child: Theme(
                                  data: ThemeData(
                                    unselectedWidgetColor: Colors
                                        .green, // This changes the border color
                                  ),
                                  child: Checkbox(
                                    value: controller.isChecked
                                        .value, // Bind to isChecked RxBool
                                    onChanged: (value) {
                                      controller.isChecked.value =
                                          value ?? false; // Update the RxBool
                                    },
                                    activeColor:
                                        Colors.green, // Color when checked
                                    checkColor:
                                        Colors.black, // Color of the checkmark
                                    side: BorderSide(
                                      color:
                                          Colors.grey.shade600, // Border color
                                      width: 1, // Border width
                                    ),
                                  ),
                                ),
                              );
                            }),
                            const SizedBox(width: 8),
                            Flexible(
                              child: RichText(
                                text: TextSpan(
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: Colors.grey.shade600,
                                  ),
                                  children: [
                                    const TextSpan(
                                        text: "By continuing, I accept the "),
                                    WidgetSpan(
                                      child: GestureDetector(
                                        onTap: () async {
                                          final url = Uri.parse(
                                              "https://ionhive.in/terms-and-service");
                                          if (await canLaunchUrl(url)) {
                                            await launchUrl(url,
                                                mode: LaunchMode
                                                    .externalApplication);
                                          }
                                        },
                                        child: Text(
                                          "Terms & Conditions",
                                          style: theme.textTheme.bodySmall
                                              ?.copyWith(
                                            color: theme.primaryColor,
                                          ),
                                        ),
                                      ),
                                    ),
                                    const TextSpan(text: " and "),
                                    WidgetSpan(
                                      child: GestureDetector(
                                        onTap: () async {
                                          final url = Uri.parse(
                                              "https://ionhive.in/privacy-policy");
                                          if (await canLaunchUrl(url)) {
                                            await launchUrl(url,
                                                mode: LaunchMode
                                                    .externalApplication);
                                          }
                                        },
                                        child: Text(
                                          "Privacy Policy",
                                          style: theme.textTheme.bodySmall
                                              ?.copyWith(
                                            color: theme.primaryColor,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 24),
                        Center(
                          child: InkWell(
                            onTap: () async {
                              // Enable guest mode
                              // final sessionController =
                              //     Get.find<SessionController>();
                              // await sessionController.enableGuestMode();

                              // Navigate to landing page
                              Get.to(
                                LandingPage(),
                                transition: Transition
                                    .rightToLeft, // Right-to-left animation
                                duration: Duration(
                                    milliseconds:
                                        300), // Optional: customize speed
                              );
                            },
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 24, vertical: 14),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.grey.shade200,
                                    Colors.grey.shade200
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: Theme.of(context).brightness ==
                                          Brightness.dark
                                      ? Colors.white54
                                      : Colors.black26,
                                  width: 0.2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.withOpacity(0.4),
                                    blurRadius: 8,
                                    offset: Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.person_outline,
                                    color: Colors.black38,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Continue as guest',
                                    style: TextStyle(
                                      color: Colors.black38,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1.1,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
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
