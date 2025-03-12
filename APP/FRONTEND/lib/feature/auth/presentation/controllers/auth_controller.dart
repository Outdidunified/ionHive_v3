import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart'; // Session Controller
import 'package:ionhive/feature/auth/domain/repositories/auth_repository.dart'; // Auth Repository
import 'package:ionhive/feature/auth/presentation/pages/otp_page.dart'; // OTP Page
import 'package:ionhive/feature/landing_page.dart'; // Laning pages

import 'package:ionhive/utils/log/logger.dart'; // Debug Logger

import 'package:google_sign_in/google_sign_in.dart'; // package for google_sign_in
import 'package:sign_in_with_apple/sign_in_with_apple.dart'; // package for appleID_sign_in

class AuthController extends GetxController {
  final AuthRepository _authRepository = AuthRepository();
  final TextEditingController emailController = TextEditingController();
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile', 'openid'],
  ); //NOTE - Whant to check the Idtoken {null}
  final otpController = TextEditingController();
  final otpValidationError =
      RxnString(); // Nullable String to hold validation error

  Rx<String?> validationError = Rx<String?>(null);

  final RxBool isLoading = false.obs;
  final RxBool isChecked = true.obs;

  String? validateEmail() {
    final email = emailController.text;
    final emailRegex = RegExp(r"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$");

    if (email.isEmpty) {
      return 'Please enter an email address.';
    } else if (!emailRegex.hasMatch(email)) {
      return 'Please enter a valid email address.';
    }

    return null;
  }

  String? validateOtp() {
    final otp = otpController.text.trim();

    if (otp.isEmpty) {
      return "OTP cannot be empty";
    }
    if (otp.length != 6) {
      return "OTP must be 6 digits";
    }
    return null;
  }

  // Logic for "Get OTP" button  // - Completed
  Future<void> handleGetOTP() async {
    final email = emailController.text;

    // Validate input
    final emailValidationError = validateEmail();
    if (emailValidationError != null) {
      validationError.value =
          emailValidationError; // Show email validation error immediately
      return;
    }

    // Clear any previous validation errors before starting the OTP request
    validationError.value = null;

    isLoading.value = true;
    try {
      final otpResponse = await _authRepository.GetOTP(email);

      if (!otpResponse.error) {
        // Check the 'error' field
        Get.to(() => OtpPage(email: email));
      } else {
        debugPrint("Error: ${otpResponse.message}}");

        validationError.value = otpResponse.message; // Show error message
      }
    } catch (e) {
      // validationError.value = "Something went wrong! Please Try Again later";
      validationError.value = e.toString(); // Show actual error message

      debugPrint("Error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  // Logic for "Resend OTP" button  // - Completed
  Future<void> resendOtp() async {
    final email = emailController.text;

    // Validate input
    validationError.value = validateEmail();
    if (validationError.value != null) {
      return;
    }

    isLoading.value = true;
    try {
      final otpResponse = await _authRepository.GetOTP(email);

      if (!otpResponse.error) {
        // Check the 'error' field
        Get.to(() => OtpPage(email: email));
      } else {
        validationError.value = otpResponse.message; // Show error message
      }
    } catch (e) {
      validationError.value = e.toString(); // Show actual error message
      debugPrint("Error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  // Authenticate OTP Function  // - Completed
  Future<void> authenticateOTPandHandleLogin() async {
    final email = emailController.text;
    final otpText = otpController.text;

    // Validate email input
    validationError.value = validateEmail();
    if (validationError.value != null) {
      return;
    }

    // Convert OTP to integer
    int? otp;
    try {
      otp = int.parse(otpText);
    } catch (e) {
      otpValidationError.value =
          'Invalid OTP format. Please enter numbers only.';
      return;
    }

    isLoading.value = true;
    try {
      // Call API to authenticate OTP
      final authenticateResponse =
          await _authRepository.authenticateOTP(email, otp);

      if (!authenticateResponse.error) {
        // Extract data from the response
        final token = authenticateResponse.token;
        final userId = authenticateResponse.data?['user_id'];
        final emailId = authenticateResponse.data?['email_id'];
        final username = authenticateResponse.data?['username'];
        debugPrint("Session $username || $emailId || $username ");

        // Save session details
        final sessionController = Get.find<SessionController>();
        await sessionController.saveSession(
          userId: userId,
          emailId: emailId,
          username: username,
          token: token!,
        );

        // Clear OTP input
        otpController.clear();

        // Navigate to the landing page
        Get.offAll(() => LandingPage());
      } else {
        otpValidationError.value = authenticateResponse.message;
      }
    } catch (e) {
      otpValidationError.value = e.toString(); // Show actual error message
      debugPrint("Error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  // SignIN with the Google Authenticator //NOTE - want to check
  Future<void> handleGoogleSignIn() async {
    // Check if the terms and conditions are accepted
    if (!isChecked.value) {
      Get.snackbar(
        'Verification failed',
        "Please accept the terms and conditions.",
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Get.isDarkMode
            ? Colors.red.withOpacity(0.7) // Dark mode background color
            : Colors.red.withOpacity(0.9), // Light mode background color
        colorText: Get.isDarkMode
            ? Colors.white // Dark mode text color
            : Colors.white, // Light mode text color
        duration: const Duration(seconds: 3),
      );
      return;
    }
    debugPrint("--------------------  googleUser 1 --------------------");

    try {
      debugPrint("--------------------  googleUser 2 --------------------");

      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      debugPrint(
          "--------------------  googleUser: $googleUser --------------------");

      if (googleUser != null) {
        final GoogleSignInAuthentication googleAuth =
            await googleUser.authentication;
        debuglogForLoadINFO(
            "------------- Google Auth Info: $googleAuth --------------------");
        debuglogForLoadINFO(
            "Google User Info: ${googleUser.email}, ${googleUser.displayName}");
        debuglogForLoadINFO(
            "Authentication: ${googleAuth.accessToken}, ${googleAuth.idToken}");

        if (googleAuth.accessToken != null) {
          debuglogForLoadINFO("Access Token: ${googleAuth.accessToken}");
        } else {
          debuglogError("Access Token is null.");
        }

        if (googleAuth.idToken != null) {
          debuglogForLoadINFO("ID Token: ${googleAuth.idToken}");
        } else {
          debuglogError("ID Token is null. Please check configuration.");
        }

        // Get ID Token
        final String? idToken = googleAuth.idToken;

        if (idToken != null) {
          // Call API to authenticate OTP
          final GoogleSignInResponse =
              await _authRepository.GoogleSignIN(idToken);

          if (!GoogleSignInResponse.error) {
            // Extract data from the response
            final token = GoogleSignInResponse.token;
            final userId = GoogleSignInResponse.data?['user_id'];
            final emailId = GoogleSignInResponse.data?['email_id'];
            final username = GoogleSignInResponse.data?['username'];

            // Save session details
            final sessionController = Get.find<SessionController>();
            await sessionController.saveSession(
              userId: userId,
              emailId: emailId,
              username: username,
              token: token!,
            );

            // Navigate to the landing page
            Get.offAll(() => LandingPage());
          } else {
            Get.snackbar(
                "Login Verification Failed", GoogleSignInResponse.message,
                snackPosition: SnackPosition.BOTTOM);
          }
        } else {
          debugPrint(
              "-------------------- Token Not found,  TOKEN: $idToken --------------------------------");
        }
      }
    } catch (error) {
      debugPrint(
          "--------------- Error: $error --------------------------------");
      Get.snackbar(
        "Login Verification Failed",
        "Something went wrong ,Please Try Again Later",
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  // SignIN with the Apple ID Authenticator //NOTE - want to check and add the Apple ID Authenticator
  Future<void> handleAppleSignIn() async {
    // Check if the terms and conditions are accepted
    if (!isChecked.value) {
      Get.snackbar(
        'Verification failed',
        "Please accept the terms and conditions.",
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Get.isDarkMode
            ? Colors.red.withOpacity(0.7) // Dark mode background color
            : Colors.red.withOpacity(0.9), // Light mode background color
        colorText: Get.isDarkMode
            ? Colors.white // Dark mode text color
            : Colors.black, // Light mode text color
        duration: const Duration(seconds: 3),
      );
      return;
    }
    try {
      // Perform the sign-in flow using the sign_in_with_apple package
      final AuthorizationCredentialAppleID credential =
          await SignInWithApple.getAppleIDCredential(
        scopes: [
          // Uncomment and use if you need email and full name
          // AppleIDAuthorizationScope.email,
          // AppleIDAuthorizationScope.fullName,
        ],
      );

      // You can now use the credential (it includes the email, full name, and authorization code)
      final String idToken = credential.identityToken!;

      if (idToken != null) {
        // Call API to authenticate OTP
        final appleSignInResponse = await _authRepository.AppleSignIN(idToken);

        if (!appleSignInResponse.error) {
          // Extract data from the response
          final token = appleSignInResponse.token;
          final userId = appleSignInResponse.data?['user_id'];
          final emailId = appleSignInResponse.data?['email_id'];
          final username = appleSignInResponse.data?['username'];

          // Save session details
          final sessionController = Get.find<SessionController>();
          await sessionController.saveSession(
            userId: userId,
            emailId: emailId,
            username: username,
            token: token!,
          );

          // Navigate to the landing page
          Get.offAll(() => LandingPage());
        } else {
          Get.snackbar(
            "Login Verification Failed",
            appleSignInResponse.message,
            snackPosition: SnackPosition.BOTTOM,
          );
        }
      }
    } catch (error) {
      debugPrint("Error: $error");
      Get.snackbar(
        "Login Verification Failed",
        "Something went wrong ,Please Try Again Later",
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  // This is the onInit lifecycle method of the GetxController
  @override
  void onInit() {
    super.onInit();
    // Reset validation error
    validationError.value = null;
    emailController.clear();
  }

  // This is the dispose lifecycle method of the GetxController
  @override
  void dispose() {
    emailController.dispose();
    super.dispose();
  }
}
