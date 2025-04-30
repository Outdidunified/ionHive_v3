import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/home/presentation/pages/qrscanner/domain/repository/qrrepository.dart';
import 'package:ionhive/feature/home/presentation/pages/search/presentation/controllers/search_controllers.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';

class QrScannerController extends GetxController {
  final RxBool hasPermission = false.obs;
  final RxBool isFlashlightOn = false.obs;
  final RxBool isScanning = true.obs;
  final RxBool isLoading = false.obs;
  final RxString scannedCode = ''.obs;
  final MobileScannerController scannerController = MobileScannerController();
  final sessionController = Get.find<SessionController>();
  final searchpageController = Get.find<SearchpageController>();

  // Define scan area boundaries
  Rect? scanWindow;

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

  void handleScannedCode(String code, {Barcode? barcode}) {
    if (isScanning.value && !isLoading.value) {
      // If barcode is provided, check if it's within the scan window
      if (barcode != null && scanWindow != null) {
        final corners = barcode.corners;
        if (corners != null && corners.isNotEmpty) {
          // Check if at least one corner of the barcode is within the scan window
          bool isWithinScanArea = false;
          for (final corner in corners) {
            if (scanWindow!.contains(corner)) {
              isWithinScanArea = true;
              break;
            }
          }

          if (!isWithinScanArea) {
            // QR code is outside the scan area, ignore it
            return;
          }
        }
      }

      scannedCode.value = code;
      pauseScanning();
      isLoading.value = true;

      // Call the search controller and wait for the response
      searchpageController.fetchChargerData(code).then((_) {
        isLoading.value = false;
      }).catchError((error) {
        isLoading.value = false;
        resumeScanning();
      });
    }
  }
}
