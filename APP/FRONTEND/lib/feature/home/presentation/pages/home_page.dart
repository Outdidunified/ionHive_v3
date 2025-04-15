import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:ionhive/utils/widgets/loading/loading_overlay.dart';
import 'package:ionhive/utils/debug/build_guard.dart';
import '../controllers/home_controller.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(HomeController());

    return Scaffold(
      body: Obx(() {
        return LoadingOverlay(
          isLoading: controller.isLoading.value,
          opacity: 0.7,
          child: _buildMapWithControls(controller),
        );
      }),
    );
  }

  Widget _buildMapWithControls(HomeController controller) {
    // Default position (center of India)
    final defaultPosition = const LatLng(20.5937, 78.9629);

    return Stack(
      children: [
        GoogleMap(
          onMapCreated: (mapController) {
            BuildGuard.runSafely(() {
              controller.mapController = mapController;
              controller.loadMapStyles(); // Load styles when map is ready
              controller.applyMapStyle();

              // Request location after a delay
              Future.delayed(const Duration(milliseconds: 500), () {
                controller.getCurrentLocation();
              });
            });
          },
          initialCameraPosition: CameraPosition(
            target: controller.currentPosition.value,
            zoom: controller.zoomLevel.value,
          ),
          myLocationEnabled: true, // Use default location marker
          myLocationButtonEnabled: false,
          zoomControlsEnabled: false,
          compassEnabled: false,
          mapToolbarEnabled: false,
          rotateGesturesEnabled: false,
          tiltGesturesEnabled: false,

          // markers: controller.markers.value.toSet(),
        ),
        Positioned(
          right: 16,
          bottom: 16,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              FloatingActionButton(
                heroTag: 'zoomIn',
                mini: true,
                onPressed: controller.zoomIn,
                child: Image.asset(
                  'assets/icons/zoom-in.png',
                  height: 24,
                  width: 24,
                  fit: BoxFit.contain,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              FloatingActionButton(
                heroTag: 'zoomOut',
                mini: true,
                onPressed: controller.zoomOut,
                child: Image.asset(
                  'assets/icons/zoom-out.png',
                  height: 24,
                  width: 24,
                  fit: BoxFit.contain,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              FloatingActionButton(
                heroTag: 'currentLocation',
                mini: true,
                onPressed: controller.getCurrentLocation,
                child: const Icon(Icons.my_location),
              ),
            ],
          ),
        ),
      ],
    );
  }
}