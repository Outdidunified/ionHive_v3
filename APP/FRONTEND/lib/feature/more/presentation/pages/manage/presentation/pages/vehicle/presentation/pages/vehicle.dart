import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:get/get.dart';
import 'package:shimmer/shimmer.dart';
import 'package:ionhive/core/core.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/controllers/vehicle_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/AddVehicle/presentation/pages/addvehicle.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

import '../../../../../../../../../../utils/theme/themes.dart';

class VehiclePage extends StatefulWidget {
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
  State<VehiclePage> createState() => _VehiclePageState();
}

class _VehiclePageState extends State<VehiclePage> {
  // Key for FutureBuilder to force refresh
  int _futureBuilderKey = DateTime.now().millisecondsSinceEpoch;
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
    print(
        "AppBar title text color: ${theme.appBarTheme.titleTextStyle?.color}");
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
            padding:
                EdgeInsets.all(screenWidth * 0.02), // 8 on a 400-width screen
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
                key: ValueKey('vehicle_list_$_futureBuilderKey'),
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
                            size:
                                screenWidth * 0.15, // 60 on a 400-width screen
                            color: theme.colorScheme.error,
                          ),
                          SizedBox(
                              height: screenHeight *
                                  0.015), // 10 on a 600-height screen
                          Text(
                            "Note:  ${snapshot.error}",
                            style: theme.textTheme.bodyLarge?.copyWith(
                              fontSize: screenWidth *
                                  0.04, // 16 on a 400-width screen
                              color: theme.colorScheme.error,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(
                              height: screenHeight *
                                  0.015), // 10 on a 600-height screen
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: theme.colorScheme.error,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(
                                    screenWidth *
                                        0.02), // 8 on a 400-width screen
                              ),
                            ),
                            onPressed: () {
                              Navigator.of(context).pushReplacement(
                                MaterialPageRoute(
                                  builder: (context) => VehiclePage(
                                    userId: widget.userId,
                                    username: widget.username,
                                    emailId: widget.emailId,
                                    token: widget.token,
                                  ),
                                ),
                              );
                            },
                            child: Text(
                              "Retry",
                              style: theme.textTheme.bodyLarge?.copyWith(
                                color: theme.colorScheme.onError,
                                fontSize: screenWidth *
                                    0.04, // 16 on a 400-width screen
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    // Don't clear the controller's vehicles list during build
                    // Instead, schedule it for after the build is complete
                    Future.microtask(() {
                      controller.vehicles.clear();
                    });
                    return _buildNoVehiclesUI(context);
                  } else {
                    // Use a local variable to avoid potential race conditions
                    final vehicleData = snapshot.data!;

                    // Trigger a refresh in the background to keep the controller updated
                    Future.microtask(() => controller.refreshVehicles());

                    return ListView.builder(
                      itemCount: vehicleData.length,
                      itemBuilder: (context, index) {
                        // Make sure we don't go out of bounds
                        if (index >= vehicleData.length) {
                          return SizedBox.shrink();
                        }

                        final vehicle = vehicleData[index];
                        final details =
                            vehicle['details'] as Map<String, dynamic>?;

                        // Construct the full image URL
                        final imagePath =
                            details?['image_base64']?.trim() ?? '';
                        final normalizedImagePath =
                            imagePath.replaceAll(r'\', '/').trim();
                        final cleanBaseUrl =
                            baseUrl.trim().replaceAll(RegExp(r'/+$'), '');
                        final cleanImagePath =
                            normalizedImagePath.replaceAll(RegExp(r'^/+'), '');
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
                            borderRadius: BorderRadius.circular(
                                screenWidth * 0.03), // 12 on a 400-width screen
                          ),
                          elevation: 2,
                          margin: EdgeInsets.symmetric(
                              vertical: screenWidth *
                                  0.02), // 8 on a 400-width screen
                          color: theme.cardColor,
                          child: Stack(
                            children: [
                              Padding(
                                padding: EdgeInsets.all(screenWidth *
                                    0.03), // 12 on a 400-width screen
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            details?['model'] ?? 'No Model',
                                            style: theme
                                                .textTheme.headlineMedium
                                                ?.copyWith(
                                              fontSize: screenWidth *
                                                  0.045, // 18 on a 400-width screen
                                            ),
                                          ),
                                          SizedBox(
                                              height: screenHeight *
                                                  0.006), // 4 on a 600-height screen
                                          Row(
                                            children: [
                                              Text(
                                                vehicle['vehicle_number'] ??
                                                    'No Plate Number',
                                                style: theme
                                                    .textTheme.bodyMedium
                                                    ?.copyWith(
                                                  fontSize: screenWidth *
                                                      0.04, // 16 on a 400-width screen
                                                  color: theme.textTheme
                                                      .bodyMedium?.color
                                                      ?.withOpacity(0.6),
                                                ),
                                              ),
                                            ],
                                          ),
                                          SizedBox(
                                              height: screenHeight *
                                                  0.012), // 8 on a 600-height screen
                                          Text(
                                            "Charger Type: ${details?['charger_type'] ?? 'Unknown'}",
                                            style: theme.textTheme.bodyMedium
                                                ?.copyWith(
                                              fontSize: screenWidth *
                                                  0.035, // 14 on a 400-width screen
                                              color: theme
                                                  .textTheme.bodyMedium?.color
                                                  ?.withOpacity(0.6),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(
                                          screenWidth * 0.02),
                                      child: fullImageUrl.isNotEmpty
                                          ? CachedNetworkImage(
                                              imageUrl: fullImageUrl,
                                              width: screenWidth * 0.4,
                                              height: screenWidth * 0.3,
                                              fit: BoxFit.contain,
                                              httpHeaders: {
                                                'Authorization':
                                                    'Bearer ${widget.token}',
                                              },
                                              placeholder: (context, url) =>
                                                  Container(
                                                color: theme.dividerColor
                                                    .withOpacity(0.1),
                                                width: screenWidth * 0.4,
                                                height: screenWidth * 0.3,
                                                child: const Center(
                                                  child:
                                                      CircularProgressIndicator(),
                                                ),
                                              ),
                                              errorWidget:
                                                  (context, url, error) {
                                                print(
                                                    "Image load error for URL: $url, Error: $error");
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
                                      size: screenWidth *
                                          0.05, // 24 on a 400-width screen
                                    ),
                                    onPressed: () {
                                      final vehicleNumber =
                                          vehicle['vehicle_number'] ?? '';
                                      if (vehicleNumber.isNotEmpty) {
                                        showDialog(
                                          context: context,
                                          builder: (context) => AlertDialog(
                                            title: Text(
                                              "Remove Vehicle",
                                              style: theme.textTheme.titleLarge
                                                  ?.copyWith(
                                                fontSize: screenWidth *
                                                    0.045, // 18 on a 400-width screen
                                              ),
                                            ),
                                            content: Text(
                                              "Are you sure you want to remove vehicle $vehicleNumber?",
                                              style: theme.textTheme.bodyMedium
                                                  ?.copyWith(
                                                fontSize: screenWidth *
                                                    0.04, // 16 on a 400-width screen
                                              ),
                                            ),
                                            actions: [
                                              TextButton(
                                                onPressed: () =>
                                                    Navigator.pop(context),
                                                child: Text(
                                                  "Cancel",
                                                  style: theme
                                                      .textTheme.bodyMedium
                                                      ?.copyWith(
                                                    fontSize: screenWidth *
                                                        0.04, // 16 on a 400-width screen
                                                  ),
                                                ),
                                              ),
                                              TextButton(
                                                onPressed: () async {
                                                  // Store the scaffold messenger and context before closing the dialog
                                                  final scaffoldMessenger =
                                                      ScaffoldMessenger.of(
                                                          context);

                                                  // Close the confirmation dialog
                                                  Navigator.pop(context);

                                                  // Use a simpler approach with a boolean flag for loading state
                                                  setState(() {
                                                    controller.isLoading.value =
                                                        true;
                                                  });

                                                  try {
                                                    // Remove the vehicle
                                                    final result =
                                                        await controller
                                                            .removeVehicle(
                                                                vehicleNumber);

                                                    // Process the result
                                                    if (result['success']) {
                                                      // Remove the vehicle from the snapshot data
                                                      if (snapshot.data !=
                                                          null) {
                                                        snapshot.data!
                                                            .removeWhere((v) =>
                                                                v['vehicle_number'] ==
                                                                vehicleNumber);

                                                        // Check if all vehicles are removed
                                                        if (snapshot
                                                            .data!.isEmpty) {
                                                          // Schedule clearing the controller's vehicles list after the build
                                                          Future.microtask(() {
                                                            controller.vehicles
                                                                .clear();
                                                          });
                                                        }
                                                      }

                                                      // Show success message using our custom snackbar
                                                      CustomSnackbar
                                                          .showSuccess(
                                                        message:
                                                            "Vehicle removed successfully",
                                                      );

                                                      // Force rebuild with a key change to ensure FutureBuilder rebuilds
                                                      if (mounted) {
                                                        setState(() {
                                                          // Update the key to force FutureBuilder to rebuild
                                                          _futureBuilderKey =
                                                              DateTime.now()
                                                                  .millisecondsSinceEpoch;
                                                        });
                                                      }
                                                    } else {
                                                      // Show error message using our custom snackbar
                                                      CustomSnackbar.showError(
                                                        message: result[
                                                                'message'] ??
                                                            "Failed to remove vehicle",
                                                      );
                                                    }
                                                  } catch (e) {
                                                    print(
                                                        "issue with removing vehicle: $e");
                                                    // Show error message for exceptions using our custom snackbar
                                                    CustomSnackbar.showError(
                                                      message:
                                                          "issue with removing vehicle: $e",
                                                    );
                                                  } finally {
                                                    // Reset loading state
                                                    if (mounted) {
                                                      setState(() {
                                                        controller.isLoading
                                                            .value = false;
                                                      });
                                                    }
                                                  }
                                                },
                                                child: Text(
                                                  "Remove",
                                                  style: theme
                                                      .textTheme.bodyMedium
                                                      ?.copyWith(
                                                    fontSize: screenWidth *
                                                        0.04, // 16 on a 400-width screen
                                                    color:
                                                        theme.colorScheme.error,
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
                    );
                  }
                },
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(screenWidth * 0.05),
            child: Column(
              children: [
                Obx(() {
                  final isMaxReached = controller.vehicles.length >= 5;
                  return SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        padding:
                            EdgeInsets.symmetric(vertical: screenHeight * 0.02),
                        backgroundColor: isMaxReached
                            ? theme.colorScheme.surface
                            : theme.colorScheme.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(screenWidth * 0.03),
                        ),
                      ),
                      onPressed: isMaxReached
                          ? null
                          : () {
                              final List<Map<String, dynamic>> vehicleList =
                                  controller.vehicles
                                      .map<Map<String, dynamic>>((vehicle) => {
                                            'vehicle_number':
                                                vehicle.vehicleNumber,
                                            'model': vehicle.model,
                                            'range': vehicle.range,
                                            'battery_size_kwh':
                                                vehicle.batterySizeKwh,
                                            'charger_type': vehicle.chargerType,
                                            'image_base64': vehicle.imageUrl,
                                          })
                                      .toList();

                              Get.to(() => AddVehicle(), arguments: {
                                'vehicles': vehicleList,
                                'userId': widget.userId,
                                'username': widget.username,
                                'emailId': widget.emailId,
                                'token': widget.token,
                              });
                            },
                      child: Text(
                        "Add Vehicle",
                        style: theme.textTheme.titleLarge?.copyWith(
                          color: isMaxReached
                              ? theme.textTheme.bodyLarge?.color
                              : theme.colorScheme.onPrimary,
                          fontWeight: FontWeight.bold,
                          fontSize: screenWidth * 0.04,
                        ),
                      ),
                    ),
                  );
                }),
                Obx(() {
                  final isMaxReached = controller.vehicles.length >= 5;
                  return isMaxReached
                      ? Padding(
                          padding: EdgeInsets.only(top: screenHeight * 0.01),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                Icons.info_outline,
                                color: Colors.grey, // Grey color for the icon
                                size:
                                    screenWidth * 0.04, // Adjust size as needed
                              ),
                              SizedBox(
                                  width: screenWidth *
                                      0.01), // Small gap between icon and text
                              Expanded(
                                child: Text(
                                  "Maximum 5 vehicles can be added by a user",
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color:
                                        Colors.grey, // Grey color for the text
                                    fontSize: screenWidth * 0.035,
                                  ),
                                  textAlign:
                                      TextAlign.left, // Left-aligned text
                                ),
                              ),
                            ],
                          ),
                        )
                      : const SizedBox.shrink();
                }),
              ],
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
          SizedBox(height: screenHeight * 0.01),
          Text(
            "Add a vehicle to get started",
            style: theme.textTheme.bodyMedium?.copyWith(
              fontSize: screenWidth * 0.035, // 14 on a 400-width screen
              color: theme.textTheme.bodyMedium?.color?.withOpacity(0.5),
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: screenHeight * 0.03),
          Icon(
            Icons.arrow_downward,
            size: screenWidth * 0.08,
            color: theme.colorScheme.primary.withOpacity(0.7),
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
