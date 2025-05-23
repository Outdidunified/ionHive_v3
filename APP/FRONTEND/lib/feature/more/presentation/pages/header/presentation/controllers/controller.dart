import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/header/domain/repositories/header_repository.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';
import 'package:ionhive/utils/widgets/snackbar/safe_snackbar.dart';

class HeaderController extends GetxController {
  final HeaderRepository _headerRepository = HeaderRepository();
  final sessionController = Get.find<SessionController>();

  // Text controllers for editing profile
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController phoneNumberController = TextEditingController();

  final RxBool isLoading = false.obs;
  final RxnString updateProfileValidationError = RxnString();
  final RxBool isFormValid = true.obs; // Track if the form is valid

  // Store fetched profile data
  RxMap<String, dynamic>? profileData = RxMap();

  final RxString walletBalance = 'Rs.0'.obs; // Default value
  final RxString totalsession = '0'.obs; // Default value

  @override
  void onInit() {
    super.onInit();
    fetchHeaderData(); // Fetch all header data at once

    // Add listeners to validate form
    usernameController.addListener(_validateForm);
    phoneNumberController.addListener(_validateForm);

    // fetchprofile(); // Fetch profile data on init
  }

  // Validate the form and update isFormValid
  void _validateForm() {
    final username = usernameController.text.trim();
    final phoneNumber = phoneNumberController.text.trim();

    // Username is required
    if (username.isEmpty) {
      isFormValid.value = false;
      return;
    }

    // Phone number validation (only if entered)
    if (phoneNumber.isNotEmpty) {
      if (!RegExp(r'^\d{10}$').hasMatch(phoneNumber)) {
        isFormValid.value = false;
        return;
      }
    }

    // If we get here, the form is valid
    isFormValid.value = true;

    // Clear any previous validation error
    if (updateProfileValidationError.value != null) {
      updateProfileValidationError.value = null;
    }
  }

  /// **Update profile API call**
  Future<void> updateProfile() async {
    String newUsername = usernameController.text.trim();
    String phoneNumberText = phoneNumberController.text.trim();
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    // Basic validation - username is required
    if (newUsername.isEmpty) {
      updateProfileValidationError.value = "Username cannot be empty";
      isFormValid.value = false;
      CustomSnackbar.showError(message: "Username cannot be empty");
      return;
    }

    // Phone number validation (only if entered)
    int? newPhoneNumber;
    if (phoneNumberText.isNotEmpty) {
      if (!RegExp(r'^\d{10}$').hasMatch(phoneNumberText)) {
        updateProfileValidationError.value = "Phone number must be 10 digits";
        isFormValid.value = false;
        CustomSnackbar.showError(message: "Phone number must be 10 digits");
        return;
      }

      try {
        newPhoneNumber = int.parse(phoneNumberText);
      } catch (e) {
        updateProfileValidationError.value = "Invalid phone number";
        isFormValid.value = false;
        CustomSnackbar.showError(message: "Invalid phone number");
        return;
      }
    }

    isLoading.value = true;
    try {
      final authenticateResponse = await _headerRepository.CompleteProfile(
        newUsername,
        userId,
        emailId,
        newPhoneNumber,
        authToken,
      );

      // Handle the "no changes found" message specifically
      if (authenticateResponse.message == "no changes found") {
        // Show the actual message from the backend
        Get.back(); // Close modal
        phoneNumberController.clear();
        usernameController.clear();
        CustomSnackbar.showInfo(message: authenticateResponse.message);
      } else if (!authenticateResponse.error) {
        sessionController.username.value = newUsername;
        Get.back(); // Close modal
        phoneNumberController.clear();
        usernameController.clear();
        CustomSnackbar.showSuccess(message: "Profile updated successfully");
      } else {
        updateProfileValidationError.value = authenticateResponse.message;
        isFormValid.value = false;
        CustomSnackbar.showError(message: authenticateResponse.message);
      }
    } catch (e) {
      updateProfileValidationError.value = e.toString();
      isFormValid.value = false;
      debugPrint("Error updating profile: $e");
      CustomSnackbar.showError(message: "$e");
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
      final fetchResponseModel =
          await _headerRepository.fetchprofile(userId, emailId, authToken);

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
        } else {
          CustomSnackbar.showError(message: "Profile data is null");
        }
      } else {
        debugPrint("Fetch failed: ${fetchResponseModel.message}");
      }
    } catch (e, stackTrace) {
      debugPrint("Error fetching profile: $e");
      debugPrint("Stack trace: $stackTrace");
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchwalletbalance() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    if (emailId.isEmpty || authToken.isEmpty || userId == 0) {
      CustomSnackbar.showError(message: "User details are incomplete");
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    try {
      final response = await _headerRepository.fetchwalletbalance(
          userId, emailId, authToken);

      if (!response.error) {
        final balance = response.walletBalance ?? '0';
        walletBalance.value = 'Rs.$balance'; // Update reactive variable
      }
    } catch (e) {
      debugPrint("Error fetching wallet balance: $e");
      // CustomSnackbar.showError(message: "Failed to fetch wallet balance: $e");
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchtotalsession() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    if (emailId.isEmpty || authToken.isEmpty || userId == 0) {
      CustomSnackbar.showError(message: "User details are incomplete");
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    try {
      final response = await _headerRepository.fetchtotalsessions(
          userId, emailId, authToken);

      if (!response.error) {
        final totalSesion = response.totalSessions ?? '0';
        totalsession.value = '$totalSesion'; // Update reactive variable
      }
    } catch (e) {
      debugPrint("Error fetching wallet balance: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// Fetch all header data in a single method to avoid multiple snackbars
  Future<void> fetchHeaderData() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    if (emailId.isEmpty || authToken.isEmpty || userId == 0) {
      SafeSnackbar.showError(message: "User details are incomplete");
      return;
    }

    isLoading.value = true;

    // Safely close any existing snackbars before starting new requests
    SafeSnackbar.closeAll();

    // Track errors for each API call
    List<String> errors = [];

    // Fetch wallet balance
    try {
      final walletResponse = await _headerRepository.fetchwalletbalance(
          userId, emailId, authToken);

      if (!walletResponse.error) {
        final balance = walletResponse.walletBalance ?? '0';
        walletBalance.value = 'Rs.$balance';
      } else {
        errors.add("Wallet: ${walletResponse.message ?? 'Unknown error'}");
      }
    } catch (e) {
      debugPrint("Error fetching wallet balance: $e");
      errors.add("Wallet: ${e.toString()}");
    }

    // Fetch total sessions
    try {
      final sessionResponse = await _headerRepository.fetchtotalsessions(
          userId, emailId, authToken);

      if (!sessionResponse.error) {
        final totalSesion = sessionResponse.totalSessions ?? '0';
        totalsession.value = '$totalSesion';
      } else {
        errors.add("Sessions: ${sessionResponse.message ?? 'Unknown error'}");
      }
    } catch (e) {
      debugPrint("Error fetching total sessions: $e");
      errors.add("Sessions: ${e.toString()}");
    }

    isLoading.value = false;
  }

  @override
  void onClose() {
    // Remove listeners before disposing
    usernameController.removeListener(_validateForm);
    phoneNumberController.removeListener(_validateForm);

    // Dispose controllers
    usernameController.dispose();
    phoneNumberController.dispose();

    super.onClose();
    SafeSnackbar.closeAll(); // Safely close all active snackbars
  }
}
