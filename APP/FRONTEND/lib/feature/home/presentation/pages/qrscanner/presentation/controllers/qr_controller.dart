import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/home/presentation/pages/search/presentation/controllers/search_controllers.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';

class QrScannerController extends GetxController {
  final RxBool hasPermission = false.obs;
  final RxBool isFlashlightOn = false.obs;
  final RxBool isLoading = false.obs;
  final RxString scannedCode = ''.obs;
  final MobileScannerController scannerController = MobileScannerController();
  final sessionController = Get.find<SessionController>();
  final searchpageController = Get.find<SearchpageController>();

  Rect? scanWindow;
  DateTime? lastScanTime; // For debouncing scans
  bool _isScannerRunning = false; // Track scanner state

  @override
  void onInit() {
    super.onInit();
    checkCameraPermission();
  }

  @override
  void onClose() {
    if (_isScannerRunning) {
      scannerController.stop();
      _isScannerRunning = false;
    }
    scannerController.dispose();
    super.onClose();
  }

  Future<void> checkCameraPermission() async {
    final status = await Permission.camera.status;
    if (status.isGranted) {
      hasPermission.value = true;
      await _safeStartScanner();
    } else {
      final result = await Permission.camera.request();
      hasPermission.value = result.isGranted;
      if (result.isGranted) {
        await _safeStartScanner();
      }
    }
  }

  Future<void> _safeStartScanner() async {
    if (!_isScannerRunning) {
      try {
        await scannerController.start();
        _isScannerRunning = true;
      } catch (e) {
        debugPrint('Failed to process QR code: 1 $e');
      }
    }
  }

  Future<void> _safeStopScanner() async {
    if (_isScannerRunning) {
      try {
        await scannerController.stop();
        _isScannerRunning = false;
      } catch (e) {
        debugPrint('Failed to process QR code: 2 $e');
      }
    }
  }

  void toggleFlashlight() {
    scannerController.toggleTorch();
    isFlashlightOn.value = !isFlashlightOn.value;
  }

  Future<void> handleScannedCode(String code, {Barcode? barcode}) async {
    final now = DateTime.now();
    if (lastScanTime != null && now.difference(lastScanTime!).inSeconds < 2) {
      return;
    }

    if (!isLoading.value) {
      // Validate that the QR code is within the scanWindow
      if (barcode != null && scanWindow != null) {
        final corners = barcode.corners;
        if (corners != null && corners.isNotEmpty) {
          bool isWithinScanArea = false;
          for (final corner in corners) {
            if (scanWindow!.contains(corner)) {
              isWithinScanArea = true;
              break;
            }
          }
          if (!isWithinScanArea) {
            return;
          }
        }
      }

      lastScanTime = now;
      scannedCode.value = code;
      await _safeStopScanner();
      isLoading.value = true;

      try {
        await searchpageController.fetchChargerData(code);
        isLoading.value = false;
        scannedCode.value = '';
        await Future.delayed(const Duration(milliseconds: 500));
        await _safeStartScanner();
      } catch (error) {
        isLoading.value = false;
        scannedCode.value = '';
        await Future.delayed(const Duration(milliseconds: 500));
        await _safeStartScanner();
        debugPrint('Failed to process QR code: 3 $error');
      }
    }
  }
}
