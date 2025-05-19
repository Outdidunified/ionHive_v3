import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/home/presentation/pages/qrscanner/presentation/controllers/qr_controller.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

// Custom clipper to exclude the scanner area from the blur effect
class ScannerAreaClipper extends CustomClipper<Path> {
  final double scanAreaSize;
  final Size screenSize;
  final double topPosition;

  ScannerAreaClipper(this.scanAreaSize, this.screenSize, this.topPosition);

  @override
  Path getClip(Size size) {
    final path = Path();
    final centerX = screenSize.width / 2;

    path.addRect(Rect.fromLTWH(0, 0, screenSize.width, screenSize.height));

    final scannerRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(
        centerX - scanAreaSize / 2,
        topPosition,
        scanAreaSize,
        scanAreaSize,
      ),
      const Radius.circular(16), // 👈 Rounded corner for scan area
    );

    path.addRRect(scannerRRect);
    path.fillType = PathFillType.evenOdd;

    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => true;
}

class QrScannerpage extends StatelessWidget {
  const QrScannerpage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(QrScannerController());
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;
    final scanAreaSize = size.width * 0.7;

    const instructionalTextTop = 80.0;
    const instructionalTextHeight = 24.0;
    const controlButtonsHeight = 56.0;
    const controlButtonsBottom = 48.0;

    final availableSpaceTop = instructionalTextTop + instructionalTextHeight;
    final availableSpaceBottom =
        size.height - controlButtonsBottom - controlButtonsHeight;
    final availableSpaceHeight = availableSpaceBottom - availableSpaceTop;

    final scannerAreaTop =
        availableSpaceTop + (availableSpaceHeight - scanAreaSize) / 2;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: Stack(
          children: [
            Obx(() => controller.hasPermission.value
                ? _buildScanner(controller, scanAreaSize, theme)
                : _buildPermissionView(controller, theme)),
            _buildBlurOverlay(size, scanAreaSize, scannerAreaTop, theme),
            _buildTopBar(theme),
            _buildControls(controller, theme),
          ],
        ),
      ),
    );
  }

  Widget _buildScanner(
      QrScannerController controller, double scanAreaSize, ThemeData theme) {
    // Removed isScanning check; scanner is always active when permission is granted
    return MobileScanner(
      controller: controller.scannerController,
      onDetect: (capture) {
        final code = capture.barcodes.firstOrNull?.rawValue;
        if (code != null) {
          controller.handleScannedCode(code,
              barcode: capture.barcodes.firstOrNull);
        } else {
          Get.snackbar(
            'Note',
            'Invalid QR code detected',
            backgroundColor: theme.colorScheme.error,
            colorText: theme.colorScheme.onError,
          );
        }
      },
      errorBuilder: (context, error, child) {
        debugPrint('Camera error: ${error.toString()}');
        return Center(
          child: Text(
            'Camera error: ${error.toString()}',
            style: theme.textTheme.bodyMedium
                ?.copyWith(color: theme.colorScheme.error),
          ),
        );
      },
    );
  }

  Widget _buildBlurOverlay(
      Size size, double scanAreaSize, double scannerAreaTop, ThemeData theme) {
    return Stack(
      children: [
        ClipPath(
          clipper: ScannerAreaClipper(scanAreaSize, size, scannerAreaTop),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 2.0, sigmaY: 2.0),
            child: Container(
              color: theme.colorScheme.background.withOpacity(0.9),
              width: size.width,
              height: size.height,
            ),
          ),
        ),
        Positioned(
          top: scannerAreaTop,
          left: (size.width - scanAreaSize) / 2,
          child: _AnimatedScanArea(
            size: scanAreaSize,
            borderColor: theme.colorScheme.primary,
          ),
        ),
        Positioned(
          top: 80,
          left: 0,
          right: 0,
          child: Center(
            child: Text(
              'Align QR code inside the box',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onBackground.withOpacity(0.9),
                fontWeight: FontWeight.w500,
              ),
              semanticsLabel:
                  'Instruction to align QR code inside the scanning box',
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTopBar(ThemeData theme) {
    return Positioned(
      top: 16,
      left: 16,
      right: 16,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            color: theme.colorScheme.surface.withOpacity(0.4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                CircleAvatar(
                  backgroundColor: theme.colorScheme.surface.withOpacity(0.8),
                  child: Semantics(
                    label: 'Back button',
                    child: IconButton(
                      icon: Icon(Icons.arrow_back,
                          color: theme.colorScheme.onSurface),
                      onPressed: () => Get.back(),
                      tooltip: 'Go back',
                    ),
                  ),
                ),
                Text(
                  'Scan QR Code',
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: theme.colorScheme.onSurface,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 48),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildControls(QrScannerController controller, ThemeData theme) {
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
                tooltip: 'Toggle flashlight',
                theme: theme,
              ),
              // Removed pause/play button
            ],
          )),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required VoidCallback onPressed,
    required String tooltip,
    required ThemeData theme,
  }) {
    return Tooltip(
      message: tooltip,
      child: CircleAvatar(
        radius: 28,
        backgroundColor: theme.colorScheme.primary,
        child: IconButton(
          icon: Icon(
            icon,
            color: theme.colorScheme.onPrimary,
          ),
          onPressed: onPressed,
        ),
      ),
    );
  }

  Widget _buildPermissionView(QrScannerController controller, ThemeData theme) {
    // Show the permission view and automatically show the snackbar
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.requestCameraPermission();
    });

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.camera_alt,
                color: theme.colorScheme.onBackground, size: 64),
            const SizedBox(height: 16),
            Text(
              'Camera Access Required',
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.onBackground,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
              semanticsLabel: 'Camera permission required to scan QR codes',
            ),
            const SizedBox(height: 12),
            Text(
              'To scan QR codes, this app needs access to your camera. Please enable camera permission in your device settings.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onBackground,
              ),
              textAlign: TextAlign.center,
            ),

          ],
        ),
      ),
    );
  }
}

