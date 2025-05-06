import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:ionhive/feature/Chargingpage/presentation/controllers/Chargingpage_controller.dart';

class ChargingPage extends StatelessWidget {
  final String chargerId;
  final Map<String, dynamic> chargerDetails;
  final String connectorId;
  final Map<String, dynamic> connectorDetails;
  final double unitPrice;

  const ChargingPage({
    super.key,
    required this.chargerId,
    required this.chargerDetails,
    required this.connectorId,
    required this.connectorDetails,
    this.unitPrice = 0.0,
  });

  @override
  Widget build(BuildContext context) {
    // Get the connector type safely
    final connectorType = connectorDetails['type'] is int
        ? connectorDetails['type'] as int
        : int.tryParse(connectorDetails['type'].toString()) ?? 0;

    // Initialize controller with parameters
    final controller = Get.put(ChargingPageController()
      ..chargerId = chargerId
      ..connectorId = int.parse(connectorId)
      ..connectorType = connectorType);

    final theme = Theme.of(context);
    final iconColor = theme.iconTheme.color;
    final textStyle = theme.textTheme.bodyLarge!;
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    debugPrint('Charging details: $chargerDetails');
    debugPrint('Connector details: $connectorDetails');

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          SafeArea(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.04),
              child: Column(
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: Icon(Icons.arrow_back, color: iconColor),
                        onPressed: () async {
                          await controller.endChargingSession(
                            connectorId: int.parse(connectorId),
                            chargerId: chargerId,
                          );
                        },
                      ),
                      Icon(Icons.more_vert, color: iconColor),
                    ],
                  ),

                  SizedBox(height: screenHeight * 0.01),

                  // Charger and connector info container
                  Container(
                    padding: EdgeInsets.all(screenWidth * 0.03),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: theme.dividerColor,
                        width: 0.5,
                      ),
                      borderRadius: BorderRadius.circular(8),
                      color: theme.cardColor,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        // Charger ID
                        Row(
                          children: [
                            Image.asset(
                              'assets/icons/saved_device.png',
                              height: screenHeight * 0.03,
                              color: iconColor,
                            ),
                            SizedBox(width: screenWidth * 0.02),
                            Text(chargerId, style: textStyle),
                          ],
                        ),

                        // Double divider ||
                        Row(
                          children: [
                            Container(
                              width: 2,
                              height: screenHeight * 0.04,
                              color: theme.dividerColor,
                            ),
                            SizedBox(width: screenWidth * 0.01),
                            Container(
                              width: 2,
                              height: screenHeight * 0.04,
                              color: theme.dividerColor,
                            ),
                          ],
                        ),

                        // Connector type
                        Row(
                          children: [
                            Image.asset(
                              connectorType == 1
                                  ? 'assets/icons/wall-socket.png'
                                  : 'assets/icons/charger_gun1.png',
                              height: screenHeight * 0.03,
                              color: iconColor,
                            ),
                            SizedBox(width: screenWidth * 0.02),
                            Text(
                              connectorType == 1 ? 'Socket' : 'Gun',
                              style: textStyle,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: screenHeight * 0.03),

                  // Car image
                  SizedBox(
                    height: screenHeight * 0.25,
                    width: double.infinity,
                    child: Image.asset(
                      Theme.of(context).brightness == Brightness.dark
                          ? 'assets/Image/evblack3.png'
                          : 'assets/Image/evwhite.png',
                      fit: BoxFit.cover,
                    ),
                  ),
                  SizedBox(height: screenHeight * 0.02),

                  // Status Card
                  Obx(() {
                    if (controller.chargingData.value == null) {
                      return const SizedBox.shrink();
                    }

                    final data = controller.chargingData.value!;
                    return Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(screenWidth * 0.04),
                      margin: EdgeInsets.symmetric(horizontal: screenWidth * 0.04),
                      decoration: BoxDecoration(
                        color: theme.cardColor,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: theme.dividerColor,
                          width: 0.5,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Status Row
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [

                              Container(
                                padding: EdgeInsets.symmetric(
                                  horizontal: screenWidth * 0.03,
                                  vertical: screenHeight * 0.005,
                                ),
                                decoration: BoxDecoration(
                                  color: data.chargerStatus == 'Available'
                                      ? Colors.green.withOpacity(0.2)
                                      : Colors.orange.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  data.chargerStatus,
                                  style: textStyle.copyWith(
                                    color: data.chargerStatus == 'Available'
                                        ? Colors.green
                                        : Colors.orange,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),

                          SizedBox(height: screenHeight * 0.02),

                          // Details Grid
                          GridView.count(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisCount: 2,
                            childAspectRatio: 3,
                            crossAxisSpacing: screenWidth * 0.02,
                            mainAxisSpacing: screenHeight * 0.01,
                            children: [
                              _buildDetailItem(
                                context,
                                'Capacity',
                                '${data.chargerCapacity} kW',
                                Image.asset(
                                  'assets/icons/power.png',
                                  width: 20,
                                  height: 20,
                                  color: Theme.of(context).iconTheme.color,
                                ),
                              ),
                              _buildDetailItem(
                                context,
                                'Last Updated',
                                DateFormat('HH:mm:ss').format(data.timestamp),
                                Image.asset(
                                  'assets/icons/24-hour.png',
                                  width: 20,
                                  height: 20,
                                  color: Theme.of(context).iconTheme.color,
                                ),
                              ),

                            ],
                          ),
                        ],
                      ),
                    );
                  }),

                  // Start/Stop Charging Button
                  SizedBox(height: screenHeight * 0.03),
                  Obx(() {
                    return ElevatedButton(
                      onPressed: controller.isLoading.value
                          ? null
                          : () {
                        if (controller.chargingData.value?.chargerStatus == 'Available') {
                          // Start charging logic
                        } else {
                          controller.endChargingSession(
                            connectorId: int.parse(connectorId),
                            chargerId: chargerId,
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        minimumSize: Size(screenWidth * 0.9, screenHeight * 0.06),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        controller.chargingData.value?.chargerStatus == 'Available'
                            ? 'Start Charging'
                            : 'Stop Charging',
                        style: textStyle.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),

          // Loading Indicator
          Obx(() => controller.isLoading.value
              ? const Center(child: CircularProgressIndicator())
              : const SizedBox.shrink()),
        ],
      ),
    );
  }

  Widget _buildDetailItem(
      BuildContext context,
      String title,
      String value,
      Widget icon, { // Changed from IconData to Widget
        bool isError = false,
      }) {
    final theme = Theme.of(context);
    return Row(
      children: [
        SizedBox(
          width: 20,
          height: 20,
          child: icon, // Use the widget directly
        ),
        SizedBox(width: MediaQuery.of(context).size.width * 0.02),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              title,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.hintColor,
              ),
            ),
            Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: isError ? Colors.red : null,
              ),
            ),
          ],
        ),
      ],
    );
  }
}