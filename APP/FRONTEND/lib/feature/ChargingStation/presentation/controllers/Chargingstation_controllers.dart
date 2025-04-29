import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/ChargingStation/domain/repository/Chargingstation_repository.dart';
import 'package:ionhive/feature/ChargingStation/presentation/widgets/Chargingstationwidget.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/Saved_Device/presentation/controllers/saved_device_controllers.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';
import 'package:share_plus/share_plus.dart';

class ChargingStationController extends GetxController {
  final Chargingstationsrepo _chargingStationsRepo = Chargingstationsrepo();
  final RxMap<int, bool> _savedStations = <int, bool>{}.obs;
  final RxMap<String, bool> _savedChargers = <String, bool>{}.obs;
  OverlayEntry? _popupMenu;
  bool _isPopupShown = false;
  final RxInt selectedTabIndex = 0.obs;
  var isLoading = true.obs;
  final RxInt expandedChargerIndex = (-1).obs;
  Map<String, dynamic>? currentStation;
  Map<String, dynamic>? station;
  final RxList<dynamic> chargerDetails = RxList<dynamic>([]);
  Map<int, bool> expandedConnectorIndices = {};
  bool isToggling = false;
  final SavedDeviceControllers _savedDeviceController = Get.put(SavedDeviceControllers());
  final sessionController = Get.find<SessionController>();
  final RxInt selectedConnectorIndex = (-1).obs; // Track globally selected connector index

  @override
  void onInit() {
    super.onInit();
    print('Controller initialized');
    expandedConnectorIndices = {};
    ever(chargerDetails, (_) {
      expandedConnectorIndices = {};
      update(['connectors', 'viewMoreButton']);
    });
    _fetchInitialSavedDevices();
  }

  Future<void> _fetchInitialSavedDevices() async {
    await _savedDeviceController.fetchSavedDevices();
    _savedChargers.clear();
    for (var device in _savedDeviceController.savedDevices) {
      final chargerId = device['charger_id'].toString();
      _savedChargers[chargerId] = true;
    }
    update();
  }

  void setStation(Map<String, dynamic> stationData) {
    print('Setting station: $stationData');
    station = stationData;
    final stationId = station?['station_id'];
    final isSaved = station?['saved_station'] == true;
    if (stationId != null) {
      setInitialSavedState(stationId, isSaved);
    }
    if (station != null &&
        station!['station_id'] != null &&
        station!['location_id'] != null) {
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;
      fetchspecificchargers(
        userId,
        emailId,
        authToken,
        station!['station_id'],
        station!['location_id'].toString(),
      ).then((_) {
        print('Charger details fetched: $chargerDetails');
      }).catchError((e) {
        print('Error fetching charger details: $e');
      });
    }
  }

  bool isStationSaved(int stationId) => _savedStations[stationId] ?? false;

  bool isChargerSaved(String chargerId) {
    return _savedDeviceController.savedDevices.any((device) => device['charger_id'].toString() == chargerId) ||
        (_savedChargers[chargerId] ?? false);
  }

  void setInitialSavedState(int stationId, bool isSaved) {
    _savedStations[stationId] = isSaved;
  }

  Future<void> saveStation(int userId, String emailId, String authToken, int stationId) async {
    try {
      final response = await _chargingStationsRepo.savestations(
        userId,
        emailId,
        authToken,
        stationId,
        true,
      );
      _savedStations[stationId] = true;
      CustomSnackbar.showSuccess(
        message: response.message ?? "Station saved successfully",
      );
      await _fetchInitialSavedDevices();
    } catch (e) {
      CustomSnackbar.showError(
        message: e.toString().contains("Exception:")
            ? e.toString().split("Exception:")[1].trim()
            : "Failed to save station",
      );
      throw e;
    }
  }

  Future<void> removeStation(int userId, String emailId, String authToken, int stationId) async {
    try {
      final response = await _chargingStationsRepo.Removestations(
        userId,
        emailId,
        authToken,
        stationId,
        false,
      );
      _savedStations[stationId] = false;
      CustomSnackbar.showSuccess(
        message: response.message ?? "Station removed from saved",
      );
      await _fetchInitialSavedDevices();
    } catch (e) {
      CustomSnackbar.showError(
        message: e.toString().contains("Exception:")
            ? e.toString().split("Exception:")[1].trim()
            : "Failed to remove station",
      );
      throw e;
    }
  }

  void shareStationDetails() {
    if (station == null) return;
    String stationName = station!['name'] ?? 'Unknown Station';
    String address = station!['station_address'] ?? 'Unknown Address';
    String landmark = station!['landmark'] ?? 'No Landmark';
    String network = station!['network'] ?? 'Unknown Network';
    String availability = station!['availability'] ?? 'Unknown';
    String accessibility = station!['accessibility'] ?? 'Unknown';
    String chargerType = station!['charger_type'] ?? 'Unknown Type';
    double latitude = station!['position']?.latitude ?? 0.0;
    double longitude = station!['position']?.longitude ?? 0.0;
    String mapUrl = "https://www.google.com/maps/search/?api=1&query=$latitude,$longitude";
    String shareText = '''
Charging Station: $stationName
📍 Address: $address
 Landmark: $landmark
Charger Type: $chargerType ($network Network)
Availability: $availability
 Accessibility: $accessibility
📍 Location on Map:
$mapUrl
''';
    Share.share(shareText);
  }

