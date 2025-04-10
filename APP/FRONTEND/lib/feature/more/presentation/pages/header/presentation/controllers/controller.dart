import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/header/domain/repositories/header_repository.dart';

class HeaderController extends GetxController {
  final HeaderRepository _headerRepository = HeaderRepository();
  final sessionController = Get.find<SessionController>();

  // Text controllers for editing profile
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController phoneNumberController = TextEditingController();

  final RxBool isLoading = false.obs;
  final RxnString updateProfileValidationError = RxnString();

  // Store fetched profile data
  RxMap<String, dynamic>? profileData = RxMap();

  final RxString walletBalance = 'Rs.0'.obs; // Default value
  final RxString totalsession = '0'.obs; // Default value

  @override
  void onInit() {
    super.onInit();
    fetchwalletbalance(); // Fetch wallet balance on init
    fetchtotalsession();

    // fetchprofile(); // Fetch profile data on init
  }

  /// **Update profile API call**
  Future<void> updateProfile() async {
    String newUsername = usernameController.text.trim();
    String phoneNumberText = phoneNumberController.text.trim();

    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    // Basic validation
    if (newUsername.isEmpty || phoneNumberText.isEmpty) {
      Get.snackbar("Note", "Fields cannot be empty",
          backgroundColor: Colors.red, colorText: Colors.white);
      return;
    }

    // Convert phone number safely
    int? newPhoneNumber;
    try {
      newPhoneNumber = int.parse(phoneNumberText);
    } catch (e) {
      Get.snackbar("Note", "Invalid phone number",
          backgroundColor: Colors.red, colorText: Colors.white);
      return;
    }

    isLoading.value = true;
    try {
      print(
          "Updating profile with: username=$newUsername, phoneNumber=$newPhoneNumber");
      final authenticateResponse = await _headerRepository.CompleteProfile(
        newUsername,
        userId,
        emailId,
        newPhoneNumber,
        authToken,
      );

      print("API Response: ${authenticateResponse.toJson()}");

      if (!authenticateResponse.error) {
        sessionController.username.value = newUsername;
        Get.back(); // Close modal
        phoneNumberController.clear();
        usernameController.clear();
        Get.snackbar("Success", "Profile updated successfully",
            backgroundColor: Colors.green, colorText: Colors.white);
      } else {
        updateProfileValidationError.value = authenticateResponse.message;
        Get.snackbar("Error", authenticateResponse.message,
            backgroundColor: Colors.red, colorText: Colors.white);
      }
    } catch (e) {
      updateProfileValidationError.value = e.toString();
      debugPrint("Error updating profile: $e");
      Get.snackbar("Error", "$e",
          backgroundColor: Colors.red, colorText: Colors.white);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchprofile() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    isLoading.value = true;
    try {
      print("Fetching profile...");
      final fetchResponseModel =
          await _headerRepository.fetchprofile(userId, emailId, authToken);

      print("Fetch response: ${fetchResponseModel.toJson()}");

      if (fetchResponseModel.success) {
        if (fetchResponseModel.profile != null) {
          profileData?.value =
              fetchResponseModel.profile!; // Store profile data

          // Update username if available and not null
          usernameController.text =
              fetchResponseModel.profile!['username'] ?? '';

          // Update phone number if available and not null
          phoneNumberController.text =
              fetchResponseModel.profile!['phone_no']?.toString() ?? '';

          // Print fetched values for debugging
          print("Fetched Username: ${fetchResponseModel.profile!['username']}");
          print(
              "Fetched Phone Number: ${fetchResponseModel.profile!['phone_no']}");

          // // Show fetched values in a snackbar
          // Get.snackbar(
          //   "Fetched Profile",
          //   "Username: ${fetchResponseModel.profile!['username'] ?? 'N/A'}\n"
          //       "Phone Number: ${fetchResponseModel.profile!['phone_no']?.toString() ?? 'N/A'}",
          //   backgroundColor: Colors.green,
          //   colorText: Colors.white,
          //   duration: Duration(seconds: 5),
          // );
        } else {
          print("Profile data is null");
          Get.snackbar(
            "Error",
            "Profile data is null",
            backgroundColor: Colors.red,
            colorText: Colors.white,
          );
        }
      } else {
        print("Fetch failed: ${fetchResponseModel.message}");
        Get.snackbar(
          "Error",
          fetchResponseModel.message,
          backgroundColor: Colors.red,
          colorText: Colors.white,
        );
      }
    } catch (e, stackTrace) {
      print("Error fetching profile: $e");
      print("Stack trace: $stackTrace");
      Get.snackbar(
        "Error",
        "Failed to fetch profile: $e",
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchwalletbalance() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    if (emailId.isEmpty || authToken.isEmpty || userId == 0) {
      Get.snackbar(
        "Error",
        "User details are incomplete",
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    try {
      print("Fetching wallet balance...");
      final response = await _headerRepository.fetchwalletbalance(
          userId, emailId, authToken);

      print("Wallet balance response: $response");

      if (!response.error) {
        final balance = response.walletBalance ?? '0';
        walletBalance.value = 'Rs.$balance'; // Update reactive variable
        print("Wallet Balance: $walletBalance");
        // Get.snackbar(
        //   "Success",
        //   "Wallet balance fetched successfully: $walletBalance",
        //   backgroundColor: Colors.green,
        //   colorText: Colors.white,
        // );
      } else {
        Get.snackbar(
          "Error",
          response.message ?? "Unknown error",
          backgroundColor: Colors.red,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      debugPrint("Error fetching wallet balance: $e");
      Get.snackbar(
        "Error",
        "Failed to fetch wallet balance: $e",
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchtotalsession() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    if (emailId.isEmpty || authToken.isEmpty || userId == 0) {
      Get.snackbar(
        "Error",
        "User details are incomplete",
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    try {
      print("Fetching wallet balance...");
      final response = await _headerRepository.fetchtotalsessions(
          userId, emailId, authToken);

      print("Total session response: $response");

      if (!response.error) {
        final totalSesion = response.totalSessions ?? '0';
        totalsession.value = '$totalSesion'; // Update reactive variable
        print(" totalsession: $totalsession");
        // Get.snackbar(
        //   "Success",
        //   "Wallet balance fetched successfully: $walletBalance",
        //   backgroundColor: Colors.green,
        //   colorText: Colors.white,
        // );
      } else {
        Get.snackbar(
          "Error",
          response.message ?? "Unknown error",
          backgroundColor: Colors.red,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      debugPrint("Error fetching wallet balance: $e");
      Get.snackbar(
        "Error",
        "Failed to fetch session history: $e",
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    usernameController.dispose();
    phoneNumberController.dispose();
    super.onClose();
    Get.closeAllSnackbars(); // Close all active snackbars
  }
}
