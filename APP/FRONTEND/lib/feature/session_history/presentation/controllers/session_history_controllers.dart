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

  // Store fetched total session data
  RxMap<String, dynamic>? totalData = RxMap();

  final RxString totalSessions = '0'.obs; // Default value
  final RxString totalEnergy = '0'.obs; // Default value
  final RxString totalChargingTime = '0'.obs; // New field for totalChargingTime
  final RxList<SessionHistoryItem> sessions = <SessionHistoryItem>[].obs;

  @override
  void onInit() {
    super.onInit();
    // Initial data loading will be handled by the page
    // to ensure proper refresh when navigating back
  }

  @override
  void onReady() {
    super.onReady();
    // This ensures data is loaded when the controller is first created
    fetchtotalsessions();
    fetchallsessiondetails();
  }

  Future<void> fetchtotalsessions() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    // Only set loading to true if it's not already loading
    final bool wasLoading = isLoading.value;
    if (!wasLoading) {
      isLoading.value = true;
    }

    try {
      print("Fetching session history data...");
      final fetchResponseModel = await _fetchtotalsessioncountrep
          .fetchtotaldata(userId, emailId, authToken);
      print("Fetch response: ${fetchResponseModel.toJson()}");

      if (fetchResponseModel.success) {
        if (fetchResponseModel.totalData != null) {
          totalData?.value = fetchResponseModel.totalData!;

          // Format total sessions
          final sessions = fetchResponseModel.totalData!['totalSessions'];
          totalSessions.value = sessions != null ? sessions.toString() : '0';

          // Format total energy with 2 decimal places
          final energy = fetchResponseModel.totalData!['totalEnergyConsumed'];
          if (energy != null) {
            final energyNum = energy is num
                ? energy
                : double.tryParse(energy.toString()) ?? 0.0;
            totalEnergy.value = '${energyNum.toStringAsFixed(2)} kWh';
          } else {
            totalEnergy.value = '0.00 kWh';
          }

          // Format charging time with 2 decimal places
          final chargingTime =
              fetchResponseModel.totalData!['totalChargingTimeInHours'];
          if (chargingTime != null) {
            final timeNum = chargingTime is num
                ? chargingTime
                : double.tryParse(chargingTime.toString()) ?? 0.0;
            totalChargingTime.value = '${timeNum.toStringAsFixed(2)} hrs';
          } else {
            totalChargingTime.value = '0.00 hrs';
          }

          print(
              "Updated values - Sessions: ${totalSessions.value}, Energy: ${totalEnergy.value}, Time: ${totalChargingTime.value}");
        } else {
          print("Total session data is null");
          totalSessions.value = '0';
          totalEnergy.value = '0.00 kWh';
          totalChargingTime.value = '0.00 hrs';
          CustomSnackbar.showError(message: "No session data available");
        }
      } else {
        print("Fetch failed: ${fetchResponseModel.message}");
        CustomSnackbar.showError(message: fetchResponseModel.message);
      }
    } catch (e, stackTrace) {
      print("Error fetching session data: $e");
      print("Stack trace: $stackTrace");
      CustomSnackbar.showError(message: "Failed to fetch session data: $e");
    } finally {
      // Only set loading to false if we were the ones who set it to true
      if (!wasLoading) {
        isLoading.value = false;
      }
    }
  }

  Future<void> fetchallsessiondetails() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    // Only set loading to true if it's not already loading
    // This prevents flickering when both methods are called together
    final bool wasLoading = isLoading.value;
    if (!wasLoading) {
      isLoading.value = true;
    }

    sessions.clear(); // Clear previous data
    try {
      print("Fetching session details...");
      final response = await _fetchtotalsessioncountrep.fetchallsessiondetails(
          userId, emailId, authToken);

      if (response.success) {
        sessions.assignAll(response.sessions);
        print("Loaded ${sessions.length} sessions");
      } else {
        print("Failed to load sessions: ${response.message}");
        CustomSnackbar.showError(message: response.message);
      }
    } catch (e, stackTrace) {
      print("Error fetching session details: $e");
      print("Stack trace: $stackTrace");
      CustomSnackbar.showError(message: "Failed to load sessions");
    } finally {
      // Only set loading to false if we were the ones who set it to true
      if (!wasLoading) {
        isLoading.value = false;
      }
    }
  }

  /// Refreshes all data at once
  Future<void> refreshAllData() async {
    isLoading.value = true;
    try {
      // Run both requests in parallel
      await Future.wait([
        fetchtotalsessions(),
        fetchallsessiondetails(),
      ]);
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    super.onClose();
    Get.closeAllSnackbars(); // Close all active snackbars
  }
}
