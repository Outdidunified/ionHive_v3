import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

class HomeController extends GetxController {
  final markers = <Marker>{}.obs;
  final isLoading = true.obs;
  final darkMode = false.obs;
  final zoomLevel = 15.0.obs;
  final currentPosition = const LatLng(12.9716, 77.5946).obs; // Default to Bangalore
  GoogleMapController? mapController;
  Completer<GoogleMapController> mapControllerCompleter = Completer();

  // Charger data (simulated, replace with API call)
  final List<Map<String, dynamic>> chargers = [
    {
      "id": "1",
      "position": const LatLng(12.9716, 77.5946),
      "name": "KA | Bengaluru | The Pavilion...",
      "type": "Hyundai EVCS",
      "distance": 826,
      "available": true,
      "icon": BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
    },
    {
      "id": "2",
      "position": const LatLng(12.9650, 77.5900),
      "name": "Tata Nexon EV | Bahja-HA",
      "type": "Tata",
      "distance": 129,
      "available": true,
      "icon": BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueViolet),
    },
    // Add more charger locations as needed
  ].obs;

  String lightStyle = '';
  String darkStyle = '';

  @override
  void onInit() {
    super.onInit();
    loadMapStyles();
    _loadChargerMarkers();
    // Delay getting location until map is ready (handled in HomePage)
  }

  Future<void> loadMapStyles() async {
    try {
      lightStyle = await rootBundle.loadString('assets/map_styles/Map.json');
      darkStyle = await rootBundle.loadString('assets/map_styles/DarkMap.json');
      if (mapController != null) {
        applyMapStyle();
      }
    } catch (e) {
      debugPrint('Error loading map styles: $e');
    }
  }

  void toggleMapTheme() {
    darkMode.toggle();
    applyMapStyle();
    _forceMapRefresh();
  }

  void applyMapStyle() {
    if (mapController == null) return;
    final style = darkMode.value ? darkStyle : lightStyle;
    mapController!.setMapStyle(style);
  }

  Future<void> getCurrentLocation() async {
    isLoading.value = true;

    final status = await Permission.location.request();
    if (status != PermissionStatus.granted) {
      isLoading.value = false;
      Get.snackbar('Permission required', 'Location permission is needed');
      return;
    }

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await Geolocator.openLocationSettings();
        if (!serviceEnabled) throw 'Location services disabled';
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 15),
      );

      currentPosition.value = LatLng(position.latitude, position.longitude);
      _loadChargerMarkers(); // Update markers with new position for distance

      if (mapController != null) {
        await mapController!.animateCamera(
          CameraUpdate.newLatLngZoom(currentPosition.value, zoomLevel.value),
        );
        _forceMapRefresh();
      }
    } catch (e) {
      Get.snackbar('Error', 'Could not get location: ${e.toString()}');
    } finally {
      isLoading.value = false;
    }
  }

  void _loadChargerMarkers() {
    markers.clear();
    for (var charger in chargers) {
      markers.add(Marker(
        markerId: MarkerId(charger['id']),
        position: charger['position'],
        icon: charger['icon'],
        infoWindow: InfoWindow(
          title: charger['name'],
          snippet: '${charger['type']} - ${charger['distance']}m',
        ),
      ));
    }
    markers.add(Marker(
      markerId: const MarkerId('currentLocation'),
      position: currentPosition.value,
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
    ));
  }

  void _forceMapRefresh() {
    final current = currentPosition.value;
    if (mapController != null) {
      mapController!.animateCamera(CameraUpdate.newLatLng(current));
    }
  }

  void zoomIn() {
    zoomLevel.value += 1;
    if (mapController != null) {
      mapController!.animateCamera(CameraUpdate.zoomTo(zoomLevel.value));
    }
  }

  void zoomOut() {
    zoomLevel.value -= 1;
    if (mapController != null) {
      mapController!.animateCamera(CameraUpdate.zoomTo(zoomLevel.value));
    }
  }

  @override
  void onClose() {
    mapControllerCompleter = Completer();
    super.onClose();
  }
}