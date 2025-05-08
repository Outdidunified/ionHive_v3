import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/wallet/domain/models/wallet_model.dart';
import 'package:ionhive/feature/wallet/domain/repositories/wallet_repository.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

class WalletController extends GetxController {
  final WalletRepository _walletRepository = WalletRepository();
  final sessionController = Get.find<SessionController>();

  final RxBool isLoading = false.obs;
  final RxBool hasInitialData = false.obs;
  final RxBool hasError = false.obs;
  final RxString errorMessage = ''.obs;

  // Reactive variables for wallet data
  final RxString walletBalance = 'Rs.0'.obs; // Default value
  final RxString totalCredited = 'Rs.0'.obs; // Default value
  final RxString totalDebited = 'Rs.0'.obs; // Default value
  final RxInt creditedCount = 0.obs; // Default value
  final RxInt debitedCount = 0.obs; // Default value

  // Reactive variables for progress metrics
  final Rx<ProgressMetrics> progressMetrics = ProgressMetrics.empty().obs;

  // Flag to track if a balance update is in progress
  final RxBool isUpdating = false.obs;

  @override
  void onInit() {
    super.onInit();

    // Wait for session data to be loaded before fetching wallet balance
    ever(sessionController.isLoggedIn, (isLoggedIn) {
      if (isLoggedIn) {
        fetchwalletbalance();
      }
    });

    // Also check if already logged in
    if (sessionController.isLoggedIn.value) {
      debugPrint('Already logged in, fetching wallet balance');
      fetchwalletbalance();
    }
  }

  /// Refreshes wallet data with synchronized loading state
  Future<void> fetchwalletbalance() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    if (emailId.isEmpty || authToken.isEmpty || userId == 0) {
      CustomSnackbar.showError(message: "User details are incomplete");
      isLoading.value = false;
      return;
    }

    // Reset error state
    hasError.value = false;
    errorMessage.value = '';

    isLoading.value = true;
    try {
      final response = await _walletRepository.fetchwalletbalance(
          userId, emailId, authToken);

      if (!response.error) {
        // Format the values with 2 decimal places
        final balance = response.walletBalance ?? 0.0;
        final credited = response.totalCredited ?? 0.0;
        final debited = response.totalDebited ?? 0.0;
        final creditedCountValue = response.creditedCount ?? 0;
        final debitedCountValue = response.debitedCount ?? 0;

        // Update reactive variables
        walletBalance.value = 'Rs.${balance.toStringAsFixed(2)}';
        totalCredited.value = 'Rs.${credited.toStringAsFixed(2)}';
        totalDebited.value = 'Rs.${debited.toStringAsFixed(2)}';
        creditedCount.value = creditedCountValue;
        debitedCount.value = debitedCountValue;

        // Update progress metrics if available
        if (response.progressMetrics != null) {
          progressMetrics.value = response.progressMetrics!;
        }

        // Set hasInitialData to true after first successful data load
        if (!hasInitialData.value) {
          hasInitialData.value = true;
        }
      } else {
        throw Exception(response.message);
      }
    } catch (e) {
      debugPrint("WalletController: fetchwalletbalance error: $e");

      // Determine the error message based on the exception
      String errorMsg =
          "An error occurred while loading data. Please try again later.";
      if (e.toString().contains("Unable to reach the server")) {
        errorMsg = "Unable to connect to the server. Please try again later.";
      } else if (e is Exception) {
        errorMsg = e.toString().replaceAll(
            "Exception: ", ""); // Use the exception message if available
      }

      // Update error state and message
      errorMessage.value = errorMsg;

      // Only show error UI if we don't have any data yet
      if (!hasInitialData.value) {
        hasError.value = true;
        CustomSnackbar.showError(message: errorMsg);
      } else {
        // If we already have data, show a snackbar with the specific error
        CustomSnackbar.showError(message: errorMsg);
      }
    } finally {
      isLoading.value = false;
    }
  }

  // Helper methods to get formatted progress metric values
  String getMonthlyChargingGoalText() {
    final metric = progressMetrics.value.monthlyChargingGoal;
    return '${metric.current.toStringAsFixed(0)} ${metric.unit} / ${metric.target.toStringAsFixed(0)} ${metric.unit}';
  }

  String getEnergySavingsText() {
    final metric = progressMetrics.value.energySavings;
    return '${metric.unit}${metric.current.toStringAsFixed(0)} / ${metric.unit}${metric.target.toStringAsFixed(0)}';
  }

  String getCarbonFootprintReductionText() {
    final metric = progressMetrics.value.carbonFootprintReduction;
    return '${metric.current.toStringAsFixed(0)} ${metric.unit} / ${metric.target.toStringAsFixed(0)} ${metric.unit}';
  }

  double getMonthlyChargingGoalProgress() {
    return progressMetrics.value.monthlyChargingGoal.percentage / 100;
  }

  double getEnergySavingsProgress() {
    return progressMetrics.value.energySavings.percentage / 100;
  }

  double getCarbonFootprintReductionProgress() {
    return progressMetrics.value.carbonFootprintReduction.percentage / 100;
  }

  /// Updates the wallet balance directly after a successful payment
  /// This is faster than fetching from the server and provides immediate feedback
  void updateBalanceAfterPayment(double amount) {
    try {
      // Parse current balance
      final currentBalanceStr =
          walletBalance.value.replaceAll('Rs.', '').trim();
      final currentBalance = double.tryParse(currentBalanceStr) ?? 0.0;

      // Calculate new balance
      final newBalance = currentBalance + amount;

      // Update the balance
      walletBalance.value = 'Rs.${newBalance.toStringAsFixed(2)}';

      // Update credited amount
      final currentCreditedStr =
          totalCredited.value.replaceAll('Rs.', '').trim();
      final currentCredited = double.tryParse(currentCreditedStr) ?? 0.0;
      totalCredited.value =
          'Rs.${(currentCredited + amount).toStringAsFixed(2)}';

      // Update credited count
      creditedCount.value = creditedCount.value + 1;

      // Set hasInitialData to true if it wasn't already
      if (!hasInitialData.value) {
        hasInitialData.value = true;
      }

      debugPrint('Wallet balance updated locally to: ${walletBalance.value}');

      // Fetch the actual balance from server in the background
      // This ensures the UI is updated immediately while also ensuring data consistency
      _fetchBalanceInBackground();
    } catch (e) {
      debugPrint('Error updating balance locally: $e');
      // If local update fails, fall back to server fetch
      fetchwalletbalance();
    }
  }

  /// Fetches the wallet balance from the server in the background
  /// This ensures data consistency after a local update
  Future<void> _fetchBalanceInBackground() async {
    // Avoid multiple simultaneous background updates
    if (isUpdating.value) return;

    isUpdating.value = true;
    try {
      // Add a small delay to ensure the payment has been processed on the server
      await Future.delayed(const Duration(seconds: 2));
      await fetchwalletbalance();
    } catch (e) {
      debugPrint('Background balance update failed: $e');
    } finally {
      isUpdating.value = false;
    }
  }

  @override
  void onClose() {
    debugPrint('WalletController: onClose called');
    super.onClose();
    Get.closeAllSnackbars(); // Close all active snackbars
  }
}
