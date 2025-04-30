import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/home/presentation/pages/qrscanner/domain/repository/qrrepository.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:ionhive/utils/widgets/snackbar/custom_snackbar.dart';

class QrScannerController extends GetxController {
  final RxBool hasPermission = false.obs;
  final RxBool isFlashlightOn = false.obs;
  final RxBool isScanning = true.obs;
  final RxString scannedCode = ''.obs;
  final MobileScannerController scannerController = MobileScannerController();
  final sessionController = Get.find<SessionController>();



  final Qrscannerrepo _repo = Qrscannerrepo();

  @override
  void onInit() {
    super.onInit();
    checkCameraPermission();
  }

  @override
  void onClose() {
    scannerController.dispose();
    super.onClose();
  }

  Future<void> checkCameraPermission() async {
    final status = await Permission.camera.status;
    if (status.isGranted) {
      hasPermission.value = true;
    } else {
      final result = await Permission.camera.request();
      hasPermission.value = result.isGranted;
    }
  }

  void toggleFlashlight() {
    scannerController.toggleTorch();
    isFlashlightOn.value = !isFlashlightOn.value;
  }

  void pauseScanning() {
    isScanning.value = false;
    scannerController.stop();
  }

  void resumeScanning() {
    isScanning.value = true;
    scannedCode.value = '';
    scannerController.start();
  }

  void handleScannedCode(String code) {
    if (isScanning.value) {
      scannedCode.value = code;
      pauseScanning();
      fetchChargerDetails(code);
    }
  }

  /// 🔌 Fetch charger details using the scanned QR code
  Future<void> fetchChargerDetails(String chargerId) async {
    try {
      final authToken = sessionController.token.value;
      final userId = sessionController.userId.value;
      final emailId = sessionController.emailId.value;

      final chargerResponse = await _repo.fetchconnectors(
        userId,
        emailId,
        authToken,
        chargerId,
      );

    } catch (e) {
      CustomSnackbar.showError(message: "Failed to fetch charger: $e");
      resumeScanning();
    }
  }


}
