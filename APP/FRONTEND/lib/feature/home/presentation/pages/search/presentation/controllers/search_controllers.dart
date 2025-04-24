import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

class SearchpageController extends GetxController {
  var isChargerId = true.obs;
  var searchQuery = ''.obs;
  var recentChargerSearches = <String>[].obs;
  var recentLocationSearches = <String>[].obs;
  var isLoading = false.obs;
  var suggestedLocations = <String>[].obs;

  @override
  void onInit() {
    super.onInit();
    _loadRecentSearches();
    // Clear search query and suggestions when page is initialized
    searchQuery.value = '';
    suggestedLocations.clear();
  }

  @override
  void onClose() {
    // Clear all controller data when the page is closed
    clearAll();
    super.onClose();
  }

  // Method to clear all controller data
  void clearAll() {
    isChargerId.value = true; // Reset to default search mode
    searchQuery.value = '';
    recentChargerSearches.clear();
    recentLocationSearches.clear();
    isLoading.value = false;
    suggestedLocations.clear();
    // Optionally, clear SharedPreferences as well
    _clearRecentSearchesFromStorage();
  }

  Future<void> _clearRecentSearchesFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('recent_charger_searches');
    await prefs.remove('recent_location_searches');
  }

  Future<void> _loadRecentSearches() async {
    isLoading.value = true;
    final prefs = await SharedPreferences.getInstance();
    final chargerSearches =
        prefs.getStringList('recent_charger_searches') ?? [];
    final locationSearches =
        prefs.getStringList('recent_location_searches') ?? [];
    recentChargerSearches.value = chargerSearches;
    recentLocationSearches.value = locationSearches;
    isLoading.value = false;
  }

  Future<void> _saveRecentSearches() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('recent_charger_searches', recentChargerSearches);
    await prefs.setStringList(
        'recent_location_searches', recentLocationSearches);
  }

  void toggleSearchType(bool value) {
    isChargerId.value = value;
    searchQuery.value = '';
    suggestedLocations.clear();
  }

  void updateSearch(String value) {
    searchQuery.value = value;
    if (!isChargerId.value) {
      updateSuggestions(value);
    } else {
      // Clear suggestions when in Charger ID mode or when value is empty
      suggestedLocations.clear();
    }

    // Always clear suggestions if search query is empty
    if (value.isEmpty) {
      suggestedLocations.clear();
    }
  }

  void performSearch() {
    final trimmedQuery = searchQuery.value.trim();
    print("Performing search... Query: '$trimmedQuery'");
    if (trimmedQuery.isEmpty) {
      print("Search query is empty");
      return;
    }

    print("Searching for: $trimmedQuery");

    // Add to recent searches
    _addToRecentSearches(trimmedQuery, isCharger: isChargerId.value);

    // Clear suggestions before navigating away
    suggestedLocations.clear();

    if (isChargerId.value) {
      // For Charger ID searches, we'll just return to the home page with the ID
      // In a real app, you might want to search for the charger in your database
      Get.back(result: {
        'chargerId': trimmedQuery,
        'isChargerId': true,
      });
    } else {
      // For location searches, fetch coordinates and navigate
      fetchCoordinatesAndNavigate(trimmedQuery);
    }

    print("Done searching: $trimmedQuery");
  }

  Future<List<String>> fetchPlaceSuggestions(String input) async {
    final apiKey =
        "AIzaSyDdBinCjuyocru7Lgi6YT3FZ1P6_xi0tco"; // Replace with your API key
    final String url =
        'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=$input&key=$apiKey';

    try {
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final predictions = data['predictions'] as List;
        return predictions.map((p) => p['description'] as String).toList();
      } else {
        throw Exception('Failed to fetch suggestions');
      }
    } catch (e) {
      print('Error fetching suggestions: $e');
      return [];
    }
  }

  Future<Map<String, double>?> fetchCoordinates(String location) async {
    final apiKey =
        "AIzaSyDdBinCjuyocru7Lgi6YT3FZ1P6_xi0tco"; // Replace with your API key
    final String url =
        'https://maps.googleapis.com/maps/api/geocode/json?address=${Uri.encodeComponent(location)}&key=$apiKey';

    try {
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['results'].isNotEmpty) {
          final locationData = data['results'][0]['geometry']['location'];
          return {
            'latitude': locationData['lat'] as double,
            'longitude': locationData['lng'] as double,
          };
        } else {
          throw Exception('No coordinates found for the location');
        }
      } else {
        throw Exception('Failed to fetch coordinates');
      }
    } catch (e) {
      print('Error fetching coordinates: $e');
      return null;
    }
  }

  void updateSuggestions(String query) async {
    // Always clear existing suggestions first
    suggestedLocations.clear();

    // If query is empty, just return with empty suggestions
    if (query.isEmpty || query.trim().isEmpty) {
      return;
    }

    // Only fetch suggestions if we're in location search mode and have a non-empty query
    if (!isChargerId.value && query.trim().isNotEmpty) {
      // Fetch suggestions from the Google Places API
      final suggestions = await fetchPlaceSuggestions(query);
      if (suggestions.isNotEmpty) {
        suggestedLocations.value = suggestions;
      } else {
        // Fallback to local logic
        final allLocations = [
          'New York',
          'Los Angeles',
          'Chicago',
          'Houston',
          'Phoenix'
        ];
        suggestedLocations.value = allLocations
            .where((loc) => loc.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    }
  }

  void _addToRecentSearches(String value, {required bool isCharger}) {
    if (value.trim().isEmpty) return;

    final list = isCharger ? recentChargerSearches : recentLocationSearches;

    // Remove if it already exists (to avoid duplicates)
    list.remove(value);

    // Add to the beginning of the list
    list.insert(0, value);

    // Limit the list size to 10 items
    if (list.length > 10) list.removeLast();

    // Save to local storage
    _saveRecentSearches();
  }

  void removeFromRecentSearches(String value) {
    final list =
    isChargerId.value ? recentChargerSearches : recentLocationSearches;
    list.remove(value);
    _saveRecentSearches();
  }

  void clearRecentSearches() {
    if (isChargerId.value) {
      recentChargerSearches.clear();
    } else {
      recentLocationSearches.clear();
    }
    _saveRecentSearches();
  }

  Future<void> updateSearchWithCurrentLocation() async {
    isLoading.value = true;
    try {
      final permissionStatus = await Permission.locationWhenInUse.status;
      if (permissionStatus != PermissionStatus.granted) {
        final requestStatus = await Permission.locationWhenInUse.request();
        if (requestStatus != PermissionStatus.granted) {
          Get.snackbar(
            'Permission Denied',
            'Location permission is required to use current location.',
            snackPosition: SnackPosition.BOTTOM,
          );
          return;
        }
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 15),
      );

      final latitude = position.latitude;
      final longitude = position.longitude;
      final locationName = "Current Location";

      searchQuery.value = locationName;
      suggestedLocations.clear();

      _addToRecentSearches(locationName, isCharger: false);

      Get.back(result: {
        'name': locationName,
        'latitude': latitude,
        'longitude': longitude,
        'isCurrentLocation': true,
      });
    } catch (e) {
      print('Error getting current location: $e');
      Get.snackbar(
        'Error',
        'Could not get current location: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  void fetchCoordinatesAndNavigate(String location) async {
    final coordinates = await fetchCoordinates(location);
    if (coordinates != null) {
      // Check if this is a "Current Location" search
      final isCurrentLocationSearch =
          location.toLowerCase() == "current location";

      // Navigate back to HomePage with the location data
      Get.back(result: {
        'name': location,
        'latitude': coordinates['latitude'],
        'longitude': coordinates['longitude'],
        'isCurrentLocation': isCurrentLocationSearch,
      });
    } else {
      Get.snackbar(
        'Error',
        'Could not fetch coordinates for $location',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
}