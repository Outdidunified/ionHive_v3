import 'dart:async';
import 'dart:math';
import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

class HomeController extends GetxController {
  final markers = <Marker>{}.obs;
  final isLoading = true.obs;
  final zoomLevel = 16.5.obs;
  final currentPosition = const LatLng(12.9716, 77.5946).obs;
  GoogleMapController? mapController;
  Completer<GoogleMapController> mapControllerCompleter = Completer();

  // Theme mode detection
  final isDarkMode = false.obs;

  // Custom icons
  BitmapDescriptor? _locationIcon;
  BitmapDescriptor? _largeChargerIcon;
  BitmapDescriptor? _mediumChargerIcon;
  BitmapDescriptor? _smallChargerIcon;

  // Charger data
  final List<Map<String, Object>> chargers = [
    {
      "id": "1",
      "position": const LatLng(12.9716, 77.5946),
      "name": "KA | Bengaluru | The Pavilion...",
      "type": "Hyundai EVCS",
      "distance": 826,
      "available": true,
    },
    {
      "id": "2",
      "position": const LatLng(12.9650, 77.5900),
      "name": "Tata Nexon EV | Bahja-HA",
      "type": "Tata",
      "distance": 129,
      "available": true,
    },
  ].obs;

  String lightStyle = '';
  String darkStyle = '';

  @override
  void onInit() {
    super.onInit();
    _initThemeListener();
    loadMapStyles();

    // Load custom icons first, then load markers after icons are loaded
    _loadCustomIcons().then((_) {
      // Now that icons are loaded, we can safely load markers
      loadChargerMarkers();
    });
  }

  Future<void> _loadCustomIcons() async {
    try {
      // Load location icon
      _locationIcon = await BitmapDescriptor.fromAssetImage(
        const ImageConfiguration(size: Size(64, 64)),
        'assets/icons/customer.png',
      );

      // Load charger icons in different sizes
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

      debugPrint('All custom icons loaded successfully');
    } catch (e) {
      debugPrint('Error loading custom icons: $e');
      // Fallback to default markers if custom icons fail to load
      _locationIcon =
          BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue);
      _largeChargerIcon =
          BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
      _mediumChargerIcon =
          BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
      _smallChargerIcon =
          BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
    }
  }

  void _initThemeListener() {
    isDarkMode.value = Get.isDarkMode;
    ever(isDarkMode, (_) async {
      if (mapController != null) await applyMapStyle();
    });
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
      final status = await Permission.locationWhenInUse.request();
      if (status != PermissionStatus.granted) {
        throw 'Location permission denied';
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 15),
      );

      currentPosition.value = LatLng(position.latitude, position.longitude);
      loadChargerMarkers();

      if (mapController != null) {
        await mapController!.animateCamera(
          CameraUpdate.newLatLngZoom(currentPosition.value, zoomLevel.value),
        );
        await _zoomToNearestMarker();
      }
    } catch (e) {
      Get.snackbar('Error', 'Could not get location: ${e.toString()}');
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
    debugPrint('Loading markers...');
    markers.clear();

    // Determine appropriate icon size based on zoom level
    // Use a default icon if custom icons aren't loaded yet
    BitmapDescriptor chargerIcon;
    if (_largeChargerIcon == null ||
        _mediumChargerIcon == null ||
        _smallChargerIcon == null) {
      // Icons not loaded yet, use default
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

    // Add charger markers
    for (var charger in chargers) {
      markers.add(Marker(
        markerId: MarkerId(charger['id'] as String),
        position: charger['position'] as LatLng,
        icon: chargerIcon,
        infoWindow: InfoWindow(
          title: charger['name'] as String,
          snippet:
              '${charger['type'] as String} - ${charger['distance'] as int}m',
        ),
        zIndex: 1,
      ));
    }

    // Add current location marker
    markers.add(Marker(
      markerId: const MarkerId('currentLocation'),
      position: currentPosition.value,
      icon: _locationIcon ??
          BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      zIndex: 2,
    ));
  }

  void zoomIn() {
    debugPrint('Zooming in to current location');
    // Increase zoom level by 1.5 for more noticeable zoom
    zoomLevel.value = min(zoomLevel.value + 1.5, 21.0);
    // Always zoom to current location
    _updateMapZoom(centerOnCurrentLocation: true);
  }

  void zoomOut() {
    debugPrint('Zooming out from current location');
    // Decrease zoom level by 1.5 for more noticeable zoom
    zoomLevel.value = max(zoomLevel.value - 1.5, 2.0);
    // Always zoom to current location
    _updateMapZoom(centerOnCurrentLocation: true);
  }

  void _updateMapZoom({bool centerOnCurrentLocation = false}) {
    if (mapController != null) {
      if (centerOnCurrentLocation) {
        // Zoom to current location with the new zoom level
        debugPrint(
            'Centering on current location at zoom level: ${zoomLevel.value}');
        mapController!
            .animateCamera(
          CameraUpdate.newLatLngZoom(currentPosition.value, zoomLevel.value),
        )
            .then((_) {
          loadChargerMarkers();
          markers.refresh();
        });
      } else {
        // Just update the zoom level without changing the center
        mapController!
            .animateCamera(
          CameraUpdate.zoomTo(zoomLevel.value),
        )
            .then((_) {
          loadChargerMarkers();
          markers.refresh();
        });
      }
    }
  }

  // Method to zoom to user's current location with a higher zoom level
  Future<void> zoomToCurrentLocation() async {
    debugPrint('Zooming to current location...');

    // First check if we have location permission
    final permissionStatus = await Permission.locationWhenInUse.status;
    if (permissionStatus != PermissionStatus.granted) {
      debugPrint('Location permission not granted, requesting...');
      final requestStatus = await Permission.locationWhenInUse.request();
      if (requestStatus != PermissionStatus.granted) {
        Get.snackbar('Permission required',
            'Location permission is needed to show your position');
        return;
      }
    }

    // Get the latest position
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 5),
      );

      debugPrint(
          'Updated position: ${position.latitude}, ${position.longitude}');
      currentPosition.value = LatLng(position.latitude, position.longitude);

      // Update charger markers
      loadChargerMarkers();
      markers.refresh();

      if (mapController != null) {
        // Use a higher zoom level (19.0) for street-level detail
        final zoomValue = 19.0;
        debugPrint('Animating camera to zoom level: $zoomValue');

        await mapController!.animateCamera(
          CameraUpdate.newLatLngZoom(currentPosition.value, zoomValue),
        );
      } else {
        debugPrint('Map controller is null, cannot zoom to current location');
      }
    } catch (e) {
      debugPrint('Error getting location: $e');
      Get.snackbar('Error', 'Could not get your location');
    }
  }

  @override
  void onClose() {
    mapController?.dispose();
    mapController = null;
    super.onClose();
  }
}
