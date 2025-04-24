import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';
import 'package:ionhive/feature/session_history/domain/repositories/session_history_repository.dart';
import '../../domain/models/session_history_model.dart';

class SessionHistoryControllers extends GetxController {
  final Fetchtotalsessioncountrep _fetchtotalsessioncountrep =
      Fetchtotalsessioncountrep();
  final SessionController sessionController = Get.find<SessionController>();

  final RxBool isLoading = false.obs;
  final RxBool hasInitialData = false.obs;
  final RxBool hasError = false.obs;
  final RxString errorMessage = ''.obs;

  // Store fetched total session data
  RxMap<String, dynamic>? totalData = RxMap();

  final RxString totalSessions = '0'.obs; // Default value
  final RxString totalEnergy = '0.00 kWh'.obs; // Default value with unit
  final RxString totalChargingTime = '0.00 hrs'.obs; // Default value with unit
  final RxList<SessionHistoryItem> sessions = <SessionHistoryItem>[].obs;

  @override
  void onInit() {
    super.onInit();

    try {
      // Listen for changes in the session controller's login status
      ever(sessionController.isLoggedIn, (isLoggedIn) {
        if (isLoggedIn) {
          // Delay the refresh to avoid blocking the UI thread
          Future.delayed(Duration(milliseconds: 500), () {
            refreshAllData();
          });
        }
      });

      // Trigger initial data fetch if already logged in
      if (sessionController.isLoggedIn.value) {
        // Delay the initial fetch to avoid blocking the UI thread
        Future.delayed(Duration(milliseconds: 500), () {
          refreshAllData();
        });
      }
    } catch (e) {
      debugPrint('SessionHistoryControllers: Error in onInit: $e');
    }
  }

  Future<void> fetchtotalsessions() async {
    try {
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      if (emailId.isEmpty || authToken.isEmpty || userId == 0) {
        throw Exception('User details are incomplete');
      }

      final fetchResponseModel = await _fetchtotalsessioncountrep
          .fetchtotaldata(userId, emailId, authToken);

      if (fetchResponseModel.success) {
        if (fetchResponseModel.totalData != null) {
          totalData?.value = fetchResponseModel.totalData!;

          totalSessions.value =
              fetchResponseModel.totalData!['totalSessions']?.toString() ?? '0';
          final energy = fetchResponseModel.totalData!['totalEnergyConsumed'];
          totalEnergy.value = energy != null
              ? '${(energy is num ? energy : double.tryParse(energy.toString()) ?? 0.0).toStringAsFixed(2)} kWh'
              : '0.00 kWh';
          final chargingTime =
              fetchResponseModel.totalData!['totalChargingTimeInHours'];
          totalChargingTime.value = chargingTime != null
              ? '${(chargingTime is num ? chargingTime : double.tryParse(chargingTime.toString()) ?? 0.0).toStringAsFixed(2)} hrs'
              : '0.00 hrs';
        } else {
          totalSessions.value = '0';
          totalEnergy.value = '0.00 kWh';
          totalChargingTime.value = '0.00 hrs';
          CustomSnackbar.showError(message: "No session data available");
        }
      } else {
        throw Exception(fetchResponseModel.message);
      }
    } catch (e) {
      debugPrint("Error fetching total sessions: $e");
      rethrow; // Propagate error to be handled by refreshAllData
    }
  }

  Future<void> fetchallsessiondetails() async {
    try {
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      if (emailId.isEmpty || authToken.isEmpty || userId == 0) {
        throw Exception('User details are incomplete');
      }

      final response = await _fetchtotalsessioncountrep.fetchallsessiondetails(
          userId, emailId, authToken);

      if (response.success) {
        sessions.assignAll(response.sessions);
      } else {
        throw Exception(response.message);
      }
    } catch (e) {
      debugPrint("Error fetching session details: $e");
      rethrow; // Propagate error to be handled by refreshAllData
    }
  }

  /// Refreshes all data at once with synchronized loading state
  Future<void> refreshAllData() async {
    try {
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
        // Run both requests in parallel and wait for all to complete
        await Future.wait([fetchtotalsessions(), fetchallsessiondetails()]);

        // Set hasInitialData to true after first successful data load
        if (!hasInitialData.value) {
          hasInitialData.value = true;
        }
      } catch (e) {
        debugPrint("SessionHistoryControllers: refreshAllData error: $e");

        // Determine the error message based on the exception
        String errorMsg =
            "An error occurred while loading data. Please try again later.";
        if (e.toString().contains("Unable to reach the server")) {
          errorMsg = "Unable to connect to the server. Please try again later.";
        } else if (e is Exception) {
          errorMsg = e.toString(); // Use the exception message if available
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
    } catch (e) {
      debugPrint(
          "SessionHistoryControllers: Unexpected error in refreshAllData: $e");
      isLoading.value = false;
    }
  }

  double _calculateTotalEnergy() {
    return sessions.fold(0.0, (sum, session) => sum + session.unitConsumed);
  }

  Future<void> downloadSessionDetails() async {
    final authToken = sessionController.token.value;
    final emailId = sessionController.emailId.value;

    try {
      final totalEnergy = _calculateTotalEnergy();

      await _fetchtotalsessioncountrep.downloadChargingSessionDetails(
        emailId,
        totalEnergy,
        authToken,
      );
    } catch (e) {
      debugPrint('Error downloading session details: $e');
      CustomSnackbar.showError(
        message:
            "Issue in downloading session details \nPlease try again later",
      );
    }
  }

  @override
  void onClose() {
    super.onClose();
    Get.closeAllSnackbars(); // Close all active snackbars
  }
}
