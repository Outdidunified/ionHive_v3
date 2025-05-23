import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/domain/models/vehicle_model.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/domain/repositories/vehicle_repository.dart';

class VehicleController extends GetxController {
  final VehicleRepository _vehicleRepository = VehicleRepository();
  final sessionController = Get.find<SessionController>();
  var hasError = false.obs; // New error state

  var vehicles = <VehicleModel>[].obs; // Stores saved vehicles
  var isLoading = false.obs;
  var errorMessage = ''.obs;
  var selectedCompany = "All".obs;
  late final TextEditingController
      searchController; // Use late to initialize in onInit
  var searchTerm = ''.obs;
  var selectedModel = RxString(""); // Add this to track the selected model

  @override
  void onInit() {
    super.onInit();
    searchController = TextEditingController(); // Reinitialize on each init
  }

  /// Fetches saved vehicles for the user
  Future<List<Map<String, dynamic>>> fetchSavedVehicles() async {
    try {
      isLoading(true);
      errorMessage('');
      hasError.value = false; // Reset error state

      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      final response = await _vehicleRepository.fetchsavedvehicle(
          userId, emailId, authToken);

      if (response.error) {
        errorMessage(response.message ?? "Failed to fetch vehicles");
        debugPrint("Error: ${response.message}");
        throw Exception(response.message ?? "Failed to fetch vehicles");
      }

      vehicles
          .assignAll(response.vehicles); // Store vehicles in observable list

      // Convert to List<Map<String, dynamic>>
      final vehicleList = response.vehicles
          .map((vehicle) => {
                'vehicle_number': vehicle.vehicleNumber,
                'details': {
                  'model': vehicle.model,
                  'range': vehicle.range,
                  'charger_type': vehicle.chargerType,
                  'battery_size_kwh': vehicle.batterySizeKwh,
                  'vehicle_company': vehicle.vehicleCompany,
                  'image_base64': vehicle.imageUrl,
                },
              })
          .toList();

      return vehicleList;
    } catch (e) {
      errorMessage("Error fetching vehicles: $e");
      hasError.value = true; // Set error state on failure
      debugPrint("Exception: $e");
      throw Exception("Error fetching vehicles: $e");
    } finally {
      isLoading(false);
    }
  }

  void selectCompany(String company) {
    selectedCompany.value = company;
  }

  void setSearchTerm(String term) {
    searchTerm.value = term.toLowerCase();
  }

  void selectModel(String model) {
    selectedModel.value = model; // Update selected model
  }

  /// Refreshes the vehicle list from the server
  Future<void> refreshVehicles() async {
    try {
      await fetchSavedVehicles();
    } catch (e) {
      debugPrint("Error refreshing vehicles: $e");
    }
  }

  /// Sets the vehicle data from the snapshot
  void setVehicleData(List<Map<String, dynamic>> vehicleData) {
    try {
      refreshVehicles();
    } catch (e) {
      debugPrint("Error setting vehicle data: $e");
      errorMessage("Error setting vehicle data: $e");
    }
  }

  /// Removes a specific vehicle by its vehicle number
  /// Returns a Map with success status and message
  Future<Map<String, dynamic>> removeVehicle(String vehicleNumber) async {
    try {
      isLoading(true);
      errorMessage('');

      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      // Find the vehicle_id based on vehicleNumber
      final vehicleToRemove = vehicles.firstWhere(
        (vehicle) => vehicle.vehicleNumber == vehicleNumber,
        orElse: () => throw Exception("Vehicle not found"),
      );

      if (vehicleToRemove.id.isEmpty) {
        throw Exception("Invalid vehicle ID");
      }

      final vehicleId = vehicleToRemove.id; // Use 'id' from VehicleModel

      // Call the remove API
      final response = await _vehicleRepository.removevehiclerep(
          userId, emailId, authToken, int.parse(vehicleId), vehicleNumber);

      if (!response.error) {
        // Only remove the specific vehicle from the local list
        final indexToRemove = vehicles
            .indexWhere((vehicle) => vehicle.vehicleNumber == vehicleNumber);

        if (indexToRemove != -1) {
          // Remove only the specific vehicle
          vehicles.removeAt(indexToRemove);
        } else {
          debugPrint(
              "Vehicle was not found in local list after successful API call");
          // Refresh the list from server to ensure UI is in sync
          await refreshVehicles();
        }

        return {
          'success': true,
          'message': 'Vehicle removed successfully',
          'vehicleNumber': vehicleNumber
        };
      } else {
        errorMessage(response.message);
        debugPrint("Failed to remove vehicle: ${response.message}");
        return {
          'success': false,
          'message': response.message,
          'vehicleNumber': vehicleNumber
        };
      }
    } catch (e) {
      errorMessage("Error removing vehicle: $e");
      debugPrint("Error removing vehicle: $e");
      return {
        'success': false,
        'message': "Error removing vehicle: $e",
        'vehicleNumber': vehicleNumber
      };
    } finally {
      isLoading(false);
    }
  }

  void disposeController() {
    selectedCompany.value = "All";
    searchTerm.value = '';
    selectedModel.value = '';

    // Dispose of the TextEditingController
    searchController.dispose();

    super.onClose(); // Call the parent onClose method
  }

  @override
  void onClose() {
    disposeController(); // Call the custom dispose function
    // No additional logic needed here unless required
  }
}
