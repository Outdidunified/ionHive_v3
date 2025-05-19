import 'dart:async'; // Required for Future.timeout, Future.wait, and TimeoutException
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
  final RxBool isArrowVisible = true.obs;
  final RxBool isLoading = false.obs;
  final RxBool hasInitialData = false.obs;
  final RxBool hasError = false.obs;
  final RxString errorMessage = ''.obs;

  final RxMap<String, dynamic> totalData = RxMap();
  final RxString totalSessions = '0'.obs;
  final RxString totalEnergy = '0.00 kWh'.obs;
  final RxString totalChargingTime = '0.00 hrs'.obs;
  final RxList<SessionHistoryItem> sessions = <SessionHistoryItem>[].obs;

  @override
  void onInit() {
    super.onInit();
    // Only listen for login changes; don't fetch data immediately
    ever(sessionController.isLoggedIn, (isLoggedIn) {
      if (isLoggedIn) {
        debugPrint(
            "SessionHistoryControllers: User logged in, ready to fetch data");
      } else {
        // Clear data when user logs out
        sessions.clear();
        totalSessions.value = '0';
        totalEnergy.value = '0.00 kWh';
        totalChargingTime.value = '0.00 hrs';
        hasInitialData.value = false;
      }
    });
  }

  void hideArrow() {
    isArrowVisible.value = false;
  }

  Future<void> fetchtotalsessions() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    debugPrint(
        "fetchtotalsessions - userId: $userId, emailId: $emailId, authToken: $authToken");

    if (emailId.isEmpty || authToken.isEmpty || userId == 0) {
      throw Exception('User details are incomplete');
    }

    final fetchResponseModel = await _fetchtotalsessioncountrep.fetchtotaldata(
        userId, emailId, authToken);

    debugPrint(
        "fetchtotalsessions response - success: ${!fetchResponseModel.error}, message: ${fetchResponseModel.message}, totalData: ${fetchResponseModel.totalData}");

    if (!fetchResponseModel.error) {
      if (fetchResponseModel.totalData != null) {
        totalData.value = fetchResponseModel.totalData!;
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
      }
    } else {
      throw Exception(fetchResponseModel.message);
    }
  }

  Future<void> fetchallsessiondetails() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    debugPrint(
        "fetchallsessiondetails - userId: $userId, emailId: $emailId, authToken: $authToken");

    if (emailId.isEmpty || authToken.isEmpty || userId == 0) {
      throw Exception('User details are incomplete');
    }

    final response = await _fetchtotalsessioncountrep.fetchallsessiondetails(
        userId, emailId, authToken);

    if (!response.error) {
      sessions.clear(); // Clear previous sessions
      if (response.sessions != null) {
        sessions.assignAll(response.sessions);
      }
      debugPrint("Fetched ${sessions.length} sessions");
    } else {
      throw Exception(response.message);
    }
  }

  Future<void> refreshAllData() async {
    if (isLoading.value) {
      debugPrint("Already loading, skipping refresh");
      return;
    }

    try {
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      debugPrint(
          "refreshAllData - userId: $userId, emailId: $emailId, authToken: $authToken");

      if (emailId.isEmpty || authToken.isEmpty || userId == 0) {
        CustomSnackbar.showError(message: "User details are incomplete");
        return;
      }

      hasError.value = false;
      errorMessage.value = '';

      isLoading.value = true;
      debugPrint("Starting data refresh");

      // Clear previous data to ensure UI updates
      sessions.clear();
      totalSessions.value = '0';
      totalEnergy.value = '0.00 kWh';
      totalChargingTime.value = '0.00 hrs';

      await Future.wait([
        fetchtotalsessions().timeout(Duration(seconds: 15), onTimeout: () {
          throw TimeoutException("Request timed out");
        }),
        fetchallsessiondetails().timeout(Duration(seconds: 15), onTimeout: () {
          throw TimeoutException("Request timed out");
        }),
      ]);

      hasInitialData.value = true;
      debugPrint("Data refresh completed successfully");
      debugPrint("Sessions count: ${sessions.length}");
    } catch (e) {
      debugPrint("refreshAllData error: $e");
      String errorMsg = "An error occurred while loading data.";
      if (e.toString().contains("Unable to reach the server")) {
        errorMsg = "Unable to connect to the server.";
      } else if (e is TimeoutException) {
        errorMsg = "Request timed out. Check your connection.";
      } else if (e is Exception) {
        errorMsg = e.toString();
      }

      errorMessage.value = errorMsg;
      if (!hasInitialData.value) {
        hasError.value = true;
      }
      CustomSnackbar.showError(message: errorMsg);
    } finally {
      isLoading.value = false;
      debugPrint("Loading state set to false");
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

      final message = await _fetchtotalsessioncountrep.downloadChargingSessionDetails(
        emailId,
        totalEnergy,
        authToken,
      );

      if (message == null) {
        CustomSnackbar.showSuccess(message: "Session details downloaded successfully");
      } else {
        CustomSnackbar.showWarning(message: message);
      }
    } catch (e) {
      debugPrint('Error downloading session details: $e');
      CustomSnackbar.showError(message: "Error: $e");
    }
  }



  Future<void> downloadInvoice(
      {required String sessionId, required String chargerId}) async {
    final authToken = sessionController.token.value;
    final emailId = sessionController.emailId.value;

    try {
      isLoading.value = true;
      await _fetchtotalsessioncountrep.downloadinvoice(
        emailId,
        int.parse(sessionId),
        authToken,
        chargerId,
      );
    } catch (e) {
      debugPrint('Error downloading invoice: $e');
      CustomSnackbar.showError(
          message: "Issue downloading invoice. Try again later.");
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    super.onClose();
    Get.closeAllSnackbars();
  }
}
