import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/ChargingStation/presentation/pages/Chargingstation.dart';
import 'package:ionhive/feature/home/domain/repositories/home_repository.dart';
import 'package:ionhive/feature/home/presentation/pages/Viewallnearbychargers.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';
import '../controllers/navigation_helper.dart';

class HomeController extends GetxController with WidgetsBindingObserver {
  final markers = <Marker>{}.obs;
  final isLoading = false.obs;
  final zoomLevel = 16.5.obs;
  final currentPosition = const LatLng(12.9716, 77.5946).obs;
  final isLocationFetched = false.obs;
  final selectedChargerIndex = 0.obs;
  GoogleMapController? mapController;
  Completer<GoogleMapController> mapControllerCompleter = Completer();
  PageController? stationPageController;
  SessionController? _sessionController;

  Marker? _selectedLocationMarker;
  DateTime? _lastFetchTime;

  SessionController get sessionController {
    if (_sessionController == null) {
      try {
        _sessionController = Get.find<SessionController>();
      } catch (e) {
        debugPrint("SessionController not found: $e");
      }
    }
    return _sessionController ?? SessionController();
  }

  final HomeRepository _homeRepository = HomeRepository();
  final isDarkMode = false.obs;

  BitmapDescriptor? _locationIcon;
  BitmapDescriptor? _largeChargerIcon;
  BitmapDescriptor? _mediumChargerIcon;
  BitmapDescriptor? _smallChargerIcon;
  BitmapDescriptor? _selectedLocationIcon;

  final RxList<Map<String, dynamic>> chargers = <Map<String, dynamic>>[].obs;

  String lightStyle = '';
  String darkStyle = '';

  @override
  void onInit() {
    super.onInit();
    WidgetsBinding.instance.addObserver(this);
    _initThemeListener();
    loadMapStyles();

    _loadCustomIcons().then((_) {
      if (isLocationFetched.value) {
        loadChargerMarkers();
      }
    });

    mapControllerCompleter.future.then((controller) {
      mapController = controller;
      applyMapStyle();
      if (!isLocationFetched.value) {
        _checkLocationPermissionAndFetch();
      }
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      if (_lastFetchTime == null ||
          DateTime.now().difference(_lastFetchTime!).inMinutes > 5) {
        _checkLocationPermissionOnResume();
      }
    }
  }

  Future<void> _checkLocationPermissionOnResume() async {
    try {
      final permissionStatus = await Permission.locationWhenInUse.status;
      if (permissionStatus == PermissionStatus.granted &&
          !isLocationFetched.value) {
        await getCurrentLocation();
      }
    } catch (e) {
      debugPrint('Error checking location permission on resume: $e');
    }
  }

  Future<void> _loadCustomIcons() async {
    try {
      _locationIcon = await BitmapDescriptor.fromAssetImage(
        const ImageConfiguration(size: Size(64, 64)),
        'assets/icons/customer.png',
      );

      _largeChargerIcon = await BitmapDescriptor.fromAssetImage(
        const ImageConfiguration(size: Size(64, 64)),
        'assets/icons/ev-charger.png',
      );

      _mediumChargerIcon = await BitmapDescriptor.fromAssetImage(
        const ImageConfiguration(size: Size(48, 48)),
        'assets/icons/ev-charger.png',
      );

      _smallChargerIcon = await BitmapDescriptor.fromAssetImage(
        const ImageConfiguration(size: Size(32, 32)),
        'assets/icons/ev-charger.png',
      );

      _selectedLocationIcon = await BitmapDescriptor.fromAssetImage(
        const ImageConfiguration(size: Size(48, 48)),
        'assets/icons/slocation.png',
      );

      debugPrint('All custom icons loaded successfully');
    } catch (e) {
      debugPrint('Error loading custom icons: $e');
      _locationIcon =
          BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue);
      _largeChargerIcon =
          BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
      _mediumChargerIcon =
          BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
      _smallChargerIcon =
          BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
      _selectedLocationIcon =
          BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
    }
  }

