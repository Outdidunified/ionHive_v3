import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/core.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/controllers/vehicle_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/AddVehicle/presentation/controllers/addvehicle_controllers.dart';

class AddVehicle extends StatelessWidget {
  AddVehicle({super.key}) {
    final arguments = Get.arguments as Map<String, dynamic>?;
    final vehicleController = Get.put(AddvehicleControllers());
    vehicleController.setVehicles(arguments?['vehicles'] ?? []);
  }

  final AddvehicleControllers _vehicleController =
      Get.put(AddvehicleControllers());
  final VehicleController fetchvehicleController = Get.put(VehicleController());
  final String baseUrl = iOnHiveCore.baseUrl;

  @override
  Widget build(BuildContext context) {
    final arguments = Get.arguments as Map<String, dynamic>?;
    final List<Map<String, dynamic>> vehicles = arguments?['vehicles'] ?? [];
    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;
    final theme = Theme.of(context);

    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        title: const Text("Add Vehicle"),
        scrolledUnderElevation: 0, // Prevents elevation change when scrolling
        leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () async {
              // First navigate back
              Get.back();

              // Then refresh the vehicle list in the background
              // This ensures the UI is updated with the latest data
              await Future.delayed(Duration(milliseconds: 300));
              if (Get.isRegistered<VehicleController>()) {
                final controller = Get.find<VehicleController>();
                controller.refreshVehicles();
              }
            }),
      ),
      body: Padding(
        padding: EdgeInsets.all(screenWidth * 0.04),
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Only show "My Vehicles" section if there are vehicles
                    Obx(() => _vehicleController.vehicles.isNotEmpty
                        ? Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("My Vehicles",
                                  style: theme.textTheme.headlineMedium),
                              SizedBox(height: screenHeight * 0.015),
                              _buildVehiclesList(_vehicleController),
                              SizedBox(height: screenHeight * 0.025),
                            ],
                          )
                        : SizedBox.shrink()),
                    _buildCompanyTabs(),
                    SizedBox(height: screenHeight * 0.02),
                    _buildSearchBar(),
                    SizedBox(height: screenHeight * 0.01),
                    _buildVehicleGrid(),
                  ],
                ),
              ),
            ),

            // Add Vehicle Button (fixed at bottom)
            _buildAddVehicleButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildVehiclesList(AddvehicleControllers controller) {
    return SizedBox(
      height: MediaQuery.of(Get.context!).size.height * 0.13,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: controller.vehicles.length,
        itemBuilder: (context, index) {
          final vehicle = controller.vehicles[index];
          return Container(
            width: MediaQuery.of(context).size.width * 0.30, // Increased width

            child: VehicleCard(
              key: ValueKey('vehicle_${vehicle['vehicle_number']}'),
              vehicle: vehicle,
            ),
          );
        },
      ),
    );
  }

  Widget _buildCompanyTabs() {
    return Obx(() {
      final companies = _vehicleController.vehicleModels
          .map((model) => model.vehicleCompany)
          .toSet()
          .take(10)
          .toList();

      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            SizedBox(
              width: 10,
            ),
            // "All" tab
            _buildCompanyTab("All"),
            // Company tabs
            ...companies.map((company) => _buildCompanyTab(company)),
          ],
        ),
      );
    });
  }

  Widget _buildCompanyTab(String company) {
    return GestureDetector(
      onTap: () => _vehicleController.selectCompany(company),
      child: Container(
        margin: EdgeInsets.only(
            right: MediaQuery.of(Get.context!).size.width * 0.08),
        child: Obx(() {
          final isSelected =
              _vehicleController.selectedCompany.value == company;
          return Text(
            company,
            style: Theme.of(Get.context!).textTheme.bodyMedium?.copyWith(
                  color: isSelected
                      ? Theme.of(Get.context!).primaryColor
                      : Colors.grey,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  fontSize: MediaQuery.of(Get.context!).size.height * 0.02,
                ),
          );
        }),
      ),
    );
  }

  Widget _buildSearchBar() {
    return TextField(
      controller: _vehicleController.searchController,
      onChanged: _vehicleController.setSearchTerm,
      style: TextStyle(color: Colors.grey[600]),
      decoration: InputDecoration(
        hintText: "Search for a vehicle",
        hintStyle: TextStyle(color: Colors.grey[500]),
        prefixIcon: Icon(Icons.search, color: Colors.grey[500]),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(
              MediaQuery.of(Get.context!).size.width * 0.02),
          borderSide: BorderSide(width: 1.0, color: Colors.grey[400]!),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(
              MediaQuery.of(Get.context!).size.width * 0.02),
          borderSide: BorderSide(width: 1.0, color: Colors.grey[400]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(
              MediaQuery.of(Get.context!).size.width * 0.02),
          borderSide: BorderSide(width: 1.0, color: Colors.grey[500]!),
        ),
        contentPadding: EdgeInsets.symmetric(
          vertical: MediaQuery.of(Get.context!).size.height * 0.015,
          horizontal: MediaQuery.of(Get.context!).size.width * 0.03,
        ),
      ),
    );
  }

  Widget _buildVehicleGrid() {
    return Obx(() {
      if (_vehicleController.isLoading.value) {
        return Center(child: CircularProgressIndicator());
      }

      final filteredModels = _vehicleController.selectedCompany.value == "All"
          ? _vehicleController.vehicleModels
          : _vehicleController.vehicleModels
              .where((model) =>
                  model.vehicleCompany ==
                  _vehicleController.selectedCompany.value)
              .toList();

      final searchFilteredModels =
          _vehicleController.searchTerm.value.isNotEmpty
              ? filteredModels.where((model) {
                  return model.model
                          .toLowerCase()
                          .contains(_vehicleController.searchTerm.value) ||
                      model.vehicleCompany
                          .toLowerCase()
                          .contains(_vehicleController.searchTerm.value);
                }).toList()
              : filteredModels;

      return searchFilteredModels.isEmpty
          ? Center(
              child: Text("No vehicles found",
                  style: Theme.of(Get.context!).textTheme.bodyMedium))
          : GridView.builder(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              padding: EdgeInsets.symmetric(
                  vertical: MediaQuery.of(Get.context!).size.height * 0.01),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2, // Simplified - same for all screen sizes
                crossAxisSpacing: MediaQuery.of(Get.context!).size.width * 0.03,
                mainAxisSpacing: MediaQuery.of(Get.context!).size.height * 0.02,
                childAspectRatio: 1.2,
              ),
              itemCount: searchFilteredModels.length,
              itemBuilder: (context, index) {
                final vehicleModel = searchFilteredModels[index];
                return Obx(() => VehicleGridCard(
                      key: ValueKey('grid_${vehicleModel.id}_$index'),
                      isSelected: _vehicleController.selectedModel.value ==
                          vehicleModel.model,
                      model: vehicleModel.model,
                      imageUrl: "$baseUrl${vehicleModel.vehicleImage}",
                      onTap: () => _vehicleController
                          .selectModel(vehicleModel), // Pass the full model
                    ));
              },
            );
    });
  }

  Widget _buildAddVehicleButton() {
    return SizedBox(
      width: double.infinity,
      child: Obx(() {
        final isModelSelected =
            _vehicleController.selectedModel.value.isNotEmpty;
        return ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(Get.context!).primaryColor,
            padding:
                EdgeInsets.all(MediaQuery.of(Get.context!).size.height * 0.02),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(
                  MediaQuery.of(Get.context!).size.width * 0.02),
            ),
          ),
          onPressed: isModelSelected
              ? () {
                  // Open the bottom sheet
                  showModalBottomSheet(
                    context: Get.context!,
                    isScrollControlled: true,
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.vertical(top: Radius.circular(20)),
                    ),
                    builder: (context) => _buildVehicleNumberSheet(),
                  );
                }
              : null,
          child: Text(
            "Add Vehicle",
            style: Theme.of(Get.context!).textTheme.titleLarge?.copyWith(
                  color: Colors.white,
                  fontSize: MediaQuery.of(Get.context!).size.height * 0.025,
                ),
          ),
        );
      }),
    );
  }

  Widget _buildVehicleNumberSheet() {
    return Obx(() => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(Get.context!).viewInsets.bottom,
            left: 16,
            right: 16,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  height: 4,
                  width: 40,
                  decoration: BoxDecoration(
                    color: Theme.of(Get.context!)
                        .colorScheme
                        .onSurface
                        .withOpacity(0.4),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              SizedBox(height: 20),
              Center(
                child: Text(
                  "Enter your Vehicle Number",
                  style: Theme.of(Get.context!).textTheme.titleMedium,
                ),
              ),
              SizedBox(height: 10),
              TextField(
                controller: _vehicleController.vehicleNumberController,
                onChanged: _vehicleController.onVehicleNumberChanged,
                style: Theme.of(Get.context!).textTheme.bodyLarge,
                maxLength: 10,
                decoration: InputDecoration(
                  labelText: 'Vehicle Number',
                  labelStyle: Theme.of(Get.context!).textTheme.bodyMedium,
                  filled: true,
                  fillColor: Theme.of(Get.context!).colorScheme.surface,
                  counterText: "",
                  hintText: "e.g. TN09UG7777",
                  hintStyle:
                      Theme.of(Get.context!).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(Get.context!)
                                .colorScheme
                                .onSurface
                                .withOpacity(0.5),
                          ),
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(
                        color: Theme.of(Get.context!).dividerColor, width: 2.0),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(
                        color: Theme.of(Get.context!).dividerColor, width: 2.0),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(
                        color: Theme.of(Get.context!).primaryColor, width: 2.0),
                  ),
                  errorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(
                        color: Theme.of(Get.context!).colorScheme.error,
                        width: 2.0),
                  ),
                  focusedErrorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(
                        color: Theme.of(Get.context!).colorScheme.error,
                        width: 2.0),
                  ),
                ),
              ),
              SizedBox(height: 5),
              Text(
                'Enter your ${_vehicleController.selectedModel.value} registration number',
                style: Theme.of(Get.context!).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(Get.context!)
                          .colorScheme
                          .onSurface
                          .withOpacity(0.6),
                      fontSize: 13,
                    ),
              ),
              if (!_vehicleController.isVehicleNumberValid.value &&
                  _vehicleController.vehicleNumber.value.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    'Invalid format. Use format: TN09UG7777',
                    style: TextStyle(
                      color: Theme.of(Get.context!).colorScheme.error,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _vehicleController.isVehicleNumberValid.value
                      ? _vehicleController.submitVehicleNumber
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        _vehicleController.isVehicleNumberValid.value
                            ? Theme.of(Get.context!).primaryColor
                            : Theme.of(Get.context!).colorScheme.surfaceVariant,
                    foregroundColor: _vehicleController
                            .isVehicleNumberValid.value
                        ? Colors.white
                        : Theme.of(Get.context!).colorScheme.onSurfaceVariant,
                    padding: EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    "Submit",
                    style: Theme.of(Get.context!)
                        .textTheme
                        .titleLarge
                        ?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: _vehicleController.isVehicleNumberValid.value
                              ? Colors.white
                              : Theme.of(Get.context!)
                                  .colorScheme
                                  .onSurfaceVariant
                                  .withOpacity(0.7),
                        ),
                  ),
                ),
              ),
              SizedBox(height: 10),
              Center(
                child: Text(
                  "Just once! Register your vehicle now, and we'll remember it for you.",
                  textAlign: TextAlign.center,
                  style: Theme.of(Get.context!).textTheme.bodyLarge?.copyWith(
                        fontSize: 12,
                        color: Theme.of(Get.context!)
                            .colorScheme
                            .onSurface
                            .withOpacity(0.6),
                      ),
                ),
              ),
              SizedBox(height: 20),
            ],
          ),
        ));
  }
}

