// ignore_for_file: file_names

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:ionhive/core/controllers/session_controller.dart' show SessionController;
import 'package:ionhive/feature/ChargingStation/presentation/controllers/Chargingstation_controllers.dart';
import 'package:ionhive/feature/ChargingStation/presentation/widgets/Chargingstationwidget.dart';
import 'package:ionhive/feature/home/presentation/pages/search/presentation/controllers/search_controllers.dart';
import 'package:ionhive/feature/more/presentation/pages/help&support/presentation/pages/contact%20us.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';


// ignore: must_be_immutable
class ChargingStationPage extends StatelessWidget {
  final Map<String, dynamic> station;
  final ChargingStationController controller =
      Get.put(ChargingStationController());
  final searchpageController = Get.find<SearchpageController>();

  // Controller to manage the Google Map
  GoogleMapController? _mapController;

  ChargingStationPage({super.key, required this.station}) {
    // Set the initial tab to "Charger" (index 0) when the page loads
    if (controller.selectedTabIndex.value != 0) {
      controller.selectedTabIndex.value = 0;
    }

    // We'll call setStation in initState via a post-frame callback
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.setStation(station);
    });
  }

  String formatLastUsed(String? lastUsed) {
    if (lastUsed == null || lastUsed.isEmpty || lastUsed == '-') return '-';

    try {
      final dateTime = DateTime.parse(lastUsed).toUtc().add(const Duration(hours: 5, minutes: 30)); // IST
      return DateFormat('dd/MM/yyyy hh:mm a').format(dateTime);
    } catch (e) {
      return '-';
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

  // Define map styles for light and dark themes
  static const String _lightMapStyle = '''
  [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dadada"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c9c9c9"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    }
  ]
  ''';

  static const String _darkMapStyle = '''
  [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#181818"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#1b1b1b"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#2c2c2c"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#8a8a8a"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#373737"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#3c3c3c"
        }
      ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#4e4e4e"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#3d3d3d"
        }
      ]
    }
  ]
  ''';

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;
    final theme = Theme.of(context);
    debugPrint('station: $station');
    final sessionController = Get.find<SessionController>();


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

    return WillPopScope(
      onWillPop: () async {
        final controller = Get.find<ChargingStationController>();
        controller.hidePopup();
        return true;
      },
      child: Scaffold(
        backgroundColor: theme.scaffoldBackgroundColor,
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
                  color: theme.dividerColor,
                  thickness: screenHeight * 0.0005,
                  height: screenHeight * 0.01,
                  indent: screenWidth * 0.03,
                  endIndent: screenWidth * 0.03,
                ),
                Expanded(
                  child: Builder(builder: (context) {
                    return Obx(() {
                      debugPrint(
                          'Rebuilding IndexedStack with tab index: ${controller.selectedTabIndex.value}');
                      return IndexedStack(
                        index: controller.selectedTabIndex.value,
                        children: [
                          // Charger Tab Content
                          Builder(builder: (context) {
                            return Obx(() {
                              if (controller.isLoading.value) {
                                return const ShimmerLoading();
                              }
      
                              final details = controller.chargerDetails;
      
                              return ListView(
                                padding: EdgeInsets.all(screenWidth * 0.04),
                                children: [
                                  if (details.isNotEmpty)
                                    ...details.asMap().entries.map((entry) {
                                      final i = entry.key;
                                      final detail = entry.value;
      
                                      if (detail == null ||
                                          detail is! Map<String, dynamic>) {
                                        return const SizedBox.shrink();
                                      }
      
                                      return Column(
                                        children: [
                                          GestureDetector(
                                            onTap: () => controller
                                                .toggleChargerDetails(i),
                                            child: ChargerCard(
                                              title:
                                                  '${detail['address'] ?? 'Charger'} ${i + 1}',
                                              power:
                                                  '${detail['max_power'] ?? 'N/A'}W',
                                              price:
                                                  '₹ ${detail['unitPrice'] ?? '-'}/kWh',
                                              lastUsed: formatLastUsed(
                                                (detail['connectors'] as List?)?.isNotEmpty == true
                                                    ? detail['connectors'][0]['last_updated']
                                                    : null,
                                              ),

                                              sessions: i == 0 ? '1k+' : null,
                                              vendor:
                                                  detail['vendor'] ?? 'Unknown',
                                              chargerId:
                                                  detail['charger_id'] ?? 'N/A',
                                              chargerType:
                                                  detail['charger_type'] ?? 'N/A',
                                              connectors:
                                                  detail['connectors'] != null
                                                      ? (detail['connectors']
                                                              as List<dynamic>)
                                                          .map((connector) {
                                                          return ConnectorInfo(
                                                            name: connector[
                                                                        'connector_id']
                                                                    ?.toString() ??
                                                                'N/A',
                                                            type: connector[
                                                                        'connector_type']
                                                                    ?.toString() ??
                                                                'N/A',

                                                            power:
                                                                '${detail['max_power'] ?? 'N/A'}W',
                                                            status: connector[
                                                                    'charger_status'] ??
                                                                ' - ',
                                                          );
                                                        }).toList()
                                                      : [],
                                              isExpanded: controller
                                                      .expandedChargerIndex
                                                      .value ==
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
                                            color: theme.iconTheme.color
                                                ?.withOpacity(0.5),
                                          ),
                                          SizedBox(height: screenHeight * 0.02),
                                          Text(
                                            'There are no chargers available in this station',
                                            style: theme.textTheme.bodyLarge
                                                ?.copyWith(
                                              color: theme
                                                  .textTheme.bodyLarge?.color
                                                  ?.withOpacity(0.6),
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
                            });
                          }),
                          // Details Tab Content (Google Map)
                          SingleChildScrollView(
                            child: Container(
                              padding: EdgeInsets.all(screenWidth * 0.04),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Station Location',
                                    style: theme.textTheme.titleLarge?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: theme.textTheme.titleLarge?.color,
                                    ),
                                  ),
                                  SizedBox(height: screenHeight * 0.02),
                                  Container(
                                    height: screenHeight * 0.4,
                                    decoration: BoxDecoration(
                                      border:
                                          Border.all(color: theme.dividerColor),
                                      borderRadius: BorderRadius.circular(
                                          screenWidth * 0.02),
                                    ),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(
                                          screenWidth * 0.02),
                                      child: areCoordinatesValid
                                          ? GoogleMap(
                                              initialCameraPosition:
                                                  CameraPosition(
                                                target:
                                                    LatLng(latitude, longitude),
                                                zoom: 15,
                                              ),
                                              markers: {
                                                Marker(
                                                  markerId:
                                                      const MarkerId('station'),
                                                  position:
                                                      LatLng(latitude, longitude),
                                                  icon: BitmapDescriptor
                                                      .defaultMarkerWithHue(
                                                          BitmapDescriptor
                                                              .hueRed),
                                                  infoWindow: InfoWindow(
                                                    title: stationAddress,
                                                    snippet: 'Tap for actions',
                                                    onTap: () {
                                                      showModalBottomSheet(
                                                        context: context,
                                                        backgroundColor:
                                                            theme.cardTheme.color,
                                                        shape:
                                                            RoundedRectangleBorder(
                                                          borderRadius:
                                                              BorderRadius.vertical(
                                                                  top: Radius.circular(
                                                                      screenWidth *
                                                                          0.04)),
                                                        ),
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
                                                                  Icons
                                                                      .directions,
                                                                  color: theme
                                                                      .primaryColor,
                                                                ),
                                                                title: Text(
                                                                  'Get Directions',
                                                                  style: theme
                                                                      .textTheme
                                                                      .bodyLarge
                                                                      ?.copyWith(
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w600,
                                                                    color: theme
                                                                        .textTheme
                                                                        .bodyLarge
                                                                        ?.color,
                                                                  ),
                                                                ),
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
                                                                  color: theme
                                                                      .primaryColor,
                                                                ),
                                                                title: Text(
                                                                  'Share Location',
                                                                  style: theme
                                                                      .textTheme
                                                                      .bodyLarge
                                                                      ?.copyWith(
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w600,
                                                                    color: theme
                                                                        .textTheme
                                                                        .bodyLarge
                                                                        ?.color,
                                                                  ),
                                                                ),
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
                                                // Apply map style based on theme
                                                if (theme.brightness ==
                                                    Brightness.dark) {
                                                  mapController
                                                      .setMapStyle(_darkMapStyle);
                                                } else {
                                                  mapController.setMapStyle(
                                                      _lightMapStyle);
                                                }
                                                mapController
                                                    .showMarkerInfoWindow(
                                                        const MarkerId(
                                                            'station'));
                                              },
                                            )
                                          : Center(
                                              child: Text(
                                                'Invalid coordinates for this station',
                                                style: theme.textTheme.bodyLarge
                                                    ?.copyWith(
                                                  color: theme
                                                      .textTheme.bodyLarge?.color
                                                      ?.withOpacity(0.6),
                                                ),
                                              ),
                                            ),
                                    ),
                                  ),
                                  SizedBox(height: screenHeight * 0.02),
                                  Text(
                                    'Address: $stationAddress',
                                    style: theme.textTheme.bodyLarge?.copyWith(
                                      color: theme.textTheme.bodyLarge?.color
                                          ?.withOpacity(0.8),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          // Reviews Tab Content (Disabled Navigation)
                          Center(
                            child: Text(
                              'Reviews feature coming soon!',
                              style: theme.textTheme.bodyLarge?.copyWith(
                                color: theme.textTheme.bodyLarge?.color
                                    ?.withOpacity(0.6),
                              ),
                            ),
                          ),
                        ],
                      );
                    });
                  }),
                ),
              ],
            ),
            // Back Button
            Positioned(
              top: screenHeight * 0.05,
              left: screenWidth * 0.04,
              child: GestureDetector(
                onTap: () => Get.back(),
                child: Container(
                  padding: EdgeInsets.all(screenWidth * 0.02),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface.withOpacity(0.3),
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
                    color: theme.colorScheme.surface.withOpacity(0.3),
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
                    color: theme.colorScheme.surface.withOpacity(0.3),
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
                        color: theme.primaryColor,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: theme.shadowColor.withOpacity(0.2),
                            blurRadius: 10,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Obx(() {
                        final isLoading = searchpageController.isLoading.value;
                        return ElevatedButton(
                          onPressed: isLoading
                              ? null
                              : () {
                            controller.handleProtectedNavigation(
                              isLoggedIn: sessionController.isLoggedIn,
                              onAllowed: () {
                                if (charger != null && connector != null) {
                                  searchpageController.handleStartCharging(
                                    chargerId: charger['charger_id'],
                                    chargerDetails: charger,
                                    selectedConnectorId:
                                    connector['connector_id'].toString(),
                                    connectorDetailsMap: {
                                      'type': connector['connector_type'].toString(),
                                      'power': charger['max_power']?.toString() ?? 'N/A',
                                      'status': connector['charger_status'] ?? ' - ',
                                    },
                                  );
                                } else {
                                  debugPrint("Charger or Connector data is missing");
                                  Get.snackbar(
                                    'Error',
                                    'Charger or Connector data is missing',
                                    backgroundColor: theme.colorScheme.error,
                                    colorText: theme.colorScheme.onError,
                                  );
                                }
                              },
                            );
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
                            isLoading ? 'Processing...' : 'Charge Now',
                            style: theme.textTheme.titleLarge?.copyWith(
                              color: theme.colorScheme.onPrimary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        );
                      }),
                    ),
                  ),
                );
              }
              return const SizedBox.shrink();
            }),
          ],
        ),
      ),
    );
  }
}
