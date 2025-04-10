import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/AddVehicle/domain/repositories/addvehicle_repository.dart';

import '../../domain/model/addvehicle_model.dart';

class AddvehicleControllers extends GetxController {
  final AddVehicleRepository _vehicleRepository = AddVehicleRepository();
  final sessionController = Get.find<SessionController>();

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

  @override
  void onInit() {
    super.onInit();
    fetchAllVehicleModel();
    searchController = TextEditingController();
    // Initialize vehicles if needed
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

  void selectModel(String model) {
    selectedModel.value = model; // Update selected model
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

  // Submit vehicle number
  void submitVehicleNumber() {
    if (isVehicleNumberValid.value) {
      debugPrint("Submitting vehicle number: ${vehicleNumber.value}");
      // Here you would typically:
      // 1. Save the vehicle number with the selected model
      // 2. Close the bottom sheet
      // 3. Maybe refresh the vehicle list
      Get.back(); // Close the bottom sheet
    }
  }

  @override
  void onClose() {
    disposeController(); // Call the custom dispose function
    vehicleNumberController.dispose();
    // No additional logic needed here unless required
  }
}