  void _initThemeListener() {
    isDarkMode.value = Get.isDarkMode;
    ever(isDarkMode, (_) async {
      if (mapController != null) await applyMapStyle();
    });
  }

  Future<void> _checkLocationPermissionAndFetch() async {
    try {
      final permissionStatus = await Permission.locationWhenInUse.status;
      if (permissionStatus == PermissionStatus.granted) {
        debugPrint('Location permission already granted, fetching location...');
        await getCurrentLocation();
      } else {
        debugPrint(
            'Location permission not granted yet, waiting for user action');
      }
    } catch (e) {
      debugPrint('Error checking location permission: $e');
    }
  }

  Future<void> loadMapStyles() async {
    try {
      lightStyle = await rootBundle.loadString('assets/Map/Map.json');
      darkStyle = await rootBundle.loadString('assets/Map/DarkMap.json');
      debugPrint('Map styles loaded successfully');
    } catch (e) {
      debugPrint('Error loading map styles: $e');
      lightStyle = '';
      darkStyle = '';
    }
  }

  Future<bool> applyMapStyle() async {
    if (mapController == null) return false;
    final style = isDarkMode.value ? darkStyle : lightStyle;
    if (style.isEmpty) return false;

    try {
      await mapController!.setMapStyle(style);
      return true;
    } catch (e) {
      debugPrint('Error applying map style: $e');
      return false;
    }
  }

