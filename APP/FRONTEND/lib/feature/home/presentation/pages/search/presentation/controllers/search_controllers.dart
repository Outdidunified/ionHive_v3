import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/Chargingpage/presentation/pages/Chargingpage.dart';
import 'package:ionhive/feature/home/presentation/pages/qrscanner/domain/repository/qrrepository.dart';
import 'package:ionhive/feature/home/presentation/pages/qrscanner/domain/model/qrmodel.dart';
import 'package:ionhive/feature/landing_page.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/material.dart';

class SearchpageController extends GetxController {
  var isChargerId = true.obs;
  var searchQuery = ''.obs;
  var recentChargerSearches = <String>[].obs;
  var recentLocationSearches = <String>[].obs;
  var isLoading = false.obs;
  var suggestedLocations = <String>[].obs;
  final sessionController = Get.find<SessionController>();
  // ✅ FIX: Add this missing map
  final connectorDetailsMap = <int, Connector>{}.obs;
  // Add missing chargerDetails property
  Rx<Charger?> chargerDetails = Rx<Charger?>(null);

  final Qrscannerrepo qrscannerRepo = Qrscannerrepo();

  @override
  void onInit() {
    super.onInit();
    _loadRecentSearches();
    searchQuery.value = '';
    suggestedLocations.clear();
  }

  @override
  void onClose() {
    super.onClose();
    print("SearchController disposed");
  }

  void clearAll() {
    isChargerId.value = true;
    searchQuery.value = '';
    recentChargerSearches.clear();
    recentLocationSearches.clear();
    isLoading.value = false;
    suggestedLocations.clear();
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
    recentChargerSearches.value =
        prefs.getStringList('recent_charger_searches') ?? [];
    recentLocationSearches.value =
        prefs.getStringList('recent_location_searches') ?? [];
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
      suggestedLocations.clear();
    }

