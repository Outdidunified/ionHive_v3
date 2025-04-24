import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

/// Helper class for navigation-related functionality
class NavigationHelper {
  /// Navigate to a charging station using Google Maps
  static Future<void> navigateToStation(Map<String, dynamic> station) async {
    try {
      // Get the latitude and longitude from the station
      double latitude;
      double longitude;

      // Check if we have direct latitude/longitude fields from the backend
      if (station.containsKey('latitude') && station.containsKey('longitude')) {
        // Use the exact coordinates from the backend
        latitude = double.parse(station['latitude'].toString());
        longitude = double.parse(station['longitude'].toString());
        debugPrint('Using backend coordinates: $latitude, $longitude');
      } else if (station.containsKey('position')) {
        // Fallback to position field if available
        final position = station['position'] as LatLng;
        latitude = position.latitude;
        longitude = position.longitude;
        debugPrint('Using position field coordinates: $latitude, $longitude');
      } else {
        // If no coordinates are available, show an error
        Get.snackbar(
          'Navigation Error',
          'Could not find location coordinates for this station',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red[700],
          colorText: Colors.white,
        );
        return;
      }

      // Get station name or address for the URL
      String destinationName;
      if (station.containsKey('station_address')) {
        destinationName = station['station_address'] as String;
      } else if (station.containsKey('name')) {
        destinationName = station['name'] as String;
      } else {
        destinationName = 'EV Charging Station';
      }

      // Format the destination name for the URL
      final encodedName = Uri.encodeComponent(destinationName);

      // Create the Google Maps URL with the destination coordinates and name
      final googleMapsUrl =
          'https://www.google.com/maps/dir/?api=1&destination=$latitude,$longitude&destination_place_id=$encodedName&travelmode=driving';

      debugPrint('Navigation URL: $googleMapsUrl');

      // Create a Uri object from the URL string
      final uri = Uri.parse(googleMapsUrl);

      // Launch the URL
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
}
