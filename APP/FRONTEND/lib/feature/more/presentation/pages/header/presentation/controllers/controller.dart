import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/header/domain/repositories/header_repository.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

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
    fetchHeaderData(); // Fetch all header data at once

    // fetchprofile(); // Fetch profile data on init
  }

  /// **Update profile API call**
  Future<void> updateProfile() async {
    String newUsername = usernameController.text.trim();
    String phoneNumberText = phoneNumberController.text.trim();

    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    // Basic validation - only username is required
    if (newUsername.isEmpty) {
      CustomSnackbar.showError(message: "Username cannot be empty");
      return;
    }

    // Convert phone number safely if provided, otherwise set to null
    int? newPhoneNumber;
    if (phoneNumberText.isNotEmpty) {
      try {
        newPhoneNumber = int.parse(phoneNumberText);
      } catch (e) {
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

      if (!authenticateResponse.error) {
        sessionController.username.value = newUsername;
        Get.back(); // Close modal
        phoneNumberController.clear();
        usernameController.clear();
        CustomSnackbar.showSuccess(message: "Profile updated successfully");
      } else {
        updateProfileValidationError.value = authenticateResponse.message;
        CustomSnackbar.showError(message: authenticateResponse.message);
      }
    } catch (e) {
      updateProfileValidationError.value = e.toString();
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
      CustomSnackbar.showError(message: "User details are incomplete");
      return;
    }

    isLoading.value = true;

    // Close any existing snackbars before starting new requests
    Get.closeAllSnackbars();

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
    usernameController.dispose();
    phoneNumberController.dispose();
    super.onClose();
    Get.closeAllSnackbars(); // Close all active snackbars
  }
}
