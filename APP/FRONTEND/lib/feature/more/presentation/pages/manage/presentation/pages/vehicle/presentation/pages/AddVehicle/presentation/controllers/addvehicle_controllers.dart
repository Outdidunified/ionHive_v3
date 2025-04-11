import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/controllers/vehicle_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/AddVehicle/domain/repositories/addvehicle_repository.dart';

import '../../domain/model/addvehicle_model.dart';

class AddvehicleControllers extends GetxController {
  final AddVehicleRepository _vehicleRepository = AddVehicleRepository();
  final sessionController = Get.find<SessionController>();
  final vehicles = <Map<String, dynamic>>[].obs;
  var vehicleModels =
      <VehicleModelData>[].obs; // ✅ Fix: Match the actual data type
  var isLoading = false.obs;
  var errorMessage = ''.obs;
  var selectedCompany = "All".obs;
  late final TextEditingController
      searchController; // Use late to initialize in onInit
  var searchTerm = ''.obs;
  var selectedModel = RxString(""); // Add this to track the selected model
  // Vehicle number sheet controls
  final vehicleNumberController = TextEditingController();
  final vehicleNumber = ''.obs;
  final isVehicleNumberValid = false.obs;
  final selectedVehicleModel =
      Rx<VehicleModelData?>(null); // Stores full model data

  @override
  void onInit() {
    super.onInit();
    fetchAllVehicleModel();
    searchController = TextEditingController();
    // Initialize vehicles if needed
  }

// In your controller
  void setVehicles(List<Map<String, dynamic>> vehiclesList) {
    if (vehiclesList == null || vehiclesList.isEmpty) {
      vehicles.clear();
    } else {
      vehicles.value = vehiclesList;
    }
  }

  /// Fetches all available vehicle models
  Future<void> fetchAllVehicleModel() async {
    try {
      isLoading(true);
      errorMessage('');

      final authToken = sessionController.token.value;
      final response = await _vehicleRepository.fetchvehiclemodel(authToken);

      // ✅ No 'error' or 'message' field in response, so just assign
      vehicleModels.assignAll(response.vehicleModels);

      print("Fetched Vehicle Models:");
      for (var vehicle in response.vehicleModels) {
        print(
            "ID: ${vehicle.id}, Model: ${vehicle.model}, Company: ${vehicle.vehicleCompany}, Battery: ${vehicle.batterySizeKwh} kWh, Charger Type: ${vehicle.chargerType}");
      }
    } catch (e) {
      errorMessage("Error fetching vehicle models: $e");
      print("methods Exception: $e");
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

  void selectModel(VehicleModelData model) {
    selectedModel.value = model.model; // Store model name
    selectedVehicleModel.value = model; // Store full model data
  }

  void disposeController() {
    selectedCompany.value = "All";
    searchTerm.value = '';
    selectedModel.value = '';

    // Dispose of the TextEditingController
    searchController.dispose();

    super.onClose(); // Call the parent onClose method
  }

  // Validation function
  bool isValidVehicleNumber(String number) {
    return RegExp(r'^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$')
        .hasMatch(number.trim());
  }

  // Handle vehicle number changes
  void onVehicleNumberChanged(String val) {
    final upperCaseVal = val.toUpperCase();
    vehicleNumberController.value = vehicleNumberController.value.copyWith(
      text: upperCaseVal,
      selection: TextSelection.collapsed(offset: upperCaseVal.length),
    );
    vehicleNumber.value = upperCaseVal;
    isVehicleNumberValid.value = isValidVehicleNumber(upperCaseVal);
  }

  Future<void> submitVehicleNumber() async {
    if (!isVehicleNumberValid.value || selectedVehicleModel.value == null)
      return;

    try {
      isLoading(true);

      final response = await _vehicleRepository.addVehicleRepo(
        authToken: sessionController.token.value,
        userId: sessionController.userId.value,
        emailId: sessionController.emailId.value,
        vehicleNumber: vehicleNumber.value,
        vehicleId: selectedVehicleModel.value!.vehicleId,
      );

      if (!response.error) {
        // Create the new vehicle object with all necessary details
        final newVehicle = {
          'vehicle_number': vehicleNumber.value,
          'details': {
            'model': selectedVehicleModel.value!.model,
            'vehicle_company': selectedVehicleModel.value!.vehicleCompany,
            'image_base64': selectedVehicleModel.value!.vehicleImage,
            'battery_size_kwh': selectedVehicleModel.value!.batterySizeKwh,
            'charger_type': selectedVehicleModel.value!.chargerType,
            'range':
                selectedVehicleModel.value!.type, // Using type as range for now
          }
        };

        // Add the new vehicle to the vehicles list
        vehicles.add(newVehicle);

        // Reset the form
        vehicleNumberController.clear();
        vehicleNumber.value = '';
        selectedModel.value = '';
        selectedVehicleModel.value = null;

        // Close the bottom sheet
        Get.back();

        // Show success message
        Get.snackbar(
          'Success',
          'Vehicle added successfully!',
          backgroundColor: Colors.green.withOpacity(0.7),
          colorText: Colors.white,
          margin: const EdgeInsets.all(12),
          borderRadius: 8,
          duration: const Duration(seconds: 2),
        );

        // Refresh the vehicle models list
        fetchAllVehicleModel();

        // Automatically navigate back to the vehicle page after a short delay
        Future.delayed(const Duration(seconds: 2), () {
          if (Get.isRegistered<VehicleController>()) {
            final vehicleController = Get.find<VehicleController>();
            vehicleController.refreshVehicles();
          }
        });
      } else {
        Get.snackbar(
          'Error',
          response.message,
          backgroundColor: Colors.red.withOpacity(0.7),
          colorText: Colors.white,
          margin: const EdgeInsets.all(12),
          borderRadius: 8,
          duration: const Duration(seconds: 3),
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to submit vehicle: ${e.toString()}',
        backgroundColor: Colors.red.withOpacity(0.7),
        colorText: Colors.white,
        margin: const EdgeInsets.all(12),
        borderRadius: 8,
        duration: const Duration(seconds: 3),
      );
    } finally {
      isLoading(false);
    }
  }

  @override
  void onClose() {
    selectedCompany.value = "All";
    searchTerm.value = '';
    selectedModel.value = '';
    selectedVehicleModel.value = null;
    searchController.dispose();
    vehicleNumberController.dispose();
    super.onClose();
  }
}