class _AnimatedScanArea extends StatefulWidget {
  final double size;
  final Color borderColor;

  const _AnimatedScanArea({
    required this.size,
    required this.borderColor,
  });

  @override
  _AnimatedScanAreaState createState() => _AnimatedScanAreaState();
}

class _AnimatedScanAreaState extends State<_AnimatedScanArea>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scanLineAnimation;
  late Animation<double>
      _diagonalLineAnimation; // Made non-nullable since animations always run

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _scanLineAnimation = Tween<double>(begin: 0, end: widget.size).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _diagonalLineAnimation =
        Tween<double>(begin: -widget.size / 2, end: widget.size / 2).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    // Removed isScanning listener; animations run continuously
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: widget.borderColor, width: 2),
          ),
          child: Semantics(
            label: 'QR code scanning area',
            child: Stack(
              children: [
                // Removed Obx and isScanning check; animations always run
                Positioned(
                  top: _scanLineAnimation.value,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 2,
                    color: widget.borderColor.withOpacity(0.6),
                  ),
                ),
                Positioned(
                  top: 0,
                  left: _diagonalLineAnimation.value,
                  child: Transform.rotate(
                    angle: 45 * 3.14159 / 180,
                    child: Container(
                      width: widget.size / 2,
                      height: 2,
                      color: widget.borderColor.withOpacity(0.4),
                    ),
                  ),
                ),
                Positioned(
                  top: 0,
                  right: _diagonalLineAnimation.value,
                  child: Transform.rotate(
                    angle: -45 * 3.14159 / 180,
                    child: Container(
                      width: widget.size / 2,
                      height: 2,
                      color: widget.borderColor.withOpacity(0.4),
                    ),
                  ),
                ),

              ],
            ),
          ),
        ),
      ],
    );
  }


}
