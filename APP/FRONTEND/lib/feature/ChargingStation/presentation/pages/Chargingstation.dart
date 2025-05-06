// ignore_for_file: file_names

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:ionhive/feature/ChargingStation/presentation/controllers/Chargingstation_controllers.dart';
import 'package:ionhive/feature/ChargingStation/presentation/widgets/Chargingstationwidget.dart';
import 'package:ionhive/feature/home/presentation/pages/search/presentation/controllers/search_controllers.dart';
import 'package:ionhive/feature/more/presentation/pages/help&support/presentation/pages/contact%20us.dart';
import 'package:url_launcher/url_launcher.dart';

// ignore: must_be_immutable
class ChargingStationPage extends StatelessWidget {
  final Map<String, dynamic> station;
  final ChargingStationController controller =
      Get.put(ChargingStationController());
  final searchpageController = Get.find<SearchpageController>();

  // Controller to manage the Google Map
  GoogleMapController? _mapController;

  ChargingStationPage({super.key, required this.station}) {
    controller.setStation(station);
    // Set the initial tab to "Charger" (index 0) when the page loads
    if (controller.selectedTabIndex.value != 0) {
      controller.selectedTabIndex.value = 0;
    }
  }

  // Function to launch Google Maps for directions
  Future<void> _launchDirections(double latitude, double longitude) async {
    final url =
        'https://www.google.com/maps/dir/?api=1&destination=$latitude,$longitude';
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    } else {
      debugPrint('Could not launch directions URL: $url');
      Get.snackbar('Error', 'Could not open directions in map app');
    }
  }

  // Function to share the location
  Future<void> _shareLocation(
      double latitude, double longitude, String address) async {
    final url =
        'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude';
    final shareText = 'Check out this charging station at $address: $url';
    final uri =
        Uri.parse('mailto:?subject=Charging Station Location&body=$shareText');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      debugPrint('Could not launch share URL: $uri');
      Get.snackbar('Error', 'Could not share location');
    }
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;
    debugPrint('station: $station');

    // Safely access controller.station, assuming it's an Rx object
    final controllerStation = controller.station is Rx
        ? (controller.station as Rx<Map<String, dynamic>>).value
        : controller.station ?? {};
    debugPrint('Controller station after setStation: $controllerStation');

    // Extract station details
    final stationId = station['station_id'] ?? 'Unknown station_id';
    debugPrint('station_id: $stationId');
    final savedStation = station['saved_station'] ?? 'Unknown saved_station';
    debugPrint('saved_station: $savedStation');
    final locationId = station['location_id'] ?? 'Unknown location';
    debugPrint('location_id: $locationId');
    final stationAddress = station['station_address'] ?? 'Unknown Address';
    debugPrint('station_address: $stationAddress');
    final network = station['network'] ?? 'Unknown Network';
    final availability = station['availability'] ?? 'Unknown';
    final chargerType = station['charger_type'] ?? 'Unknown';
    double latitude = 0.0;
    double longitude = 0.0;
    try {
      if (station['position'] != null) {
        final pos = station['position'];
        if (pos is LatLng) {
          latitude = pos.latitude;
          longitude = pos.longitude;
        }
      }
    } catch (e) {
      debugPrint('Error extracting position: $e');
    }
    final bool areCoordinatesValid = (latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180);

    return Scaffold(
      body: Stack(
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
                  debugPrint(
                      'Rebuilding IndexedStack with tab index: ${controller.selectedTabIndex.value}');
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
                              ...controller.chargerDetails
                                  .asMap()
                                  .entries
                                  .map((entry) {
                                final i = entry.key;
                                final detail = entry.value;
                                return Column(
                                  children: [
                                    GestureDetector(
                                      onTap: () =>
                                          controller.toggleChargerDetails(i),
                                      child: ChargerCard(
                                        title: '${detail['address']} ${i + 1}',
                                        power: '${detail['max_power']}W',
                                        price: '₹ ${i == 0 ? '24' : '21'}/kWh',
                                        lastUsed: '24/04/2025',
                                        sessions: i == 0 ? '1k+' : null,
                                        vendor: detail['vendor'] ?? 'Unknown',
                                        chargerId:
                                            detail['charger_id'] ?? 'N/A',
                                        chargerType:
                                            detail['charger_type'] ?? 'N/A',
                                        connectors: (detail['connectors']
                                                as List<dynamic>)
                                            .map((connector) {
                                          return ConnectorInfo(
                                            name: connector['connector_id']
                                                .toString(),
                                            type: connector['connector_type']
                                                .toString(),
                                            power:
                                                '${detail['max_power'] ?? 'N/A'}W',
                                            status:
                                                connector['charger_status'] ??
                                                    ' - ',
                                          );
                                        }).toList(),
                                        isExpanded: controller
                                                .expandedChargerIndex.value ==
                                            i,
                                        index: i,
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
                                borderRadius:
                                    BorderRadius.circular(screenWidth * 0.02),
                              ),
                              child: ClipRRect(
                                borderRadius:
                                    BorderRadius.circular(screenWidth * 0.02),
                                child: areCoordinatesValid
                                    ? GoogleMap(
                                        initialCameraPosition: CameraPosition(
                                          target: LatLng(latitude, longitude),
                                          zoom: 15,
                                        ),
                                        markers: {
                                          Marker(
                                            markerId: const MarkerId('station'),
                                            position:
                                                LatLng(latitude, longitude),
                                            infoWindow: InfoWindow(
                                              title: stationAddress,
                                              snippet: 'Tap for actions',
                                              onTap: () {
                                                showModalBottomSheet(
                                                  context: context,
                                                  builder: (context) =>
                                                      Container(
                                                    padding: EdgeInsets.all(
                                                        screenWidth * 0.04),
                                                    child: Column(
                                                      mainAxisSize:
                                                          MainAxisSize.min,
                                                      children: [
                                                        ListTile(
                                                          leading: Icon(
                                                              Icons.directions,
                                                              color:
                                                                  Colors.blue),
                                                          title: Text(
                                                              'Get Directions'),
                                                          onTap: () {
                                                            Navigator.pop(
                                                                context);
                                                            _launchDirections(
                                                                latitude,
                                                                longitude);
                                                          },
                                                        ),
                                                        ListTile(
                                                          leading: Icon(
                                                              Icons.share,
                                                              color:
                                                                  Colors.green),
                                                          title: Text(
                                                              'Share Location'),
                                                          onTap: () {
                                                            Navigator.pop(
                                                                context);
                                                            _shareLocation(
                                                                latitude,
                                                                longitude,
                                                                stationAddress);
                                                          },
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                );
                                              },
                                            ),
                                            onTap: () {
                                              _mapController
                                                  ?.showMarkerInfoWindow(
                                                      const MarkerId(
                                                          'station'));
                                            },
                                          ),
                                        },
                                        onMapCreated: (GoogleMapController
                                            mapController) {
                                          debugPrint('Google Map created');
                                          _mapController = mapController;
                                          mapController.showMarkerInfoWindow(
                                              const MarkerId('station'));
                                        },
                                      )
                                    : Center(
                                        child: Text(
                                          'Invalid coordinates for this station',
                                          style: TextStyle(
                                            fontSize: screenWidth * 0.04,
                                            color: Colors.grey,
                                          ),
                                        ),
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
                          style: TextStyle(
                              fontSize: screenWidth * 0.04, color: Colors.grey),
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
                controller.showMoreOptionsPopup(
                    context, tapPosition, stationId);
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
          // "Charge Now" Button as Floating Container
          Obx(() {
            final selectedConnector = controller.chargerDetails
                .asMap()
                .entries
                .where((entry) => entry.value['selectedConnectorIndex'] != -1)
                .firstOrNull;
            // Hide button if on Details tab (index 1)
            if (selectedConnector != null &&
                controller.selectedTabIndex.value != 1) {
              final charger = selectedConnector.value;
              final connectorIndex = charger['selectedConnectorIndex'];
              final connector =
                  (charger['connectors'] as List<dynamic>)[connectorIndex];
              return Positioned(
                left: 0,
                right: 0,
                bottom: screenHeight * 0.02,
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.1),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 10,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: () {
                        // Make sure you have valid data before calling the controller method
                        if (charger != null && connector != null) {
                          searchpageController.handleStartCharging(
                            chargerId: charger['charger_id'],
                            chargerDetails: charger,
                            selectedConnectorId:
                                connector['connector_id'].toString(),
                            connectorDetailsMap: {
                              'type': connector['connector_type'].toString(),
                              'power':
                                  charger['max_power']?.toString() ?? 'N/A',
                              'status': connector['charger_status'] ?? ' - ',
                            },
                          );
                        } else {
                          debugPrint("Charger or Connector data is missing");
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: EdgeInsets.symmetric(
                            vertical: screenHeight * 0.015),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
                        'Charge Now',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: screenWidth * 0.045,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }
            return const SizedBox.shrink();
          }),
        ],
      ),
    );
  }
}
