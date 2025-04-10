import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:get/get.dart';
import 'package:shimmer/shimmer.dart';
import 'package:ionhive/core/core.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/controllers/vehicle_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/AddVehicle/presentation/pages/addvehicle.dart';

import '../../../../../../../../../../utils/theme/themes.dart';

class VehiclePage extends StatelessWidget {
  final int userId;
  final String username;
  final String emailId;
  final String token;

  const VehiclePage({
    super.key,
    required this.userId,
    required this.username,
    required this.emailId,
    required this.token,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;

    // Set the base URL from iOnHiveCore
    final String baseUrl = iOnHiveCore.baseUrl;

    // Initialize the VehicleController
    final VehicleController controller = Get.put(VehicleController());

    print("AppBar background color: ${theme.appBarTheme.backgroundColor}");
    print("AppBar title text color: ${theme.appBarTheme.titleTextStyle?.color}");
    print("AppBar icon color: ${theme.appBarTheme.iconTheme?.color}");

    return Scaffold(
      appBar: AppBar(
        title: Text(
          "Manage Vehicle",
          style: theme.appBarTheme.titleTextStyle?.copyWith(
            fontSize: screenWidth * 0.05, // 20 on a 400-width screen
          ),
        ),
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back,
            color: theme.appBarTheme.iconTheme?.color,
            size: screenWidth * 0.06, // 24 on a 400-width screen
          ),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          Padding(
            padding: EdgeInsets.all(screenWidth * 0.02), // 8 on a 400-width screen
            child: IconButton(
              icon: Icon(
                Icons.help_outline,
                color: theme.colorScheme.primary,
                size: screenWidth * 0.06, // 24 on a 400-width screen
              ),
              onPressed: () {
                // Navigate to FAQ page or show FAQ dialog
              },
            ),
          ),
        ],
        backgroundColor: theme.appBarTheme.backgroundColor,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: screenWidth * 0.04, // 16 on a 400-width screen
                vertical: screenWidth * 0.02, // 8 on a 400-width screen
              ),
              child: FutureBuilder<List<Map<String, dynamic>>>(
                future: controller.fetchSavedVehicles(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return _buildShimmerLoading(context);
                  } else if (snapshot.hasError) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: screenWidth * 0.15, // 60 on a 400-width screen
                            color: theme.colorScheme.error,
                          ),
                          SizedBox(height: screenHeight * 0.015), // 10 on a 600-height screen
                          Text(
                            "Error: ${snapshot.error}",
                            style: theme.textTheme.bodyLarge?.copyWith(
                              fontSize: screenWidth * 0.04, // 16 on a 400-width screen
                              color: theme.colorScheme.error,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: screenHeight * 0.015), // 10 on a 600-height screen
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: theme.colorScheme.error,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(screenWidth * 0.02), // 8 on a 400-width screen
                              ),
                            ),
                            onPressed: () {
                              Navigator.of(context).pushReplacement(
                                MaterialPageRoute(
                                  builder: (context) => VehiclePage(
                                    userId: userId,
                                    username: username,
                                    emailId: emailId,
                                    token: token,
                                  ),
                                ),
                              );
                            },
                            child: Text(
                              "Retry",
                              style: theme.textTheme.bodyLarge?.copyWith(
                                color: theme.colorScheme.onError,
                                fontSize: screenWidth * 0.04, // 16 on a 400-width screen
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return _buildNoVehiclesUI(context);
                  } else {
                    return Obx(
                          () => ListView.builder(
                        itemCount: controller.vehicles.length,
                        itemBuilder: (context, index) {
                          final vehicle = snapshot.data![index];
                          final details = vehicle['details'] as Map<String, dynamic>?;

                          // Construct the full image URL
                          final imagePath = details?['image_base64']?.trim() ?? '';
                          final normalizedImagePath = imagePath.replaceAll(r'\', '/').trim();
                          final cleanBaseUrl = baseUrl.trim().replaceAll(RegExp(r'/+$'), '');
                          final cleanImagePath = normalizedImagePath.replaceAll(RegExp(r'^/+'), '');
                          final fullImageUrl = imagePath.isNotEmpty
                              ? "$cleanBaseUrl/$cleanImagePath"
                              : '';
                          print("Base URL: $baseUrl");
                          print("Clean Base URL: $cleanBaseUrl");
                          print("Image Path: $imagePath");
                          print("Normalized Image Path: $normalizedImagePath");
                          print("Clean Image Path: $cleanImagePath");
                          print("Full Image URL: $fullImageUrl");

                          return Card(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(screenWidth * 0.03), // 12 on a 400-width screen
                            ),
                            elevation: 2,
                            margin: EdgeInsets.symmetric(vertical: screenWidth * 0.02), // 8 on a 400-width screen
                            color: theme.cardColor,
                            child: Stack(
                              children: [
                                Padding(
                                  padding: EdgeInsets.all(screenWidth * 0.03), // 12 on a 400-width screen
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              details?['model'] ?? 'No Model',
                                              style: theme.textTheme.headlineMedium?.copyWith(
                                                fontSize: screenWidth * 0.045, // 18 on a 400-width screen
                                              ),
                                            ),
                                            SizedBox(height: screenHeight * 0.006), // 4 on a 600-height screen
                                            Row(
                                              children: [
                                                Text(
                                                  vehicle['vehicle_number'] ?? 'No Plate Number',
                                                  style: theme.textTheme.bodyMedium?.copyWith(
                                                    fontSize: screenWidth * 0.04, // 16 on a 400-width screen
                                                    color: theme.textTheme.bodyMedium?.color?.withOpacity(0.6),
                                                  ),
                                                ),
                                              ],
                                            ),
                                            SizedBox(height: screenHeight * 0.012), // 8 on a 600-height screen
                                            Text(
                                              "Charger Type: ${details?['charger_type'] ?? 'Unknown'}",
                                              style: theme.textTheme.bodyMedium?.copyWith(
                                                fontSize: screenWidth * 0.035, // 14 on a 400-width screen
                                                color: theme.textTheme.bodyMedium?.color?.withOpacity(0.6),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(screenWidth * 0.02),
                                        child: fullImageUrl.isNotEmpty
                                            ? CachedNetworkImage(
                                          imageUrl: fullImageUrl,
                                          width: screenWidth * 0.4,
                                          height: screenWidth * 0.3,
                                          fit: BoxFit.contain,
                                          httpHeaders: {
                                            'Authorization': 'Bearer $token',
                                          },
                                          placeholder: (context, url) => Container(
                                            color: theme.dividerColor.withOpacity(0.1),
                                            width: screenWidth * 0.4,
                                            height: screenWidth * 0.3,
                                            child: const Center(
                                              child: CircularProgressIndicator(),
                                            ),
                                          ),
                                          errorWidget: (context, url, error) {
                                            print("Image load error for URL: $url, Error: $error");
                                            return Image.asset(
                                              "assets/images/noimage2.png",
                                              width: screenWidth * 0.4,
                                              height: screenWidth * 0.3,
                                              fit: BoxFit.contain,
                                            );
                                          },
                                        )
                                            : Image.asset(
                                          'assets/images/ss.png',
                                          width: screenWidth * 0.4,
                                          height: screenWidth * 0.3,
                                          fit: BoxFit.contain,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Positioned(
                                  top: -screenWidth * 0.02,
                                  right: -screenWidth * 0.02,
                                  child: Container(
                                    child: IconButton(
                                      icon: Icon(
                                        Icons.remove_circle_outline,
                                        color: theme.colorScheme.error,
                                        size: screenWidth * 0.05, // 24 on a 400-width screen
                                      ),
                                      onPressed: () {
                                        final vehicleNumber = vehicle['vehicle_number'] ?? '';
                                        if (vehicleNumber.isNotEmpty) {
                                          showDialog(
                                            context: context,
                                            builder: (context) => AlertDialog(
                                              title: Text(
                                                "Remove Vehicle",
                                                style: theme.textTheme.titleLarge?.copyWith(
                                                  fontSize: screenWidth * 0.045, // 18 on a 400-width screen
                                                ),
                                              ),
                                              content: Text(
                                                "Are you sure you want to remove vehicle $vehicleNumber?",
                                                style: theme.textTheme.bodyMedium?.copyWith(
                                                  fontSize: screenWidth * 0.04, // 16 on a 400-width screen
                                                ),
                                              ),
                                              actions: [
                                                TextButton(
                                                  onPressed: () => Navigator.pop(context),
                                                  child: Text(
                                                    "Cancel",
                                                    style: theme.textTheme.bodyMedium?.copyWith(
                                                      fontSize: screenWidth * 0.04, // 16 on a 400-width screen
                                                    ),
                                                  ),
                                                ),
                                                TextButton(
                                                  onPressed: () {
                                                    Navigator.pop(context);
                                                    controller.removeVehicle(vehicleNumber).then((success) {
                                                      if (success) {
                                                        ScaffoldMessenger.of(context).showSnackBar(
                                                          SnackBar(
                                                            content: Text(
                                                              "Vehicle removed successfully",
                                                              style: theme.textTheme.bodyLarge?.copyWith(
                                                                fontSize: screenWidth * 0.04, // 16 on a 400-width screen
                                                              ),
                                                            ),
                                                            backgroundColor: theme.colorScheme.primary,
                                                          ),
                                                        );
                                                      } else {
                                                        ScaffoldMessenger.of(context).showSnackBar(
                                                          SnackBar(
                                                            content: Text(
                                                              "Failed to remove vehicle",
                                                              style: theme.textTheme.bodyLarge?.copyWith(
                                                                fontSize: screenWidth * 0.04, // 16 on a 400-width screen
                                                              ),
                                                            ),
                                                            backgroundColor: theme.colorScheme.error,
                                                          ),
                                                        );
                                                      }
                                                    });
                                                  },
                                                  child: Text(
                                                    "Remove",
                                                    style: theme.textTheme.bodyMedium?.copyWith(
                                                      fontSize: screenWidth * 0.04, // 16 on a 400-width screen
                                                      color: theme.colorScheme.error,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          );
                                        }
                                      },
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    );
                  }
                },
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(screenWidth * 0.05), // 20 on a 400-width screen
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: screenHeight * 0.02), // 12 on a 600-height screen
                  backgroundColor: theme.colorScheme.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(screenWidth * 0.03), // 12 on a 400-width screen
                  ),
                ),
                onPressed: () {
                  final List<Map<String, dynamic>> vehicleList = controller.vehicles
                      .map<Map<String, dynamic>>((vehicle) => {
                    'vehicle_number': vehicle.vehicleNumber,
                    'model': vehicle.model,
                    'range': vehicle.range,
                    'battery_size_kwh': vehicle.batterySizeKwh,
                    'charger_type': vehicle.chargerType,
                    'image_base64': vehicle.imageUrl,
                  })
                      .toList();

                  Get.to(() => AddVehicle(), arguments: {
                    'vehicles': vehicleList,
                    'userId': userId,
                    'username': username,
                    'emailId': emailId,
                    'token': token,
                  });
                },
                child: Text(
                  "Add Vehicle",
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: theme.colorScheme.onPrimary,
                    fontWeight: FontWeight.bold,
                    fontSize: screenWidth * 0.04, // 16 on a 400-width screen
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoVehiclesUI(BuildContext context) {
    final theme = Theme.of(context);
    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.directions_car,
            size: screenWidth * 0.2, // 80 on a 400-width screen
            color: theme.textTheme.bodyMedium?.color?.withOpacity(0.6),
          ),
          SizedBox(height: screenHeight * 0.015), // 10 on a 600-height screen
          Text(
            "No vehicles saved",
            style: theme.textTheme.headlineSmall?.copyWith(
              fontSize: screenWidth * 0.045, // 18 on a 400-width screen
              fontWeight: FontWeight.bold,
              color: theme.textTheme.bodyMedium?.color?.withOpacity(0.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerLoading(BuildContext context) {
    final theme = Theme.of(context);
    final shimmerColors = Theme.of(context).extension<ShimmerColors>()!;
    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;

    return Shimmer.fromColors(
      baseColor: shimmerColors.baseColor,
      highlightColor: shimmerColors.highlightColor,
      child: ListView.builder(
        itemCount: 3,
        itemBuilder: (context, index) {
          return Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(screenWidth * 0.03),
            ),
            elevation: 2,
            margin: EdgeInsets.symmetric(vertical: screenWidth * 0.02),
            color: theme.cardColor,
            child: Padding(
              padding: EdgeInsets.all(screenWidth * 0.03),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: screenWidth * 0.375,
                          height: screenHeight * 0.03,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.surface,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        SizedBox(height: screenHeight * 0.006),
                        Container(
                          width: screenWidth * 0.25,
                          height: screenHeight * 0.026,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.surface,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        SizedBox(height: screenHeight * 0.012),
                        Container(
                          width: screenWidth * 0.2,
                          height: screenHeight * 0.023,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.surface,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: screenWidth * 0.25,
                    height: screenHeight * 0.133,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(screenWidth * 0.02),
                      color: theme.colorScheme.surface,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}