import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/ChargingStation/domain/repository/Chargingstation_repository.dart';
import 'package:ionhive/feature/ChargingStation/presentation/widgets/Chargingstationwidget.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';
import 'package:share_plus/share_plus.dart';

class ChargingStationController extends GetxController {
  final Chargingstationsrepo _chargingStationsRepo = Chargingstationsrepo();
  final RxMap<int, bool> _savedStations = <int, bool>{}.obs;
  OverlayEntry? _popupMenu;
  bool _isPopupShown = false;

  Map<String, dynamic>? station;

  @override
  void onInit() {
    super.onInit();
  }

  void setStation(Map<String, dynamic> stationData) {
    station = stationData;
    final stationId = station?['station_id'];
    final isSaved = station?['saved_station'] == true;
    if (stationId != null) {
      setInitialSavedState(stationId, isSaved);
    }
  }

  bool isStationSaved(int stationId) => _savedStations[stationId] ?? false;

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
        true, // Assuming true indicates saving the station
      );

      _savedStations[stationId] = true;

      CustomSnackbar.showSuccess(
        message: response.message ?? "Station saved successfully",
      );
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
        false, // Assuming false indicates removing the station
      );

      _savedStations[stationId] = false;

      CustomSnackbar.showSuccess(
        message: response.message ?? "Station removed from saved",
      );
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
⚡ Charging Station: $stationName

📍 Address: $address
🏷️ Landmark: $landmark
🔌 Charger Type: $chargerType ($network Network)
⏰ Availability: $availability
🔐 Accessibility: $accessibility

📍 Location on Map:
$mapUrl
''';

    Share.share(shareText);
  }

  void showMoreOptionsPopup(BuildContext context, Offset position, int stationId) {
    final sessionController = Get.find<SessionController>();
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

  void hidePopup() {
    if (_isPopupShown) {
      _popupMenu?.remove();
      _popupMenu = null;
      _isPopupShown = false;
    }
  }
}