  Future<void> fetchspecificchargers(int userId, String emailId, String authToken, int stationId, String locationId) async {
    isLoading.value = true;
    print('Calling fetchspecificchargers with stationId: $stationId, locationId: $locationId');
    try {
      final response = await _chargingStationsRepo.FetchspecificChargers(
        userId,
        emailId,
        authToken,
        stationId,
        locationId,
      );
      await Future.delayed(const Duration(seconds: 2));
      // Initialize selectedConnectorIndex for each charger
      final updatedChargerDetails = response.specificchargers.map((charger) {
        if (charger is Map<String, dynamic> && !charger.containsKey('selectedConnectorIndex')) {
          charger['selectedConnectorIndex'] = -1;
        }
        return charger;
      }).toList();
      chargerDetails.value = updatedChargerDetails; // Assign new list to trigger reactivity
      selectedConnectorIndex.value = -1; // Reset global selection
      CustomSnackbar.showSuccess(
        message: response.message ?? "Charger details fetched successfully",
      );
    } catch (e) {
      CustomSnackbar.showError(
        message: e.toString().contains("Exception:")
            ? e.toString().split("Exception:")[1].trim()
            : "Failed to fetch charger details",
      );
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  void showMoreOptionsPopup(BuildContext context, Offset position, int stationId) {
    final authToken = sessionController.token.value;
    final userId = sessionController.userId.value;
    final emailId = sessionController.emailId.value;
    if (_isPopupShown) {
      hidePopup();
    }
    _popupMenu = OverlayEntry(
      builder: (context) => PopupMenuOverlay(
        position: position,
        onHidePopup: hidePopup,
        onToggleSave: () async {
          hidePopup();
          if (!isStationSaved(stationId)) {
            await saveStation(userId, emailId, authToken, stationId);
          } else {
            await removeStation(userId, emailId, authToken, stationId);
          }
        },
        onShare: () {
          hidePopup();
          shareStationDetails();
        },
        isSaved: isStationSaved(stationId),
      ),
    );
    Overlay.of(context).insert(_popupMenu!);
    _isPopupShown = true;
  }

  void toggleChargerDetails(int index) {
    expandedChargerIndex.value = expandedChargerIndex.value == index ? -1 : index;
  }

  void toggleConnectorDetails(int index) {
    Map<int, bool> newIndices = Map<int, bool>.from(expandedConnectorIndices);
    final currentState = newIndices[index] ?? false;
    newIndices[index] = !currentState;
    expandedConnectorIndices = newIndices;
    print('Toggling connector details for index $index, new state: ${expandedConnectorIndices[index]}');
    update(['connectors', 'viewMoreButton']);
  }

  void onTabTapped(int index) {
    print('Switching to tab index: $index, current value: ${selectedTabIndex.value}');
    selectedTabIndex.value = index;
  }

  Future<void> Savedevice(int userId, String emailId, String authToken, String chargerId) async {
    try {
      final response = await _chargingStationsRepo.savedevices(
        userId,
        emailId,
        authToken,
        chargerId,
        true,
      );
      _savedChargers[chargerId] = true;
      CustomSnackbar.showSuccess(
        message: response.message ?? "Device saved successfully",
      );
      await _fetchInitialSavedDevices();
      update();
    } catch (e) {
      CustomSnackbar.showError(
        message: e.toString().contains("Exception:")
            ? e.toString().split("Exception:")[1].trim()
            : "Failed to save device",
      );
      print("Error saving device: $e");
    }
  }

  Future<void> Removedevice(int userId, String emailId, String authToken, String chargerId) async {
    try {
      final response = await _chargingStationsRepo.Removescharger(
        userId,
        emailId,
        authToken,
        chargerId,
        false,
      );
      _savedChargers[chargerId] = false;
      CustomSnackbar.showSuccess(
        message: response.message ?? "Device removed successfully",
      );
      await _fetchInitialSavedDevices();
      update();
    } catch (e) {
      CustomSnackbar.showError(
        message: e.toString().contains("Exception:")
            ? e.toString().split("Exception:")[1].trim()
            : "Failed to remove device",
      );
      print("Error removing device: $e");
    }
  }

  void hidePopup() {
    if (_isPopupShown) {
      _popupMenu?.remove();
      _popupMenu = null;
      _isPopupShown = false;
    }
  }

  // Method to set the selected connector with toggle behavior
  void setSelectedConnector(int chargerIndex, int connectorIndex) {
    final currentSelection = chargerDetails[chargerIndex]['selectedConnectorIndex'];
    final updatedDetails = chargerDetails.map((charger) {
      if (charger is Map<String, dynamic>) {
        charger['selectedConnectorIndex'] = -1; // Reset all
      }
      return charger;
    }).toList();
    if (currentSelection == connectorIndex) {
      // If re-tapping the same connector, unselect it
      updatedDetails[chargerIndex]['selectedConnectorIndex'] = -1;
    } else {
      // Otherwise, select the new connector
      updatedDetails[chargerIndex]['selectedConnectorIndex'] = connectorIndex;
    }
    chargerDetails.value = updatedDetails; // Reassign to trigger reactivity
    selectedConnectorIndex.value = updatedDetails[chargerIndex]['selectedConnectorIndex']; // Update global state
    update(['connectors']); // Ensure UI updates
  }
}