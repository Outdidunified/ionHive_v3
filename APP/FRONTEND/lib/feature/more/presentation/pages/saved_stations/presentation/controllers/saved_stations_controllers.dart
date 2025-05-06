import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/ChargingStation/presentation/controllers/Chargingstation_controllers.dart';
import 'package:ionhive/feature/more/presentation/pages/saved_stations/domain/repository/saved_stations_repository.dart';

class SavedStationsControllers extends GetxController {
  final SavedStationsRepository _savedStationsRepository =
      SavedStationsRepository();
  final sessionController = Get.find<SessionController>();
  late ChargingStationController chargingStationController;

  final RxBool isLoading = false.obs;
  final RxList<Map<String, dynamic>> savedStations =
      <Map<String, dynamic>>[].obs;
  final RxString errorMessage = ''.obs;

  // Map to track bookmark status for each station
  final RxMap<int, bool> bookmarkStatus = <int, bool>{}.obs;

  @override
  void onInit() {
    super.onInit();
    // Initialize ChargingStationController
    chargingStationController = Get.find<ChargingStationController>();
    fetchSavedStations();
  }

  Future<void> fetchSavedStations() async {
    debugPrint('hiii');
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    isLoading.value = true;
    errorMessage.value = '';

    try {
      final response = await _savedStationsRepository.fetchsavedstations(
          userId, emailId, authToken);

      if (response.success) {
        if (response.savedstation != null &&
            response.savedstation!.isNotEmpty) {
          savedStations.assignAll(response.savedstation!);
          debugPrint("responsesaved: $response");
          // Initialize bookmark status for all stations
          for (var station in savedStations) {
            bookmarkStatus[station['station_id']] = station['status'] ?? true;
          }
        } else {
          savedStations.clear();
        }
      } else {
        errorMessage.value = response.message;
      }
    } catch (e) {
      errorMessage.value = "Failed to fetch stations: ${e.toString()}";
      debugPrint("Error fetching stations: $e");
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> toggleBookmark(int stationId, BuildContext context) async {
    // Since this is SavedStationsPages, toggling the bookmark means removing the station
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    try {
      // Call removeStation from ChargingStationController
      await chargingStationController.removeStation(
          userId, emailId, authToken, stationId);

      // On success, remove the station from the savedStations list
      savedStations
          .removeWhere((station) => station['station_id'] == stationId);

      // Update bookmark status
      bookmarkStatus[stationId] = false;
    } catch (e) {
      // Error handling is already done in ChargingStationController via snackbar
      debugPrint('Error removing station: $e');
      // Optionally, revert the bookmark status if the removal fails
      bookmarkStatus[stationId] = true;
    }
  }
}