class VehicleCard extends StatelessWidget {
  final Map<String, dynamic> vehicle;
  final String baseUrl = iOnHiveCore.baseUrl;

  VehicleCard({super.key, required this.vehicle});

  // Helper method to get the vehicle image with proper error handling
  Widget _getVehicleImage(Map<String, dynamic> vehicle, String baseUrl) {
    // Check if the image is in the details structure or directly in the vehicle map
    final String? imagePath = vehicle['details'] != null
        ? vehicle['details']['image_base64']
        : vehicle['image_base64'];

    if (imagePath == null || imagePath.isEmpty) {
      return const Icon(Icons.car_repair, size: 32);
    }

    return CachedNetworkImage(
      imageUrl: "$baseUrl$imagePath",
      fit: BoxFit.cover,
      placeholder: (context, url) => const Center(
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      ),
      errorWidget: (context, error, stackTrace) {
        print("Error loading image: $error");
        return const Icon(Icons.car_repair, size: 32);
      },
    );
  }

  // Helper method to get the vehicle model name
  String _getVehicleModel(Map<String, dynamic> vehicle) {
    // Check if the model is in the details structure or directly in the vehicle map
    final String? model = vehicle['details'] != null
        ? vehicle['details']['model']
        : vehicle['model'];

    return model ?? 'Unknown Model';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final double screenWidth = MediaQuery.of(context).size.width;

    return Card(
      margin: EdgeInsets.only(right: screenWidth * 0.02),
      clipBehavior: Clip.antiAlias,
      child: Container(
        width: screenWidth * 0.25,
        padding: EdgeInsets.all(screenWidth * 0.025),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Image with error handling and placeholder
            Container(
              height: screenWidth * 0.12,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: theme.colorScheme.surfaceVariant,
              ),
              child: _getVehicleImage(vehicle, baseUrl),
            ),
            SizedBox(height: screenWidth * 0.01),
            // Vehicle Model
            CustomEllipsisText(
              text: _getVehicleModel(vehicle),
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
              maxLines: 1,
              textAlign: TextAlign.center,
            ),
            // Vehicle Number
            Text(
              vehicle['vehicle_number'] ?? 'N/A',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// VehicleGridCard Widget

class VehicleGridCard extends StatelessWidget {
  final String model;
  final String imageUrl;
  final bool isSelected;
  final VoidCallback onTap;

  const VehicleGridCard({
    super.key,
    required this.model,
    required this.imageUrl,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final double screenWidth = MediaQuery.of(context).size.width;
    final isDarkMode = theme.brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(screenWidth * 0.02),
        decoration: BoxDecoration(
          color: isDarkMode ? theme.colorScheme.surface : theme.cardColor,
          borderRadius: BorderRadius.circular(screenWidth * 0.025),
          border: Border.all(
            color: isSelected
                ? theme.colorScheme.primary // Green border when selected
                : (isDarkMode
                    ? Colors.grey.withOpacity(0.2)
                    : Colors.grey.shade200),
            width: isSelected ? 2.0 : 0.5, // Thicker border when selected
          ),
          boxShadow: [
            BoxShadow(
              color:
                  isDarkMode ? Colors.black.withOpacity(0.3) : Colors.black12,
              blurRadius: 3,
              offset: const Offset(1, 1),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: screenWidth * 0.18,
              ),
              child: CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.contain,
                placeholder: (_, __) => Center(
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: theme.colorScheme.primary,
                  ),
                ),
                errorWidget: (_, __, ___) => Icon(
                  Icons.directions_car,
                  size: 30,
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                ),
              ),
            ),
            SizedBox(height: screenWidth * 0.015),
            SizedBox(
              width: screenWidth * 0.20,
              child: Text(
                model,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: model.length > 15 ? 11 : 13,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CustomEllipsisText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final int maxLines;
  final TextAlign textAlign;

  const CustomEllipsisText({
    super.key,
    required this.text,
    this.style,
    this.maxLines = 1,
    this.textAlign = TextAlign.start,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final textSpan = TextSpan(text: text, style: style);
        final textPainter = TextPainter(
          text: textSpan,
          maxLines: maxLines,
          textDirection: TextDirection.ltr,
        )..layout(maxWidth: constraints.maxWidth);

        if (textPainter.didExceedMaxLines) {
          // Find the position where we need to cut the text
          int endIndex = textPainter
              .getPositionForOffset(Offset(constraints.maxWidth - 20, 0))
              .offset;
          endIndex = endIndex > 2 ? endIndex - 2 : 0;

          return Text(
            text.substring(0, endIndex) + '..',
            style: style,
            maxLines: maxLines,
            textAlign: textAlign,
          );
        }
        return Text(
          text,
          style: style,
          maxLines: maxLines,
          textAlign: textAlign,
        );
      },
    );
  }
}
