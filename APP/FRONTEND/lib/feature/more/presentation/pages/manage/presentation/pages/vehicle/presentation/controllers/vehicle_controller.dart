import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/domain/models/vehicle_model.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/domain/repositories/vehicle_repository.dart';

class VehicleController extends GetxController {
  final VehicleRepository _vehicleRepository = VehicleRepository();
  final sessionController = Get.find<SessionController>();

  var vehicles = <VehicleModel>[].obs; // Stores saved vehicles
  var isLoading = false.obs;
  var errorMessage = ''.obs;
  var selectedCompany = "All".obs;
  late final TextEditingController searchController; // Use late to initialize in onInit
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

      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      print("Fetching saved vehicles for userId: $userId, emailId: $emailId");

      final response = await _vehicleRepository.fetchsavedvehicle(userId, emailId, authToken);
      print("Response: $response");

      if (response.error) {
        errorMessage(response.message ?? "Failed to fetch vehicles");
        print("Error: ${response.message}");
        throw Exception(response.message ?? "Failed to fetch vehicles");
      }

      vehicles.assignAll(response.vehicles); // Store vehicles in observable list

      // Convert to List<Map<String, dynamic>>
      final vehicleList = response.vehicles.map((vehicle) => {
        'vehicle_number': vehicle.vehicleNumber,
        'details': {
          'model': vehicle.model,
          'range': vehicle.range,
          'charger_type': vehicle.chargerType,
          'battery_size_kwh': vehicle.batterySizeKwh,
          'vehicle_company': vehicle.vehicleCompany,
          'image_base64': vehicle.imageUrl,
        },
      }).toList();

      print("Mapped vehicle list: $vehicleList");

      return vehicleList;
    } catch (e) {
      errorMessage("Error fetching vehicles: $e");
      print("Exception: $e");
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

  /// Removes a vehicle
  Future<bool> removeVehicle(String vehicleNumber) async {
    try {
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      print("Removing vehicle: $vehicleNumber for userId: $userId");

      // Call the actual remove API
      final response = await _vehicleRepository.fetchsavedvehicle(userId, emailId, vehicleNumber);

      if (!response.error) {
        // Remove the vehicle from the local list
        vehicles.removeWhere((vehicle) => vehicle.vehicleNumber == vehicleNumber);
        print("Vehicle removed successfully");
        return true;
      } else {
        print("Failed to remove vehicle: ${response.message}");
        return false;
      }
    } catch (e) {
      print("Error removing vehicle: $e");
      return false;
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