  Future<void> getCurrentLocation() async {
    isLoading.value = true;
    try {
      final permissionStatus = await Permission.locationWhenInUse.status;

      if (permissionStatus != PermissionStatus.granted) {
        debugPrint('Location permission not granted, requesting...');
        final requestStatus = await Permission.locationWhenInUse.request();

        if (requestStatus != PermissionStatus.granted) {
          CustomSnackbar.showPermissionRequest(
            message:
                'Location permission is needed to locate nearby charging stations',
            onOpenSettings: () async {
              await openAppSettings();
            },
          );
          isLoading.value = false;
          return;
        }
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 15),
      );

      currentPosition.value = LatLng(position.latitude, position.longitude);
      isLocationFetched.value = true;
      _lastFetchTime = DateTime.now();

      await fetchNearbyChargers();
      loadChargerMarkers();

      if (mapController != null) {
        await mapController!.animateCamera(
          CameraUpdate.newLatLngZoom(currentPosition.value, zoomLevel.value),
        );
        await _zoomToNearestMarker();
      }
    } catch (e) {
      debugPrint('Error getting location: ${e.toString()}');

      if (e is LocationServiceDisabledException) {
        CustomSnackbar.showPermissionRequest(
          message:
              'Location services are disabled. Please enable them to find nearby charging stations',
          onOpenSettings: () async {
            await Geolocator.openLocationSettings();
          },
        );
      } else {
        CustomSnackbar.showError(
          message: 'Could not get your location. Please try again later.',
        );
      }
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> refreshData() async {
    debugPrint('Manually refreshing data...');
    isLoading.value = true;
    try {
      await getCurrentLocation();
      await fetchNearbyChargers();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _zoomToNearestMarker() async {
    if (chargers.isEmpty) return;

    final nearest = chargers.reduce((a, b) {
      final distA =
          _calculateDistance(currentPosition.value, a['position'] as LatLng);
      final distB =
          _calculateDistance(currentPosition.value, b['position'] as LatLng);
      return distA < distB ? a : b;
    });

    final nearestPosition = nearest['position'] as LatLng;
    final bounds = LatLngBounds(
      southwest: LatLng(
        min(currentPosition.value.latitude, nearestPosition.latitude),
        min(currentPosition.value.longitude, nearestPosition.longitude),
      ),
      northeast: LatLng(
        max(currentPosition.value.latitude, nearestPosition.latitude),
        max(currentPosition.value.longitude, nearestPosition.longitude),
      ),
    );

    await mapController!.animateCamera(
      CameraUpdate.newLatLngBounds(bounds, 150),
    );
    await Future.delayed(const Duration(milliseconds: 500));
    await mapController!.animateCamera(CameraUpdate.zoomBy(0.5));
  }

  double _calculateDistance(LatLng pos1, LatLng pos2) {
    return Geolocator.distanceBetween(
      pos1.latitude,
      pos1.longitude,
      pos2.latitude,
      pos2.longitude,
    );
  }

  void loadChargerMarkers() {
    debugPrint('Loading charger markers...');

    final selectedLocationMarker = markers.firstWhere(
      (marker) => marker.markerId.value == 'selectedLocation',
      orElse: () => Marker(markerId: MarkerId('not_found')),
    );

    markers.clear();

    BitmapDescriptor chargerIcon;
    if (_largeChargerIcon == null ||
        _mediumChargerIcon == null ||
        _smallChargerIcon == null) {
      debugPrint('Custom charger icons not loaded yet, using default');
      chargerIcon =
          BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
    } else if (zoomLevel.value >= 18.0) {
      chargerIcon = _largeChargerIcon!;
    } else if (zoomLevel.value >= 15.0) {
      chargerIcon = _mediumChargerIcon!;
    } else {
      chargerIcon = _smallChargerIcon!;
    }

    for (var i = 0; i < chargers.length; i++) {
      final charger = chargers[i];
      final isSelected = i == selectedChargerIndex.value;

      markers.add(Marker(
        markerId: MarkerId(charger['id'] as String),
        position: charger['position'] as LatLng,
        icon: isSelected ? (_largeChargerIcon ?? chargerIcon) : chargerIcon,
        infoWindow: InfoWindow(
          title: charger['name'] as String,
          snippet:
              '${charger['type'] as String} - ${charger['distance'] as int}m',
        ),
        zIndex: isSelected ? 2.0 : 1.0,
        onTap: () {
          showStationDetails(charger);

          if (selectedChargerIndex.value != i) {
            selectedChargerIndex.value = i;
            loadChargerMarkers();
            markers.refresh();
            debugPrint('Refreshed markers after selecting charger $i');

            if (stationPageController != null) {
              stationPageController!.animateToPage(
                i,
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
              );
            }
          }
        },
      ));
    }

    markers.add(Marker(
      markerId: const MarkerId('currentLocation'),
      position: currentPosition.value,
      icon: _locationIcon ??
          BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      zIndex: 2,
    ));

    if (selectedLocationMarker.markerId.value != 'not_found') {
      markers.add(selectedLocationMarker);
      debugPrint('Preserved selectedLocation marker: $selectedLocationMarker');
    } else if (_selectedLocationMarker != null) {
      markers.add(_selectedLocationMarker!);
      debugPrint('Restored selectedLocation marker: $_selectedLocationMarker');
    }

    debugPrint('Loaded ${markers.length} markers');
  }

  void zoomIn() {
    debugPrint('Zooming in to current location');
    zoomLevel.value = min(zoomLevel.value + 1.5, 21.0);
    _updateMapZoom(centerOnCurrentLocation: true);
  }

  void zoomOut() {
    debugPrint('Zooming out from current location');
    zoomLevel.value = max(zoomLevel.value - 1.5, 2.0);
    _updateMapZoom(centerOnCurrentLocation: true);
  }

  void _updateMapZoom({bool centerOnCurrentLocation = false}) {
    if (mapController != null) {
      if (centerOnCurrentLocation) {
        debugPrint(
            'Centering on current location at zoom level: ${zoomLevel.value}');
        mapController!
            .animateCamera(
          CameraUpdate.newLatLngZoom(currentPosition.value, zoomLevel.value),
        )
            .then((_) {
          loadChargerMarkers();
          markers.refresh();
          debugPrint('Zoom in/out completed, markers refreshed');
        });
      } else {
        mapController!
            .animateCamera(
          CameraUpdate.zoomTo(zoomLevel.value),
        )
            .then((_) {
          loadChargerMarkers();
          markers.refresh();
          debugPrint('Zoom in/out completed, markers refreshed');
        });
      }
    }
  }

  Future<void> animateToCharger(int index) async {
    if (index < 0 || index >= chargers.length || mapController == null) {
      return;
    }

    selectedChargerIndex.value = index;
    final charger = chargers[index];
    final position = charger['position'] as LatLng;

    loadChargerMarkers();
    markers.refresh();

    await mapController!.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(
          target: position,
          zoom: 16.0,
          bearing: 0,
          tilt: 0,
        ),
      ),
    );

    await Future.delayed(const Duration(milliseconds: 150));

    await mapController!.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(
          target: position,
          zoom: 18.0,
          tilt: 30.0,
          bearing: 0.0,
        ),
      ),
    );