    if (value.isEmpty) {
      suggestedLocations.clear();
    }
  }

  void performSearch() async {
    final trimmedQuery = searchQuery.value.trim();
    if (trimmedQuery.isEmpty) return;

    _addToRecentSearches(trimmedQuery, isCharger: isChargerId.value);
    suggestedLocations.clear();

    if (isChargerId.value) {
      await fetchChargerData(trimmedQuery);
    } else {
      fetchCoordinatesAndNavigate(trimmedQuery);
    }
  }

  Future<bool> fetchChargerData(String chargerId) async {
    isLoading.value = true;
    try {
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      final response = await qrscannerRepo.fetchconnectors(
          userId, emailId, authToken, chargerId);

      if (response.status == true && response.data != null) {
        chargerDetails.value = response.data;
        connectorDetailsMap.clear();
        for (var connector in chargerDetails.value!.connectors) {
          connectorDetailsMap[connector.connectorId] = connector;
        }

        if (Get.context != null) {
          showConnectorBottomSheet(response.data!.chargerId,
              response.data!.connectors, response.data!, Get.context!);
          return true;
        } else {
          CustomSnackbar.showError(message: 'Context not available.');
          return false;
        }
      } else {
        CustomSnackbar.showWarning(
            message: 'No charger found for the entered ID.');
        return false;
      }
    } catch (e) {
      CustomSnackbar.showError(message: 'Failed to fetch charger: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  void showConnectorBottomSheet(String chargerId, List<Connector> connectors,
      Charger charger, BuildContext context) {
    final theme = Theme.of(context);
    final bool isDarkTheme = theme.brightness == Brightness.dark;
    var selectedConnectorId = RxnInt();

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDarkTheme ? theme.scaffoldBackgroundColor : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${charger.vendor} | $chargerId',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: isDarkTheme
                            ? Colors.white
                            : const Color(0xFF0A1F44))),
                IconButton(
                  icon: Icon(Icons.close,
                      color: isDarkTheme ? Colors.white70 : Colors.black38),
                  onPressed: () {
                    Get.off(
                      () =>
                          LandingPage(), // Replace with your actual HomePage widget
                      transition:
                          Transition.rightToLeft, // Right to left transition
                      duration: const Duration(
                          milliseconds: 300), // Optional: custom duration
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 4),
            Column(
              children: connectors.map((connector) {
                String statusText = connector.chargerStatus;
                Color statusColor = _getStatusColor(connector.chargerStatus);
                IconData statusIcon = _getStatusIcon(connector.chargerStatus);
                String assetImage = connector.connectorType == 1
                    ? 'assets/icons/wall-socket.png'
                    : connector.connectorType == 2
                        ? 'assets/icons/charger_gun1.png'
                        : 'assets/icons/wall-socket.png';
                String connectorText = connector.connectorType == 1
                    ? 'Socket'
                    : connector.connectorType == 2
                        ? 'Gun'
                        : 'Unknown';

                return Obx(() => Card(
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      color: selectedConnectorId.value == connector.connectorId
                          ? (isDarkTheme ? Colors.grey[800] : Colors.grey[200])
                          : (isDarkTheme ? theme.cardColor : Colors.white),
                      shape: RoundedRectangleBorder(
                        side: selectedConnectorId.value == connector.connectorId
                            ? const BorderSide(color: Colors.blue, width: 2)
                            : BorderSide.none,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: ListTile(
                        onTap: () {
                          selectedConnectorId.value =
                              selectedConnectorId.value == connector.connectorId
                                  ? null
                                  : connector.connectorId;
                        },
                        leading: Text('Connector ${connector.connectorId}',
                            style: TextStyle(
                                color: isDarkTheme
                                    ? Colors.white
                                    : const Color(0xFF0A1F44))),
                        title: Row(children: [
                          Icon(statusIcon, color: statusColor, size: 16),
                          const SizedBox(width: 4),
                          Text(statusText,
                              style: TextStyle(
                                  color: isDarkTheme
                                      ? Colors.white
                                      : const Color(0xFF0A1F44))),
                        ]),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Image.asset(assetImage,
                                width: 20,
                                height: 20,
                                color: isDarkTheme
                                    ? Colors.white
                                    : const Color(0xFF0A1F44)),
                            const SizedBox(width: 4),
                            Text(connectorText,
                                style: TextStyle(
                                    color: isDarkTheme
                                        ? Colors.white
                                        : const Color(0xFF0A1F44))),
                          ],
                        ),
                      ),
                    ));
              }).toList(),
            ),
            const SizedBox(height: 16),
            Obx(() => SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: selectedConnectorId.value == null
                        ? null
                        : () => handleStartCharging(
                              chargerId: chargerId,
                              chargerDetails: chargerDetails,
                              connectorDetailsMap: connectorDetailsMap,
                              selectedConnectorId: selectedConnectorId,
                              isLoading: isLoading,
                            ),
                    style: ButtonStyle(
                      backgroundColor: MaterialStateProperty.all(
                        isLoading.value || selectedConnectorId.value == null
                            ? Colors.grey
                            : Colors.green,
                      ),
                      foregroundColor: MaterialStateProperty.all(Colors.white),
                    ),
                    child: Obx(() => Text(
                          isLoading.value
                              ? 'Processing...'
                              : (selectedConnectorId.value == null
                                  ? 'Select Connector'
                                  : 'Charge Now'),
                          style: const TextStyle(fontSize: 16),
                        )),
                  ),
                ))
          ],
        ),
      ),
    );
  }

  // Helper method to get status color
  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'available':
        return Colors.green[600]!;
      case 'unavailable':
        return Colors.grey[600]!;
      case 'faulted':
        return Colors.red[600]!;
      case 'preparing':
        return Colors.blue[600]!;
      case 'charging':
        return Colors.orange[600]!;
      case 'finishing':
        return Colors.purple[600]!;
      default:
        return Colors.black;
    }
  }

  // Helper method to get status icon
  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'available':
        return Icons.check_circle;
      case 'unavailable':
        return Icons.remove_circle_outline;
      case 'faulted':
        return Icons.error_outline;
      case 'preparing':
        return Icons.hourglass_empty;
      case 'charging':
        return Icons.bolt;
      case 'finishing':
        return Icons.done_all;
      default:
        return Icons.help_outline;
    }
  }

  Future<List<String>> fetchPlaceSuggestions(String input) async {
    final apiKey = "AIzaSyDdBinCjuyocru7Lgi6YT3FZ1P6_xi0tco";
    final url =
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
    final apiKey = "AIzaSyDdBinCjuyocru7Lgi6YT3FZ1P6_xi0tco";
    final url =
        'https://maps.googleapis.com/maps/api/geocode/json?address=${Uri.encodeComponent(location)}&key=$apiKey';

    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['results'].isNotEmpty) {
          final loc = data['results'][0]['geometry']['location'];
          return {
            'latitude': loc['lat'] as double,
            'longitude': loc['lng'] as double,
          };
        } else {
          throw Exception('No coordinates found');
        }
      } else {
        throw Exception('Failed to fetch coordinates');
      }
    } catch (e) {
      print('Error fetching coordinates: $e');
      CustomSnackbar.showError(
        message: 'Failed to fetch coordinates: $e',
        duration: const Duration(seconds: 3), // <-- Set duration here
      );
      return null;
    }
  }

  void updateSuggestions(String query) async {
    suggestedLocations.clear();
    if (query.isEmpty || query.trim().isEmpty) return;

    if (!isChargerId.value && query.trim().isNotEmpty) {
      final suggestions = await fetchPlaceSuggestions(query);
      if (suggestions.isNotEmpty) {
        suggestedLocations.value = suggestions;
      } else {
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
    list.remove(value);
    list.insert(0, value);
    if (list.length > 10) list.removeLast();
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
          CustomSnackbar.showPermissionRequest(
            message: 'Location permission is required.',
            duration: const Duration(seconds: 3), // <-- Set duration here

            onOpenSettings: () {
              openAppSettings();
            },
          );
          return;
        }
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 15),
      );

      searchQuery.value = "Current Location";
      suggestedLocations.clear();

      _addToRecentSearches("Current Location", isCharger: false);

      Get.back(result: {
        'name': "Current Location",
        'latitude': position.latitude,
        'longitude': position.longitude,
        'isCurrentLocation': true,
      });
    } catch (e) {
      CustomSnackbar.showError(
        message: 'Could not get current location: $e',
        duration: const Duration(seconds: 3), // <-- Set duration here
      );
    } finally {
      isLoading.value = false;
    }
  }

  void fetchCoordinatesAndNavigate(String location) async {
    final coordinates = await fetchCoordinates(location);
    if (coordinates != null) {
      final isCurrentLocationSearch =
          location.toLowerCase() == "current location";
      Get.back(result: {
        'name': location,
        'latitude': coordinates['latitude'],
        'longitude': coordinates['longitude'],
        'isCurrentLocation': isCurrentLocationSearch,
      });
    } else {
      CustomSnackbar.showError(
        message: 'Could not fetch coordinates for $location',
        duration: const Duration(seconds: 3), // <-- Set duration here
      );
    }
  }

  // Add the handleStartCharging method for ChargingStationPage
  Future<void> handleStartCharging({
    required String chargerId,
    required dynamic chargerDetails,
    required dynamic selectedConnectorId,
    required dynamic connectorDetailsMap,
    RxBool? isLoading,
  }) async {
    // Use the local isLoading if provided, otherwise use the controller's isLoading
    final loadingState = isLoading ?? this.isLoading;
    loadingState.value = true;

    try {
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      // Handle different types of selectedConnectorId
      int connectorId;
      if (selectedConnectorId is RxInt || selectedConnectorId is RxnInt) {
        connectorId = selectedConnectorId.value;
      } else if (selectedConnectorId is String) {
        connectorId = int.parse(selectedConnectorId);
      } else if (selectedConnectorId is int) {
        connectorId = selectedConnectorId;
      } else {
        throw Exception(
            'Invalid connector ID type: ${selectedConnectorId.runtimeType}');
      }

      final response = await qrscannerRepo.updateconnectorstocharging(
        userId,
        emailId,
        authToken,
        chargerId,
        connectorId,
      );

      if (response.error == false) {
        print("Unit Price: ${response.unitPrice}");

        CustomSnackbar.showSuccess(
          message: 'Charging started with Connector $connectorId',
          duration: const Duration(seconds: 3),
        );

        await Future.delayed(const Duration(seconds: 3));
        Get.back();

        // Create a map for connector details if it's not already a map
        Map<String, dynamic> connDetails;
        if (connectorDetailsMap is Map<String, dynamic>) {
          connDetails = connectorDetailsMap;
        } else {
          connDetails = {
            'connector_type': 1,
            'power': 'N/A',
            'charger_status': 'Unknown',
          };
        }

        // Create a map for charger details if it's not already a map
        Map<String, dynamic> chargerData;
        if (chargerDetails is Map<String, dynamic>) {
          chargerData = chargerDetails;
        } else if (chargerDetails is Charger) {
          chargerData = chargerDetails.toJson();
        } else {
          chargerData = {
            'vendor': 'Unknown',
            'max_power': 'N/A',
          };
        }

        Get.to(
          () => Chargingpage(
            chargerId: chargerId,
            chargerDetails: chargerData,
            connectorId: connectorId.toString(),
            connectorDetails: connDetails,
            unitPrice: response.unitPrice,
          ),
          transition: Transition.rightToLeft,
        );
      } else {
        CustomSnackbar.showError(
          message: 'Failed to start charging: ${response.message}',
          duration: const Duration(seconds: 3),
        );
      }
    } catch (e) {
      CustomSnackbar.showError(
        message: 'Failed to start charging: $e',
        duration: const Duration(seconds: 3),
      );
      print('Charging error: $e');
    } finally {
      loadingState.value = false;
    }
  }
}
