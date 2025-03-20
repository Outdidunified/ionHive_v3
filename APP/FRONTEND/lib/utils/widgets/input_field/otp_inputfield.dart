import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/auth/presentation/controllers/auth_controller.dart';
import 'package:pinput/pinput.dart';

class OtpInputPage extends StatefulWidget {
  final TextEditingController controller;
  final RxnString errorText;
  final AuthController authcontroller = Get.find();

  OtpInputPage({
    super.key,
    required this.controller,
    required this.errorText,
  });

  @override
  _OtpInputPageState createState() => _OtpInputPageState();
}

class _OtpInputPageState extends State<OtpInputPage> {
  final RxInt countdownTime = 30.obs; // Timer countdown in seconds

  @override
  void initState() {
    super.initState();
    startTimer(); // Start the timer when the widget is initialized
  }

  void startTimer() {
    Timer.periodic(const Duration(seconds: 1), (Timer t) {
      if (countdownTime.value > 0) {
        countdownTime.value--;
      } else {
        t.cancel();
      }
    });
  }

  Future<void> resendOtp() async {
    widget.errorText.value = null; // Clear any previous error
    countdownTime.value = 30; // Reset the countdown
    startTimer(); // Restart the timer

    // Attempt to resend OTP
    try {
      await widget.authcontroller.resendOtp();
    } catch (e) {
      // Catch any error and update the error text
      widget.errorText.value = e.toString();
    }
  }

  void showOtpValidationError() {
    // This function is used to show the OTP validation error and hide it after 2 seconds
    Future.delayed(const Duration(seconds: 2), () {
      widget.authcontroller.otpValidationError.value =
          null; // Clear the error after 2 seconds
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Obx(() {
          return Pinput(
            length: 6,
            controller: widget.controller,
            keyboardType: TextInputType.number, // Restrict keyboard to numbers
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly
            ], // Allow only digits
            onChanged: (value) {
              widget.errorText.value = null; // Clear error text on input change
            },
            errorText: widget.errorText.value,
            defaultPinTheme: PinTheme(
              width: 50,
              height: 60,
              textStyle: theme.textTheme.headlineMedium?.copyWith(
                color: theme.primaryColor,
                fontWeight: FontWeight.bold,
              ),
              decoration: BoxDecoration(
                border: Border.all(color: theme.dividerColor),
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            focusedPinTheme: PinTheme(
              width: 50,
              height: 60,
              textStyle: theme.textTheme.headlineMedium?.copyWith(
                color: theme.primaryColor,
                fontWeight: FontWeight.bold,
              ),
              decoration: BoxDecoration(
                border: Border.all(color: theme.primaryColor),
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          );
        }),
        const SizedBox(height: 16),
// Error Text positioned to the right side with start padding
        Row(
          mainAxisAlignment: MainAxisAlignment.start, // Align to the left
          children: [
            Padding(
              padding:
                  const EdgeInsets.only(left: 9.0), // Add padding to the left
              child: Obx(() {
                if (widget.authcontroller.otpValidationError.value != null) {
                  showOtpValidationError(); // Show error and hide it after 2 seconds
                }
                return Visibility(
                  visible:
                      widget.authcontroller.otpValidationError.value != null,
                  child: Text(
                    widget.authcontroller.otpValidationError.value ?? '',
                    style: TextStyle(
                        color: const Color.fromARGB(255, 227, 42, 42)),
                  ),
                );
              }),
            ),
          ],
        ),

        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Padding(
              padding: const EdgeInsets.only(
                  left: 8.5), // Add padding to the right of the first text
              child: Obx(() {
                // Dynamically set text color based on timer state
                Color textColor = countdownTime.value > 0
                    ? Colors.red // Active timer (dynamic color)
                    : Colors.green; // Ready to resend

                return Text(
                  countdownTime.value > 0
                      ? "Resend OTP in ${countdownTime.value} seconds"
                      : "You can now resend the OTP",
                  style: theme.textTheme.bodyMedium?.copyWith(color: textColor),
                );
              }),
            ),
            Obx(() {
              return GestureDetector(
                onTap: countdownTime.value > 0
                    ? null
                    : resendOtp, // Disable text interaction if timer is active
                child: Text(
                  "Resend OTP?",
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: countdownTime.value > 0
                        ? Colors.grey.withOpacity(
                            0.3) // Correct color for disabled state
                        : theme.primaryColor
                            .withOpacity(0.8), // Active color when enabled
                  ),
                ),
              );
            }),
          ],
        ),
      ],
    );
  }
}
