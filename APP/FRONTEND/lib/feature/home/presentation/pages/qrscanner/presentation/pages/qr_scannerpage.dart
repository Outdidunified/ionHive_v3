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

    controller.scannedCode.listen((value) {
      if (value.isNotEmpty) {
        showModalBottomSheet(
          context: context,
          isDismissible: false,
          isScrollControlled: true,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          backgroundColor: Colors.white,
          builder: (_) => _buildScannedBottomSheet(controller),
        );
      }
    });

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            Obx(() => controller.hasPermission.value
                ? _buildScannerView(controller, scanAreaSize)
                : _buildPermissionDeniedView(controller)),
            _buildOverlay(size, scanAreaSize),
            _buildTopBar(controller),
            _buildBottomControls(controller),
          ],
        ),
      ),
    );
  }

  Widget _buildScannerView(QrScannerController controller, double scanAreaSize) {
    return Obx(() => controller.isScanning.value
        ? MobileScanner(
      controller: controller.scannerController,
      onDetect: (capture) {
        final List<Barcode> barcodes = capture.barcodes;
        if (barcodes.isNotEmpty && barcodes[0].rawValue != null) {
          controller.handleScannedCode(barcodes[0].rawValue!);
        }
      },
    )
        : Center(
      child: Container(
        width: scanAreaSize,
        height: scanAreaSize,
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.5),
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Center(
          child: Text(
            'Scanning paused',
            style: TextStyle(color: Colors.white, fontSize: 18),
          ),
        ),
      ),
    ));
  }

  Widget _buildPermissionDeniedView(QrScannerController controller) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.add_circle, color: Colors.white, size: 64),
          const SizedBox(height: 16),
          const Text(
            'Camera permission is required',
            style: TextStyle(color: Colors.white, fontSize: 18),
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

  Widget _buildOverlay(Size size, double scanAreaSize) {
    return SizedBox(
      width: size.width,
      height: size.height,
      child: Stack(
        children: [
          Container(color: Colors.black.withOpacity(0.5)),
          Center(
            child: Container(
              width: scanAreaSize,
              height: scanAreaSize,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white, width: 2),
                borderRadius: BorderRadius.circular(16),
                color: Colors.transparent,
              ),
              child: Stack(
                children: [
                  Positioned(top: 5, left: 0, child: _buildCorner(true, true)),
                  Positioned(top: 0, right: 0, child: _buildCorner(true, false)),
                  Positioned(bottom: 0, left: 0, child: _buildCorner(false, true)),
                  Positioned(bottom: 0, right: 0, child: _buildCorner(false, false)),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: size.height * 0.25,
            left: 0,
            right: 0,
            child: const Center(
              child: Text(
                'Align Your Charger QR code within the frame',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCorner(bool isTop, bool isLeft) {
    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        border: Border(
          top: isTop ? const BorderSide(color: Colors.blue, width: 4) : BorderSide.none,
          bottom: !isTop ? const BorderSide(color: Colors.blue, width: 4) : BorderSide.none,
          left: isLeft ? const BorderSide(color: Colors.blue, width: 4) : BorderSide.none,
          right: !isLeft ? const BorderSide(color: Colors.blue, width: 4) : BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildTopBar(QrScannerController controller) {
    return Positioned(
      top: 16,
      left: 16,
      right: 16,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.5),
              borderRadius: BorderRadius.circular(30),
            ),
            child: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Get.back(),
            ),
          ),
          const Text(
            'Scan QR Code',
            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
          ),
          Obx(() => Container(
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.5),
              borderRadius: BorderRadius.circular(30),
            ),
            child: IconButton(
              icon: Icon(
                controller.isFlashlightOn.value ? Icons.flash_on : Icons.flash_off,
                color: Colors.white,
              ),
              onPressed: () => controller.toggleFlashlight(),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildBottomControls(QrScannerController controller) {
    return Positioned(
      bottom: 32,
      left: 0,
      right: 0,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Obx(() => ElevatedButton.icon(
            onPressed: () {
              if (controller.isScanning.value) {
                controller.pauseScanning();
              } else {
                controller.resumeScanning();
              }
            },
            icon: Icon(controller.isScanning.value ? Icons.pause : Icons.play_arrow),
            label: Text(controller.isScanning.value ? 'Pause' : 'Resume'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildScannedBottomSheet(QrScannerController controller) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 36),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle, color: Colors.green, size: 64),
          const SizedBox(height: 16),
          const Text(
            'QR Code Scanned',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            controller.scannedCode.value,
            style: const TextStyle(fontSize: 16),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              ElevatedButton.icon(
                onPressed: () {
                  controller.resumeScanning();
                  controller.scannedCode.value = '';
                  Get.back(); // Close the sheet
                },
                icon: const Icon(Icons.qr_code_scanner),
                label: const Text('Scan Again'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                ),
              ),
              ElevatedButton.icon(
                onPressed: () {
                  Get.back(); // Close the sheet
                  Get.back(result: controller.scannedCode.value); // Return the result
                },
                icon: const Icon(Icons.check),
                label: const Text('Confirm'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
