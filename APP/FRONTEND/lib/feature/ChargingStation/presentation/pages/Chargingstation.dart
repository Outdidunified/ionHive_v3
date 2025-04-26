import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/ChargingStation/presentation/controllers/Chargingstation_controllers.dart';
import 'package:ionhive/feature/ChargingStation/presentation/widgets/Chargingstationwidget.dart';
import 'package:ionhive/feature/more/presentation/pages/help&support/presentation/pages/contact%20us.dart';

class ChargingStationPage extends StatelessWidget {
  final Map<String, dynamic> station;
  final ChargingStationController controller = Get.put(ChargingStationController());

  ChargingStationPage({super.key, required this.station}) {
    controller.setStation(station);
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;
    print('station: $station');

    // Extract station details
    final stationId = station['station_id'] ?? 'Unknown station_id';
    print('station_id: $stationId');
    final savedStation = station['saved_station'] ?? 'Unknown saved_station';
    print('saved_station: $savedStation');
    final locationId = station['location_id'] ?? 'Unknown location';
    final stationAddress = station['station_address'] ?? 'Unknown Address';
    final network = station['network'] ?? 'Unknown Network';
    final availability = station['availability'] ?? 'Unknown';
    final chargerType = station['charger_type'] ?? 'Unknown';
    final chargerDetails = station['charger_details'] as List? ?? [];

    return Scaffold(
      body: Stack(
        children: [
          // Content
          Column(
            children: [
              Image.asset(
                'assets/Image/ionHive.png',
                width: screenWidth,
                height: screenHeight * 0.25, // 25% of screen height
                fit: BoxFit.cover,
              ),
              // Header Section
              StationHeader(
                locationId: locationId,
                stationAddress: stationAddress,
                network: network,
                chargerType: chargerType,
                availability: availability,
              ),
              const Divider(height: 1),
              Expanded(
                child: ListView(
                  padding: EdgeInsets.all(screenWidth * 0.04), // 4% of screen width
                  children: [
                    if (chargerDetails.isNotEmpty) ...[
                      for (int i = 0; i < chargerDetails.length; i++)
                        ChargerCard(
                          title: '${stationAddress} ${i + 1}',
                          power: '${chargerDetails[i]['max_power']}W',
                          price: '₹ ${i == 0 ? '24' : '21'}/kWh',
                          lastUsed: '24/04/2025',
                          sessions: i == 0 ? '1k+' : null,
                          connectors: [
                            ConnectorInfo(
                              name: chargerDetails[i]['model'] ?? 'Unknown',
                              type: chargerDetails[i]['type'] ?? 'Unknown',
                              power: '${chargerDetails[i]['max_power'] ?? 'N/A'}W',
                            ),
                          ],
                        ),
                    ] else ...[
                      ChargerCard(
                        title: '${stationAddress} 1',
                        power: '150kW',
                        price: '₹ 24/kWh',
                        lastUsed: '24/04/2025',
                        sessions: '1k+',
                        connectors: const [
                          ConnectorInfo(name: 'Connector Gun 1', type: 'CCS-2', power: '150kW'),
                          ConnectorInfo(name: 'Connector Gun 2', type: 'CCS-2', power: '30kW'),
                        ],
                      ),
                      SizedBox(height: screenHeight * 0.02), // 2% of screen height
                      ChargerCard(
                        title: '${stationAddress} 2',
                        power: '60kW',
                        price: '₹ 21/kWh',
                        lastUsed: '24/04/2025',
                        connectors: const [],
                      ),
                    ],
                    SizedBox(height: screenHeight * 0.02), // 2% of screen height
                  ],
                ),
              ),
            ],
          ),
          // Back Button
          Positioned(
            top: screenHeight * 0.05, // 5% of screen height
            left: screenWidth * 0.04, // 4% of screen width
            child: GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                padding: EdgeInsets.all(screenWidth * 0.02), // 2% of screen width
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.3),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.arrow_back_ios_new,
                  color: Colors.white,
                  size: screenWidth * 0.04, // 4% of screen width
                ),
              ),
            ),
          ),
          // Help Icon
          Positioned(
            top: screenHeight * 0.05, // 5% of screen height
            right: screenWidth * 0.15, // 15% of screen width
            child: GestureDetector(
              onTap: () {
                Get.to(() => ContactUs(), transition: Transition.rightToLeft);
              },
              child: Container(
                padding: EdgeInsets.all(screenWidth * 0.02), // 2% of screen width
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.3),
                  shape: BoxShape.circle,
                ),
                child: Image.asset(
                  'assets/icons/Help1.png',
                  color: Colors.white,
                  height: screenWidth * 0.04, // 4% of screen width
                ),
              ),
            ),
          ),
          // More Options
          Positioned(
            top: screenHeight * 0.05, // 5% of screen height
            right: screenWidth * 0.04, // 4% of screen width
            child: GestureDetector(
              onTapDown: (TapDownDetails details) {
                final tapPosition = details.globalPosition;
                controller.showMoreOptionsPopup(context, tapPosition, stationId);
              },
              child: Container(
                height: screenWidth * 0.08, // 8% of screen width
                width: screenWidth * 0.08, // 8% of screen width
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.3),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.more_vert,
                  color: Colors.white,
                  size: screenWidth * 0.04, // 4% of screen width
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}