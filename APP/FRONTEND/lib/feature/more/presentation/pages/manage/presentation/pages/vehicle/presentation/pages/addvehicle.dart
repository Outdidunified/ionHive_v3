import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/core.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/controllers/vehicle_controller.dart';

class AddVehicle extends StatelessWidget {
   AddVehicle({super.key});

  final VehicleController _vehicleController = Get.put(VehicleController());
   final String baseUrl = iOnHiveCore.baseUrl;


  @override
  Widget build(BuildContext context) {
    final arguments = Get.arguments as Map<String, dynamic>?;
    final List<Map<String, dynamic>> vehicles = arguments?['vehicles'] ?? [];
    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;
    final theme = Theme.of(context);

    // Call the function when the widget builds
    _vehicleController.fetchAllVehicleModel();



    return Scaffold(
      appBar: AppBar(
        title: const Text("Add Vehicle"),
        scrolledUnderElevation: 0, // Prevents elevation change when scrolling

        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Get.back(),
        ),
      ),
      body: Padding(
        padding: EdgeInsets.all(screenWidth * 0.04),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "My Vehicles",
              style: theme.textTheme.headlineMedium,
            ),
            SizedBox(height: screenHeight * 0.015),

            // Vehicle List
            if (vehicles.isNotEmpty)
              SizedBox(
                height: screenHeight * 0.13,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: vehicles.length,
                  itemBuilder: (context, index) {
                    final vehicle = vehicles[index];
                    return VehicleCard(
                      vehicle: vehicle,

                    );
                  },
                ),
              ),
            SizedBox(height: screenHeight * 0.025),

