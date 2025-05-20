import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';

import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/home/presentation/pages/search/presentation/controllers/search_controllers.dart';

class QrScannerController extends GetxController with WidgetsBindingObserver {
  final RxBool hasPermission = false.obs;
  final RxBool isFlashlightOn = false.obs;
  final RxBool isLoading = false.obs;
  final RxString scannedCode = ''.obs;

  final MobileScannerController scannerController = MobileScannerController();
  final sessionController = Get.find<SessionController>();
  final searchpageController = Get.find<SearchpageController>();

  bool _snackbarShown = false;
  bool _isScannerRunning = false;
  DateTime? lastScanTime;
  Rect? scanWindow;


  @override
  void onInit() {
    super.onInit();
    WidgetsBinding.instance.addObserver(this);
    checkCameraPermission();
  }


  @override
  void onClose() {
    WidgetsBinding.instance.removeObserver(this);
    if (_isScannerRunning) {
      scannerController.stop();
    }
    scannerController.dispose();
    _dismissSnackbar();
    super.onClose();
  }

  Future<void> checkCameraPermission() async {
    final status = await Permission.camera.status;
    debugPrint('Current camera permission status: $status');

    if (status.isGranted) {
      hasPermission.value = true;
      await _safeStartScanner();
    } else if (status.isPermanentlyDenied) {
      hasPermission.value = false;
      _showPermissionSnackbar();
    } else {
      final result = await Permission.camera.request();
      if (result.isGranted) {
        hasPermission.value = true;
        await _safeStartScanner();
      } else {
        hasPermission.value = false;
        _showPermissionSnackbar();
      }
    }
  }

  Future<void> requestCameraPermission() async {
    try {
      final status = await Permission.camera.status;
      if (status.isGranted) {
        hasPermission.value = true;
        await _safeStartScanner();
      } else {
        hasPermission.value = false;
        _showPermissionSnackbar();
      }
    } catch (e) {
      debugPrint('Error in requestCameraPermission: $e');
      _showErrorDialog('Could not process permission request: $e');
    }
  }

  void _showPermissionSnackbar() {
    if (_snackbarShown) return;

    _snackbarShown = true;
    final isDarkMode = Get.isDarkMode;

    Get.rawSnackbar(
      messageText: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.red.shade600,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.camera_alt_outlined, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Camera permission is disabled. Please enable it to use the QR scanner.',
                  style: TextStyle(
                    fontFamily: 'CustomFont',
                    color: isDarkMode ? Colors.white70 : Colors.black87,
                    fontWeight: FontWeight.w500,
                    fontSize: 16,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () {
                _dismissSnackbar();
                openAppSettings();
              },
              style: TextButton.styleFrom(
                backgroundColor: isDarkMode ? Colors.red.shade800 : Colors.red.shade100,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Text(
                'Open Settings',
                style: TextStyle(
                  color: isDarkMode ? Colors.white : Colors.red.shade800,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: isDarkMode ? Colors.red.shade900.withOpacity(0.7) : Colors.red.shade50,
      borderColor: Colors.red.shade600,
      borderWidth: 1,
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      borderRadius: 8,
      padding: const EdgeInsets.all(16),
      duration: const Duration(days: 1),
      animationDuration: const Duration(milliseconds: 300),
      isDismissible: true,
    );
  }

  void _dismissSnackbar() {
    if (_snackbarShown) {
      Get.closeCurrentSnackbar();
      _snackbarShown = false;
    }
  }

  Future<void> _safeStartScanner() async {
    if (_isScannerRunning) return; // Already running, do nothing

    try {
      await scannerController.start();
      _isScannerRunning = true;
    } catch (e) {
      debugPrint('Failed to start scanner: $e');
      if (e.toString().contains('already started')) {
        // The scanner is actually running, so update the flag
        _isScannerRunning = true;
      }
    }
  }


  Future<void> _safeStopScanner() async {
    if (!_isScannerRunning) return; // Already stopped, do nothing

    try {
      await scannerController.stop();
      _isScannerRunning = false;
    } catch (e) {
      debugPrint('Failed to stop scanner: $e');
      if (e.toString().contains('not started')) {
        // The scanner is already stopped, update the flag accordingly
        _isScannerRunning = false;
      }
    }
  }


  void toggleFlashlight() {
    try {
      scannerController.toggleTorch();
      isFlashlightOn.value = !isFlashlightOn.value;
    } catch (e) {
      debugPrint('Failed to toggle flashlight: $e');
    }
  }

  Future<void> handleScannedCode(String code, {Barcode? barcode}) async {
    final now = DateTime.now();
    if (lastScanTime != null && now.difference(lastScanTime!).inSeconds < 2) return;

    if (!isLoading.value) {
      if (barcode != null && scanWindow != null) {
        final corners = barcode.corners;
        if (corners != null && corners.isNotEmpty) {
          final isWithinScanArea = corners.any((corner) => scanWindow!.contains(corner));
          if (!isWithinScanArea) return;
        }
      }

      lastScanTime = now;
      scannedCode.value = code;
      await _safeStopScanner();
      isLoading.value = true;

      try {
        await searchpageController.fetchChargerData(code);
      } catch (e) {
        debugPrint('Failed to process QR code: $e');
      } finally {
        isLoading.value = false;
        scannedCode.value = '';
        await Future.delayed(const Duration(milliseconds: 500));
        await _safeStartScanner();
      }
    }
  }

  void _showErrorDialog(String message) {
    Get.dialog(
      AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}
