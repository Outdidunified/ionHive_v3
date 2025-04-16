import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/wallet%20/domain/models/wallet_model.dart';
import 'package:ionhive/feature/wallet%20/domain/repositories/wallet_repository.dart';

import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

class WalletController extends GetxController {
  final WalletRepository _walletRepository = WalletRepository();
  final sessionController = Get.find<SessionController>();

  final RxBool isLoading = false.obs;

  // Reactive variables for wallet data
  final RxString walletBalance = 'Rs.0'.obs; // Default value
  final RxString totalCredited = 'Rs.0'.obs; // Default value
  final RxString totalDebited = 'Rs.0'.obs; // Default value
  final RxInt creditedCount = 0.obs; // Default value
  final RxInt debitedCount = 0.obs; // Default value

  // Reactive variables for progress metrics
  final Rx<ProgressMetrics> progressMetrics = ProgressMetrics.empty().obs;

  @override
  void onInit() {
    super.onInit();
    debugPrint('WalletController onInit called');

    // Wait for session data to be loaded before fetching wallet balance
    ever(sessionController.isLoggedIn, (isLoggedIn) {
      debugPrint('Session login status changed: $isLoggedIn');
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

  Future<void> fetchwalletbalance() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    debugPrint(
        'Session data - userId: $userId, emailId: $emailId, token: ${authToken.isNotEmpty ? "exists" : "empty"}');

    if (emailId.isEmpty || authToken.isEmpty || userId == 0) {
      debugPrint('User details are incomplete, cannot fetch wallet balance');
      CustomSnackbar.showError(message: "User details are incomplete");
      isLoading.value = false;
      return;
    }

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
      } else {
        debugPrint("${response.message}");
      }
    } catch (e) {
      debugPrint("Error fetching wallet balance: $e");
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

  @override
  void onClose() {
    super.onClose();
    Get.closeAllSnackbars(); // Close all active snackbars
  }
}
