// ignore_for_file: file_names

import 'package:flutter/material.dart';
import 'package:get/get.dart';
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
    final controller = Get.put(ChargingPageController());
    final theme = Theme.of(context);
    final iconColor = theme.iconTheme.color;

    debugPrint('Charging details: $chargerDetails');
    debugPrint('Connector details: $connectorDetails');

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          SafeArea(
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
                const SizedBox(height: 20),

                // Car Image
                Image.asset(
                  'assets/Image/evwhite.png',
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),

                const SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Image.asset(
                          'assets/icons/saved_device.png',
                          height: 25,
                        ),
                        const SizedBox(width: 8),
                        Text('Charger ID: $chargerId'),
                      ],
                    ),
                    Row(
                      children: [
                        Image.asset(
                          connectorDetails['type'].toString() == '1'
                              ? 'assets/icons/wall-socket.png'
                              : 'assets/icons/charger_gun1.png',
                          height: 25,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Type: ${connectorDetails['type'].toString() == '1' ? 'Socket' : 'Gun'}',
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
          // Only wrap the loading indicator in Obx
          Obx(() => controller.isLoading.value
              ? const Center(child: CircularProgressIndicator())
              : const SizedBox.shrink()),
        ],
      ),
    );
  }
}
