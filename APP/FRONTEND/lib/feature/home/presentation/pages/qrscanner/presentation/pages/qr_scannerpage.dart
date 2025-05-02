import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/home/presentation/pages/qrscanner/presentation/controllers/qr_controller.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class QrScannerpage extends StatelessWidget {
  const QrScannerpage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(QrScannerController());
    final size = MediaQuery.of(context).size;
    final scanAreaSize = size.width * 0.7;

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            Obx(() => controller.hasPermission.value
                ? _buildScanner(controller)
                : _buildPermissionView(controller)),
            _buildBlurOverlay(size, scanAreaSize),
            _buildTopBar(),
            _buildControls(controller),
          ],
        ),
      ),
    );
  }

  Widget _buildScanner(QrScannerController controller) {
    return Obx(() => controller.isScanning.value
        ? MobileScanner(
            controller: controller.scannerController,
            onDetect: (capture) {
              final code = capture.barcodes.firstOrNull?.rawValue;
              if (code != null) controller.handleScannedCode(code);
            },
          )
        : const SizedBox.shrink());
  }

  Widget _buildBlurOverlay(Size size, double scanAreaSize) {
    return Stack(
      children: [
        BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 1, sigmaY: 1),
        ),
        Center(
          child: Container(
            width: scanAreaSize,
            height: scanAreaSize,
            decoration: BoxDecoration(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white, width: 2),
            ),
            child: Stack(
              children: [
                _buildGlowCorner(Alignment.topLeft),
                _buildGlowCorner(Alignment.topRight),
                _buildGlowCorner(Alignment.bottomLeft),
                _buildGlowCorner(Alignment.bottomRight),
              ],
            ),
          ),
        ),
        Positioned(
          top: 50,
          left: 0,
          right: 0,
          child: const Center(
            child: Text(
              'Align QR code inside the box',
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildGlowCorner(Alignment alignment) {
    return Align(
      alignment: alignment,
      child: Container(
        width: 25,
        height: 25,
        decoration: BoxDecoration(
          border: Border(
            top: alignment.y < 0
                ? const BorderSide(color: Colors.cyanAccent, width: 3)
                : BorderSide.none,
            bottom: alignment.y > 0
                ? const BorderSide(color: Colors.cyanAccent, width: 3)
                : BorderSide.none,
            left: alignment.x < 0
                ? const BorderSide(color: Colors.cyanAccent, width: 3)
                : BorderSide.none,
            right: alignment.x > 0
                ? const BorderSide(color: Colors.cyanAccent, width: 3)
                : BorderSide.none,
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Positioned(
      top: 16,
      left: 16,
      right: 16,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          CircleAvatar(
            backgroundColor: Colors.black.withOpacity(0.6),
            child: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Get.back(),
            ),
          ),
          const Text(
            'Scan QR Code',
            style: TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
          ),
          const SizedBox(width: 48), // Space holder to balance center
        ],
      ),
    );
  }

  Widget _buildControls(QrScannerController controller) {
    return Positioned(
      bottom: 48,
      left: 0,
      right: 0,
      child: Obx(() => Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildControlButton(
                icon: controller.isFlashlightOn.value
                    ? Icons.flash_on
                    : Icons.flash_off,
                onPressed: () => controller.toggleFlashlight(),
              ),
              const SizedBox(width: 24),
              _buildControlButton(
                icon: controller.isScanning.value
                    ? Icons.pause
                    : Icons.play_arrow,
                onPressed: () {
                  controller.isScanning.value
                      ? controller.pauseScanning()
                      : controller.resumeScanning();
                },
              ),
            ],
          )),
    );
  }

  Widget _buildControlButton(
      {required IconData icon, required VoidCallback onPressed}) {
    return CircleAvatar(
      radius: 28,
      backgroundColor: Colors.blueAccent,
      child: IconButton(
        icon: Icon(icon, color: Colors.white),
        onPressed: onPressed,
      ),
    );
  }

  Widget _buildPermissionView(QrScannerController controller) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.camera_alt, color: Colors.white, size: 64),
          const SizedBox(height: 16),
          const Text(
            'Camera permission required',
            style: TextStyle(color: Colors.white, fontSize: 16),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => controller.checkCameraPermission(),
            child: const Text('Grant Permission'),
          ),
        ],
      ),
    );
  }
}