    _bounceMarker(charger['id'].toString());
  }

  void _bounceMarker(String markerId) async {
    loadChargerMarkers();

    final markerToHighlight = markers.firstWhere(
      (marker) => marker.markerId.value == markerId,
      orElse: () => Marker(markerId: MarkerId('not_found')),
    );

    if (markerToHighlight.markerId.value != 'not_found') {
      for (int i = 0; i < 2; i++) {
        final largeMarker = markerToHighlight.copyWith(
          iconParam: _largeChargerIcon,
          zIndexParam: 3.0,
        );

        markers.remove(markerToHighlight);
        markers.add(largeMarker);
        markers.refresh();

        await Future.delayed(const Duration(milliseconds: 150));

        final mediumMarker = markerToHighlight.copyWith(
          iconParam: _mediumChargerIcon,
          zIndexParam: 2.5,
        );

        markers.remove(largeMarker);
        markers.add(mediumMarker);
        markers.refresh();

        await Future.delayed(const Duration(milliseconds: 150));
      }

      final finalMarker = markerToHighlight.copyWith(
        iconParam: _largeChargerIcon,
        zIndexParam: 2.0,
      );

      markers.removeWhere((m) => m.markerId.value == markerId);
      markers.add(finalMarker);
      markers.refresh();
    }
  }

  Future<void> zoomToCurrentLocation() async {
    debugPrint('Zooming to current location...');
    isLoading.value = true; // Show loading indicator
    try {
      final permissionStatus = await Permission.locationWhenInUse.status;
      if (permissionStatus != PermissionStatus.granted) {
        debugPrint('Location permission not granted, requesting...');
        final requestStatus = await Permission.locationWhenInUse.request();
        if (requestStatus != PermissionStatus.granted) {
          CustomSnackbar.showPermissionRequest(
            message:
                'Location permission is needed to locate nearby charging stations',
            onOpenSettings: () async {
              await openAppSettings();
            },
          );
          return;
        }
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 5),
      );

      debugPrint(
          'Updated position: ${position.latitude}, ${position.longitude}');
      currentPosition.value = LatLng(position.latitude, position.longitude);
      isLocationFetched.value = true;
      _lastFetchTime = DateTime.now();

      markers
          .removeWhere((marker) => marker.markerId.value == 'selectedLocation');
      _selectedLocationMarker = null;

      await fetchNearbyChargers();
      loadChargerMarkers();
      markers.refresh();

      if (mapController != null) {
        final zoomValue = 19.0;
        debugPrint('Animating camera to zoom level: $zoomValue');
        await mapController!.animateCamera(
          CameraUpdate.newLatLngZoom(currentPosition.value, zoomValue),
        );
      } else {
        debugPrint('Map controller is null, cannot zoom to current location');
        CustomSnackbar.showError(
          message: 'Map not ready, please try again.',
        );
      }
    } catch (e) {
      debugPrint('Error getting location: $e');
      if (e is LocationServiceDisabledException) {
        CustomSnackbar.showPermissionRequest(
          message:
              'Location services are disabled. Please enable them to find nearby charging stations',
          onOpenSettings: () async {
            await Geolocator.openLocationSettings();
          },
        );
      } else {
        CustomSnackbar.showError(
          message: 'Could not get your location. Please try again later.',
        );
      }
    } finally {
      isLoading.value = false; // Hide loading indicator
    }
  }

  Future<void> fetchNearbyChargers(
      {double? latitude, double? longitude}) async {
    if (!Get.isRegistered<SessionController>()) {
      debugPrint("SessionController not registered yet, skipping fetch");
      return;
    }

    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;

    if (authToken.isEmpty || userId <= 0 || emailId.isEmpty) {
      debugPrint("Missing session data, skipping fetch");
      return;
    }

    final fetchLat = latitude ?? currentPosition.value.latitude;
    final fetchLng = longitude ?? currentPosition.value.longitude;

    debugPrint(
        'Fetching nearby chargers for coordinates: ($fetchLat, $fetchLng)');

    isLoading.value = true;
    try {
      debugPrint("Fetching nearby chargers...");
      final fetchResponseModel = await _homeRepository.fetchnearbychargers(
          userId, emailId, authToken, fetchLat, fetchLng);

      debugPrint(
          "Fetch nearbychargers response: ${fetchResponseModel.toJson()}");

      if (fetchResponseModel.success) {
        if (fetchResponseModel.nearbychargers != null) {
          final nearbyChargersData = fetchResponseModel.nearbychargers;

          if (nearbyChargersData is List) {
            final List<dynamic> stationsData = nearbyChargersData;

            chargers.clear();

            for (var i = 0; i < stationsData.length; i++) {
              final station = stationsData[i];

              if (station['station_id'] != null &&
                  station['latitude'] != null &&
                  station['longitude'] != null) {
                double lat, lng;
                try {
                  lat = double.parse(station['latitude'].toString());
                  lng = double.parse(station['longitude'].toString());
                } catch (e) {
                  debugPrint("Error parsing coordinates: $e");
                  continue;
                }

                final distance = Geolocator.distanceBetween(
                  fetchLat,
                  fetchLng,
                  lat,
                  lng,
                ).round();

                chargers.add({
                  "id": station['station_id'].toString(),
                  "station_id": station['station_id'],
                  "saved_station": station['saved_station'],
                  "position": LatLng(lat, lng),
                  "name":
                      "${station['location_id'] ?? ''} | ${station['station_address'] ?? 'Unknown Location'}",
                  "type": station['charger_type'] ?? "Unknown Type",
                  "distance": distance,
                  "available": station['availability'] == "Open 24/7" ||
                      station['availability'] == "Available",
                  "location_id": station['location_id'] ?? '',
                  "station_address":
                      station['station_address'] ?? 'Unknown Location',
                  "landmark": station['landmark'] ?? 'No landmark information',
                  "network": station['network'] ?? 'Unknown Network',
                  "availability": station['availability'] ?? 'Unknown',
                  "accessibility": station['accessibility'] ?? 'Public',
                  "charger_type": station['charger_type'] ?? 'Unknown',
                });
              }
            }

            loadChargerMarkers();
            markers.refresh();

            debugPrint(
                "Updated chargers list with ${chargers.length} stations");
          } else if (nearbyChargersData is Map &&
              nearbyChargersData.containsKey('charger_details')) {
            final List<dynamic> chargerDetails =
                nearbyChargersData['charger_details'];

            chargers.clear();

            for (var i = 0; i < chargerDetails.length; i++) {
              final charger = chargerDetails[i];

              if (charger['charger_id'] != null &&
                  charger['lat'] != null &&
                  charger['long'] != null) {
                double lat, lng;
                try {
                  lat = double.parse(charger['lat'].toString());
                  lng = double.parse(charger['long'].toString());
                } catch (e) {
                  debugPrint("Error parsing coordinates: $e");
                  continue;
                }

                final distance = Geolocator.distanceBetween(
                  fetchLat,
                  fetchLng,
                  lat,
                  lng,
                ).round();

                chargers.add({
                  "id": charger['charger_id'].toString(),
                  "position": LatLng(lat, lng),
                  "name":
                      "${charger['model'] ?? ''} | ${charger['address'] ?? 'Unknown Location'}",
                  "type": charger['charger_type'] ?? "Unknown Type",
                  "distance": distance,
                  "available": charger['status'] == true,
                });
              }
            }

            loadChargerMarkers();
            markers.refresh();

            debugPrint(
                "Updated chargers list with ${chargers.length} chargers");
          } else {
            debugPrint("Unexpected response format: $nearbyChargersData");
          }
        } else {
          debugPrint("Nearby chargers data is null");
        }
      } else {
        debugPrint("Fetch failed: ${fetchResponseModel.message}");
      }
    } catch (e) {
      debugPrint("Error fetching nearby chargers: $e");
      CustomSnackbar.showError(message: 'Error: $e');
    } finally {
      isLoading.value = false;
      _lastFetchTime = DateTime.now();
    }
  }

  void navigateToAllChargers() {
    if (chargers.isEmpty) {
      Get.snackbar(
        'No Chargers',
        'No nearby chargers available',
        snackPosition: SnackPosition.BOTTOM,
      );
    } else {
      Get.to(
        () => ViewAllNearbyChargers(),
        transition: Transition.rightToLeft,
        duration: Duration(milliseconds: 300),
      );
    }
  }

  Future<void> launchGoogleMapsNavigation(LatLng destination) async {
    print("lat long : $destination");
    final uri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving',
    );

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        CustomSnackbar.showError(message: 'Could not launch Google Maps');
      }
    } catch (e) {
      debugPrint('Error launching Google Maps: $e');
      CustomSnackbar.showError(message: 'Error opening navigation');
    }
  }

  Future<void> launchGoogleMapsNavigationWithName(
      double latitude, double longitude, String destinationName) async {
    try {
      final encodedName = Uri.encodeComponent(destinationName);
      final googleMapsUrl =
          'https://www.google.com/maps/dir/?api=1&destination=$latitude,$longitude&destination_place_id=$encodedName&travelmode=driving';
      final uri = Uri.parse(googleMapsUrl);

      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        Get.snackbar(
          'Navigation Error',
          'Could not open Google Maps. Please make sure you have Google Maps installed.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red[700],
          colorText: Colors.white,
        );
      }
    } catch (e) {
      debugPrint('Error launching Google Maps: $e');
      Get.snackbar(
        'Navigation Error',
        'Could not open Google Maps: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red[700],
        colorText: Colors.white,
      );
    }
  }

  void showStationDetails(Map<String, dynamic> station) {
    final isDark = isDarkMode.value;

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 10,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    station['name'] as String,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    station['network'] as String? ?? 'Unknown Network',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Colors.green[700],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    station['station_address'] as String? ?? 'Unknown Location',
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? Colors.grey[300] : Colors.grey[800],
                    ),
                  ),
                ),
              ],
            ),
            if (station['landmark'] != null &&
                (station['landmark'] as String).isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4, left: 24),
                child: Text(
                  station['landmark'] as String,
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark ? Colors.grey[400] : Colors.grey[700],
                  ),
                ),
              ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                buildAppliedLocationItem(
                  icon: Icons.directions_car,
                  label: 'Distance',
                  value: '${station['distance'] as int} m',
                  isDark: isDark,
                ),
                buildAppliedLocationItem(
                  icon: Icons.electrical_services,
                  label: 'Type',
                  value: station['charger_type'] as String? ?? 'Unknown',
                  isDark: isDark,
                ),
                buildAppliedLocationItem(
                  icon: Icons.access_time,
                  label: 'Availability',
                  value: station['availability'] as String? ?? 'Unknown',
                  isDark: isDark,
                  valueColor: (station['available'] as bool?) == true
                      ? Colors.green[700]
                      : Colors.red[700],
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Get.back();
                      NavigationHelper.navigateToStation(station);
                    },
                    icon: const Icon(
                      Icons.directions,
                      color: Colors.white,
                    ),
                    label: const Text('Navigate'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green[700],
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Get.back();
                      Get.to(() => ChargingStationPage(station: station));
                    },
                    icon: const Icon(Icons.info_outline),
                    label: const Text('Details'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.green[700],
                      side: BorderSide(color: Colors.green[700]!),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      isScrollControlled: true,
      enableDrag: true,
      backgroundColor: Colors.transparent,
    );
  }

  Widget buildAppliedLocationItem({
    required IconData icon,
    required String label,
    required String value,
    required bool isDark,
    Color? valueColor,
  }) {
    return Column(
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: valueColor ?? (isDark ? Colors.white : Colors.black87),
          ),
        ),
      ],
    );
  }

  void addSelectedLocationMarker(String name, double latitude, double longitude,
      {bool isCurrentLocation = false}) async {
    debugPrint(
        'Attempting to add selected location marker for $name at ($latitude, $longitude), isCurrentLocation: $isCurrentLocation');

    final position = LatLng(latitude, longitude);

    markers
        .removeWhere((marker) => marker.markerId.value == 'selectedLocation');
    debugPrint('Removed any previous selectedLocation marker');

    final newMarker = Marker(
      markerId: const MarkerId('selectedLocation'),
      position: position,
      icon: isCurrentLocation
          ? (_locationIcon ??
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue))
          : (_selectedLocationIcon ??
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed)),
      infoWindow: InfoWindow(title: name),
      zIndex: 3.0,
    );
    debugPrint('Created new marker: $newMarker');

    _selectedLocationMarker = newMarker;
    debugPrint('Stored selectedLocation marker in _selectedLocationMarker');

    markers.add(newMarker);
    debugPrint('Added marker to markers set, total markers: ${markers.length}');

    final addedMarker = markers.firstWhere(
      (marker) => marker.markerId.value == 'selectedLocation',
      orElse: () => Marker(markerId: MarkerId('not_found')),
    );
    if (addedMarker.markerId.value == 'not_found') {
      debugPrint('Error: Newly added marker not found in markers set');
    } else {
      debugPrint('Marker successfully verified in the set');
    }

    if (mapController == null) {
      debugPrint('Error: Map controller is null, cannot animate camera');
      CustomSnackbar.showError(message: 'Map not ready, please try again.');
      return;
    }

    try {
      debugPrint('Animating camera to $position at zoom level 15.0');
      await mapController!.animateCamera(
        CameraUpdate.newLatLngZoom(position, 15.0),
      );
      debugPrint('Camera animation completed');
    } catch (e) {
      debugPrint('Error animating camera: $e');
      CustomSnackbar.showError(
          message: 'Failed to move map to selected location.');
    }

    await fetchNearbyChargers(latitude: latitude, longitude: longitude);
    _lastFetchTime = DateTime.now();

    markers.refresh();
    debugPrint('Markers refreshed, forcing UI update');
  }

  Future<bool> showExitConfirmationDialog(BuildContext context) async {
    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Exit App?'),
            content: const Text('Are you sure you want to exit the app?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: Text(
                  'Cancel',
                  style: TextStyle(color: Theme.of(context).hintColor),
                ),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: Text(
                  'Exit',
                  style: TextStyle(color: Theme.of(context).primaryColor),
                ),
              ),
            ],
          ),
        ) ??
        false;
  }

  void handleQrScannerPress() {
    debugPrint('QR scanner pressed');
    Get.snackbar(
      'QR Scanner',
      'QR Scanner functionality will be implemented here',
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  @override
  void onClose() {
    WidgetsBinding.instance.removeObserver(this);
    mapController?.dispose();
    mapController = null;
    stationPageController?.dispose();
    stationPageController = null;
    super.onClose();
  }
}
