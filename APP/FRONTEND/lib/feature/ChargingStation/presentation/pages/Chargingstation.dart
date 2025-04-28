import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
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
    final latitude = station['latitude'] ?? 0.0; // Default to 0 if not provided
    final longitude = station['longitude'] ?? 0.0; // Default to 0 if not provided

    return Scaffold(
      body: GetBuilder<ChargingStationController>(
        init: controller,
        builder: (_) => Stack(
          children: [
            // Content
            Column(
              children: [
                Image.asset(
                  'assets/Image/ionHive.png',
                  width: screenWidth,
                  height: screenHeight * 0.25,
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
                Divider(
                  color: Colors.grey.shade400,
                  thickness: screenHeight * 0.0005,
                  height: screenHeight * 0.01,
                  indent: screenWidth * 0.03,
                  endIndent: screenWidth * 0.03,
                ),
                Expanded(
                  child: Obx(() {
                    print('Rebuilding IndexedStack with tab index: ${controller.selectedTabIndex.value}');
                    return IndexedStack(
                      index: controller.selectedTabIndex.value,
                      children: [
                        // Charger Tab Content
                        Obx(() {
                          if (controller.isLoading.value) {
                            return const ShimmerLoading();
                          }
                          return ListView(
                            padding: EdgeInsets.all(screenWidth * 0.04),
                            children: [
                              if (controller.chargerDetails.isNotEmpty)
                                ...controller.chargerDetails.asMap().entries.map((entry) {
                                  final i = entry.key;
                                  final detail = entry.value;
                                  return Column(
                                    children: [
                                      GestureDetector(
                                        onTap: () => controller.toggleChargerDetails(i),
                                        child: ChargerCard(
                                          title: '${detail['address']} ${i + 1}',
                                          power: '${detail['max_power']}W',
                                          price: '₹ ${i == 0 ? '24' : '21'}/kWh',
                                          lastUsed: '24/04/2025',
                                          sessions: i == 0 ? '1k+' : null,
                                          vendor: detail['vendor'] ?? 'Unknown',
                                          chargerId: detail['charger_id'] ?? 'N/A',
                                          chargerType: detail['charger_type'] ?? 'N/A',
                                          connectors: (detail['connectors'] as List<dynamic>).map((connector) {
                                            return ConnectorInfo(
                                              name: connector['connector_id'].toString(),
                                              type: connector['connector_type'].toString(),
                                              power: '${detail['max_power'] ?? 'N/A'}W',
                                              status: connector['charger_status'] ?? ' - ',
                                            );
                                          }).toList(),
                                          isExpanded: controller.expandedChargerIndex.value == i,
                                          index: i, // Pass the index
                                        ),
                                      ),
                                      SizedBox(height: screenHeight * 0.02),
                                    ],
                                  );
                                })
                              else ...[
                                SizedBox(height: screenHeight * 0.2),
                                Center(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Image.asset(
                                        'assets/icons/saved_device.png',
                                        width: screenWidth * 0.1,
                                        height: screenWidth * 0.1,
                                        color: Colors.grey,
                                      ),
                                      SizedBox(height: screenHeight * 0.02),
                                      Text(
                                        'There are no chargers available in this station',
                                        style: TextStyle(
                                          fontSize: screenWidth * 0.045,
                                          color: Colors.grey,
                                          fontWeight: FontWeight.w500,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                              SizedBox(height: screenHeight * 0.02),
                            ],
                          );
                        }),
                        // Details Tab Content (Google Map)
                        Container(
                          padding: EdgeInsets.all(screenWidth * 0.04),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Station Location',
                                style: TextStyle(
                                  fontSize: screenWidth * 0.045,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(height: screenHeight * 0.02),
                              Container(
                                height: screenHeight * 0.4,
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey.shade300),
                                  borderRadius: BorderRadius.circular(screenWidth * 0.02),
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(screenWidth * 0.02),
                                  child: GoogleMap(
                                    initialCameraPosition: CameraPosition(
                                      target: LatLng(latitude, longitude),
                                      zoom: 15,
                                    ),
                                    markers: {
                                      Marker(
                                        markerId: MarkerId('station'),
                                        position: LatLng(latitude, longitude),
                                        infoWindow: InfoWindow(
                                          title: stationAddress,
                                        ),
                                      ),
                                    },
                                    onMapCreated: (GoogleMapController controller) {
                                      print('Google Map created');
                                    },
                                  ),
                                ),
                              ),
                              SizedBox(height: screenHeight * 0.02),
                              Text(
                                'Address: $stationAddress',
                                style: TextStyle(fontSize: screenWidth * 0.035),
                              ),
                            ],
                          ),
                        ),
                        // Reviews Tab Content (Disabled Navigation)
                        Center(
                          child: Text(
                            'Reviews feature coming soon!',
                            style: TextStyle(fontSize: screenWidth * 0.04, color: Colors.grey),
                          ),
                        ),
                      ],
                    );
                  }),
                ),
              ],
            ),
            // Back Button
            Positioned(
              top: screenHeight * 0.05,
              left: screenWidth * 0.04,
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: EdgeInsets.all(screenWidth * 0.02),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.3),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.arrow_back_ios_new,
                    color: Colors.white,
                    size: screenWidth * 0.04,
                  ),
                ),
              ),
            ),
            // Help Icon
            Positioned(
              top: screenHeight * 0.05,
              right: screenWidth * 0.15,
              child: GestureDetector(
                onTap: () {
                  Get.to(() => ContactUs(), transition: Transition.rightToLeft);
                },
                child: Container(
                  padding: EdgeInsets.all(screenWidth * 0.02),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.3),
                    shape: BoxShape.circle,
                  ),
                  child: Image.asset(
                    'assets/icons/Help1.png',
                    color: Colors.white,
                    height: screenWidth * 0.04,
                  ),
                ),
              ),
            ),
            // More Options
            Positioned(
              top: screenHeight * 0.05,
              right: screenWidth * 0.04,
              child: GestureDetector(
                onTapDown: (TapDownDetails details) {
                  final tapPosition = details.globalPosition;
                  controller.showMoreOptionsPopup(context, tapPosition, stationId);
                },
                child: Container(
                  height: screenWidth * 0.08,
                  width: screenWidth * 0.08,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.3),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.more_vert,
                    color: Colors.white,
                    size: screenWidth * 0.04,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}