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
        elevation: 0.5, // Customize shadow intensity (0 for no shadow)
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
                height: screenHeight * 0.15,
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
            SizedBox(height: screenHeight * 0.04),

            // Vehicle Category Tabs
            Obx(() {
              final models = _vehicleController.vehicleModels;

              return SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    // Default "All" tab
                    Container(
                      margin: EdgeInsets.only(right: screenWidth * 0.08),
                      child: Text(
                        "All",
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    // Dynamically show model names
                    ...models.map((modelData) {
                      return Container(
                        margin: EdgeInsets.only(right: screenWidth * 0.08),
                        child: Text(
                          modelData.model ?? '',
                          style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey),
                        ),
                      );
                    }).toList(),
                  ],
                ),
              );
            }),


            SizedBox(height: screenHeight * 0.03),

            // Search Bar
            TextField(
              style: TextStyle(color: Colors.grey[600]), // Text color
              decoration: InputDecoration(
                hintText: "Search for a vehicle",
                hintStyle: TextStyle(color: Colors.grey[500]), // Hint text color
                prefixIcon: Icon(Icons.search, color: Colors.grey[500]), // Icon color
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(screenWidth * 0.02),
                  borderSide: BorderSide(
                    width: 1.0,
                    color: Colors.grey[400]!, // Border color
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(screenWidth * 0.02),
                  borderSide: BorderSide(
                    width: 1.0,
                    color: Colors.grey[400]!, // Border color when enabled
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(screenWidth * 0.02),
                  borderSide: BorderSide(
                    width: 1.0,
                    color: Colors.grey[500]!, // Slightly darker when focused
                  ),
                ),
                contentPadding: EdgeInsets.symmetric(
                  vertical: screenHeight * 0.015,
                  horizontal: screenWidth * 0.03,
                ),
              ),
            ),

            SizedBox(height: screenHeight * 0.02),

            // Vehicle Grid List
            Expanded(
              child: Obx(() {
                if (_vehicleController.isLoading.value) {
                  return Center(child: CircularProgressIndicator());
                }

                return GridView.builder(
                  padding: EdgeInsets.symmetric(vertical: screenHeight * 0.01),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: screenWidth < 400 ? 2 : 3,
                    crossAxisSpacing: screenWidth * 0.03,
                    mainAxisSpacing: screenHeight * 0.02,
                    childAspectRatio: 1.2,
                  ),
                  itemCount: _vehicleController.vehicleModels.length,
                  itemBuilder: (context, index) {
                    final vehicleModel = _vehicleController.vehicleModels[index];
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
      width: screenWidth * 0.32,
      margin: EdgeInsets.only(right: screenWidth * 0.02),
      padding: EdgeInsets.all(screenWidth * 0.025),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(screenWidth * 0.03),
        border: Border.all(color: Colors.green.shade300),
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
            height: screenWidth * 0.15,
            fit: BoxFit.cover,
          ),
          SizedBox(height: screenWidth * 0.01),
          Text(
            vehicle['model'] ?? '',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
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
      onTap: () {
        // Handle vehicle selection
        print("Selected vehicle: $model");
      },
      child: Container(
        padding: EdgeInsets.all(screenWidth * 0.03),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(screenWidth * 0.03),
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 4,
              offset: Offset(2, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CachedNetworkImage(
              imageUrl: imageUrl,
              height: screenWidth * 0.20,
              fit: BoxFit.contain,
              placeholder: (context, url) => Center(child: CircularProgressIndicator()),
              errorWidget: (context, url, error) => Icon(Icons.directions_car, size: 40),
            ),
            SizedBox(height: screenWidth * 0.02),
            Text(
              model,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
