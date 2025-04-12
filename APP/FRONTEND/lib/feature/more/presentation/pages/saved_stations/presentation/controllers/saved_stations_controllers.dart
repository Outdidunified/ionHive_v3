import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/Saved_Device/domain/repository/saved_device_repoistory.dart';
import 'package:ionhive/feature/more/presentation/pages/saved_stations/domain/repository/saved_stations_repository.dart';

class SavedStationsControllers extends GetxController {
  final SavedStationsRepository _savedStationsRepository = SavedStationsRepository();
  final sessionController = Get.find<SessionController>();

  final RxBool isLoading = false.obs;
  final RxList<Map<String, dynamic>> savedStations = <Map<String, dynamic>>[].obs;
  final RxString errorMessage = ''.obs;

  // Map to track bookmark status for each station
  final RxMap<int, bool> bookmarkStatus = <int, bool>{}.obs;

  @override
  void onInit() {
    super.onInit();
    fetchSavedStations();
  }

  Future<void> fetchSavedStations() async {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    isLoading.value = true;
    errorMessage.value = '';

    try {
      final response = await _savedStationsRepository.fetchsavedstations(
          userId, emailId, authToken);
      print("fetching saved stations body: $response");

      if (response.success) {
        if (response.savedstation != null && response.savedstation!.isNotEmpty) {
          savedStations.assignAll(response.savedstation!);
          // Initialize bookmark status for all stations
          for (var station in savedStations) {
            bookmarkStatus[station['station_id']] = station['status'] ?? true;
          }
        } else {
          savedStations.clear();
        }
      } else {
        errorMessage.value = response.message ?? 'Failed to fetch stations';
      }
    } catch (e) {
      errorMessage.value = "Failed to fetch stations: ${e.toString()}";
      debugPrint("Error fetching stations: $e");
    } finally {
      isLoading.value = false;
    }
  }

  void toggleBookmark(int stationId, BuildContext context) {
    bookmarkStatus[stationId] = !(bookmarkStatus[stationId] ?? false);

    // Here you would typically also call an API to update the bookmark status on the server
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(bookmarkStatus[stationId]!
            ? 'Station bookmarked'
            : 'Bookmark removed'),
        duration: const Duration(seconds: 1),
      ),
    );
  }
}
