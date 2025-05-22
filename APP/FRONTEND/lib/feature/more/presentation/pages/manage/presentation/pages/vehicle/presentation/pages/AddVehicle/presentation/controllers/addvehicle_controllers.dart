import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/controllers/vehicle_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/AddVehicle/domain/repositories/addvehicle_repository.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

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
      final emailid = sessionController.emailId.value;
      final userid = sessionController.userId.value;
      final response = await _vehicleRepository.fetchvehiclemodel(authToken,emailid,userid);

      // ✅ No 'error' or 'message' field in response, so just assign
      vehicleModels.assignAll(response.vehicleModels);

      for (var vehicle in response.vehicleModels) {
        debugPrint(
            "ID: ${vehicle.id}, Model: ${vehicle.model}, Company: ${vehicle.vehicleCompany}, Battery: ${vehicle.batterySizeKwh} kWh, Charger Type: ${vehicle.chargerType}");
      }
    } catch (e) {
      errorMessage("Error fetching vehicle models: $e");
      debugPrint("methods Exception: $e");
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
    if (!isVehicleNumberValid.value || selectedVehicleModel.value == null) {
      return;
    }

    try {
      isLoading(true);

      final response = await _vehicleRepository.addVehicleRepo(
        authToken: sessionController.token.value,
        userId: sessionController.userId.value,
        emailId: sessionController.emailId.value,
        vehicleNumber: vehicleNumber.value,
        vehicleId: selectedVehicleModel.value!.vehicleId,
      );

// Proper debug printing of values
      debugPrint("AddVehicle: API call initiated.");
      debugPrint("Sending data ->");
      debugPrint("User ID: ${sessionController.userId.value}");
      debugPrint("Email: ${sessionController.emailId.value}");
      debugPrint("Auth Token: ${sessionController.token.value}");
      debugPrint("Vehicle Number: ${vehicleNumber.value}");
      debugPrint("Vehicle ID: ${selectedVehicleModel.value?.vehicleId}");


      if (!response.error) {
        // Success flow (your existing code)
        final newVehicle = {
          'vehicle_number': vehicleNumber.value,
          'details': {
            'model': selectedVehicleModel.value!.model,
            'vehicle_company': selectedVehicleModel.value!.vehicleCompany,
            'image_base64': selectedVehicleModel.value!.vehicleImage,
            'battery_size_kwh': selectedVehicleModel.value!.batterySizeKwh,
            'charger_type': selectedVehicleModel.value!.chargerType,
            'range': selectedVehicleModel.value!.type,
          }
        };

        vehicles.add(newVehicle);
        vehicleNumberController.clear();
        vehicleNumber.value = '';
        selectedModel.value = '';
        selectedVehicleModel.value = null;

        Get.back();

        CustomSnackbar.showSuccess(message: 'Vehicle added successfully');

        fetchAllVehicleModel();

        Future.delayed(const Duration(seconds: 2), () {
          if (Get.isRegistered<VehicleController>()) {
            final vehicleController = Get.find<VehicleController>();
            vehicleController.refreshVehicles();
          }
        });
      } else {
        // Show backend error message here
        CustomSnackbar.showError(
            message: response.message ?? 'Unknown error from server');
      }
    } catch (e) {
      // Extract the error message from the exception
      String errorMessage = e.toString();

      // Check if the error message contains the specific text about vehicle already registered
      if (errorMessage.contains("already registered")) {
        // Show the specific error from the backend
        CustomSnackbar.showError(message: errorMessage);
      } else {
        // Show a generic error message for other types of errors
        CustomSnackbar.showError(
            message: 'Failed to submit vehicle: $errorMessage');
      }

      debugPrint("Vehicle submission error: $e");
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