            // Vehicle Category Tabs
            Obx(() {
              final companies = _vehicleController.vehicleModels
                  .map((model) => model.vehicleCompany)
                  .toSet() // Get unique companies
                  .take(10) // Limit to 10
                  .toList();

              return SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    // "All" tab
                    GestureDetector(
                      onTap: () => _vehicleController.selectCompany("All"),
                      child: Container(
                        margin: EdgeInsets.only(right: screenWidth * 0.08),
                        child: Obx(() => Text(
                          "All",
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: _vehicleController.selectedCompany.value == "All"
                                ? theme.primaryColor
                                : Colors.grey,
                            fontWeight: FontWeight.bold,
                            fontSize: screenHeight * 0.02,
                          ),
                        )),
                      ),
                    ),
                    // Company tabs
                    ...companies.map((company) {
                      return GestureDetector(
                        onTap: () => _vehicleController.selectCompany(company),
                        child: Container(
                          margin: EdgeInsets.only(right: screenWidth * 0.08),
                          child: Obx(() => Text(
                            company,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: _vehicleController.selectedCompany.value == company
                                  ? theme.primaryColor
                                  : Colors.grey,
                              fontSize: screenHeight * 0.02,
                            ),
                          )),
                        ),
                      );
                    }),
                  ],
                ),
              );
            }),


            SizedBox(height: screenHeight * 0.02),

            // Search Bar
            TextField(
              controller: _vehicleController.searchController,
              onChanged: _vehicleController.setSearchTerm,
              style: TextStyle(color: Colors.grey[600]),
              decoration: InputDecoration(
                hintText: "Search for a vehicle",
                hintStyle: TextStyle(color: Colors.grey[500]),
                prefixIcon: Icon(Icons.search, color: Colors.grey[500]),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(screenWidth * 0.02),
                  borderSide: BorderSide(width: 1.0, color: Colors.grey[400]!),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(screenWidth * 0.02),
                  borderSide: BorderSide(width: 1.0, color: Colors.grey[400]!),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(screenWidth * 0.02),
                  borderSide: BorderSide(width: 1.0, color: Colors.grey[500]!),
                ),
                contentPadding: EdgeInsets.symmetric(
                  vertical: screenHeight * 0.015,
                  horizontal: screenWidth * 0.03,
                ),
              ),
            ),

            SizedBox(height: screenHeight * 0.01),

            // Vehicle Grid List
            Expanded(
              child: Obx(() {
                if (_vehicleController.isLoading.value) {
                  return Center(child: CircularProgressIndicator());
                }

                // First filter by selected company
                var filteredModels = _vehicleController.selectedCompany.value == "All"
                    ? _vehicleController.vehicleModels
                    : _vehicleController.vehicleModels
                    .where((model) => model.vehicleCompany == _vehicleController.selectedCompany.value)
                    .toList();

                // Then filter by search term if it exists
                if (_vehicleController.searchTerm.value.isNotEmpty) {
                  filteredModels = filteredModels.where((model) {
                    return model.model.toLowerCase().contains(_vehicleController.searchTerm.value) ||
                        model.vehicleCompany.toLowerCase().contains(_vehicleController.searchTerm.value);
                  }).toList();
                }

                return filteredModels.isEmpty
                    ? Center(child: Text("No vehicles found", style: theme.textTheme.bodyMedium))
                    : GridView.builder(
                  padding: EdgeInsets.symmetric(vertical: screenHeight * 0.01),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: screenWidth < 380 ? 2 : 3,
                    crossAxisSpacing: screenWidth * 0.03,
                    mainAxisSpacing: screenHeight * 0.02,
                    childAspectRatio: 1.2,
                  ),
                  itemCount: filteredModels.length,
                  itemBuilder: (context, index) {
                    final vehicleModel = filteredModels[index];
                    return VehicleGridCard(
                      model: vehicleModel.model,
                      imageUrl: "$baseUrl${vehicleModel.vehicleImage}",
                    );
                  },
                );
              }),
            ),


            // Add Vehicle Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.primaryColor,
                  padding: EdgeInsets.all(screenHeight * 0.02),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(screenWidth * 0.02),
                  ),
                ),
                onPressed: () {
                  // Add vehicle functionality
                },
                child: const Text(
                  "Add Vehicle",
                  style: TextStyle(fontSize: 18, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// VehicleCard Widget
class VehicleCard extends StatelessWidget {
  final Map<String, dynamic> vehicle;


  VehicleCard({super.key, required this.vehicle});
  final String baseUrl = iOnHiveCore.baseUrl;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final double screenWidth = MediaQuery.of(context).size.width;

    return Container(
      width: screenWidth * 0.25,
      margin: EdgeInsets.only(right: screenWidth * 0.02),
      padding: EdgeInsets.all(screenWidth * 0.025),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(screenWidth * 0.03),
        border: Border.all(color: Colors.grey.shade300),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: Offset(2, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Image.network(
            "$baseUrl${vehicle['image_base64']}",
            height: screenWidth * 0.12,
            fit: BoxFit.cover,
          ),
          SizedBox(height: screenWidth * 0.01),
          CustomEllipsisText(
            text: vehicle['model'] ?? '',
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.bold,
              fontSize: (vehicle['model']?.length ?? 0) > 10 ? 12 : 14,
            ),
            maxLines: 1,
            textAlign: TextAlign.center,
          ),
          Text(
            vehicle['vehicle_number'] ?? '',
            style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey),
          ),
        ],
      ),
    );
  }
}

// VehicleGridCard Widget

class VehicleGridCard extends StatelessWidget {
  final String model;
  final String imageUrl;

  const VehicleGridCard({
    super.key,
    required this.model,
    required this.imageUrl,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final double screenWidth = MediaQuery.of(context).size.width;

    return GestureDetector(
      onTap: () => print("Selected vehicle: $model"),
      child: Container(
        padding: EdgeInsets.all(screenWidth * 0.02), // Reduced padding
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(screenWidth * 0.025), // Slightly smaller radius
          boxShadow: const [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 3, // Reduced shadow
              offset: Offset(1, 1), // Smaller offset
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: screenWidth * 0.18, // Reduced image size
              ),
              child: CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.contain,
                placeholder: (_, __) => const Center(child: CircularProgressIndicator()),
                errorWidget: (_, __, ___) => const Icon(Icons.directions_car, size: 30), // Smaller icon
              ),
            ),
            SizedBox(height: screenWidth * 0.015), // Reduced spacing
            SizedBox(
              width: screenWidth * 0.20, // Constrained text width
              child: Text(
                model,
                textAlign: TextAlign.center,
                maxLines: 2, // Allow 2 lines if needed
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: model.length > 15 ? 11 : 13, // Dynamic font size
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
