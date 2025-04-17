import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:ionhive/feature/home/presentation/pages/search/presentation/pages/search_page.dart';
import 'package:ionhive/utils/widgets/loading/loading_overlay.dart';
import 'package:ionhive/utils/debug/build_guard.dart';
import '../controllers/home_controller.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(HomeController());

    // Update theme mode based on current context
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final isDark = Theme.of(context).brightness == Brightness.dark;
      if (controller.isDarkMode.value != isDark) {
        controller.isDarkMode.value = isDark;
      }
    });

    return Scaffold(
      body: Obx(() {
        return LoadingOverlay(
          isLoading: controller.isLoading.value,
          opacity: 0.7,
          child: Stack(
            children: [
              // Map with controls
              _buildMapWithControls(controller, context),

              // Search bar at the top
              Positioned(
                top: MediaQuery.of(context).padding.top + 16,
                left: 16,
                right: 80, // Leave space for QR scanner button
                child: _buildSearchField(context),
              ),

              // QR scanner button at the top right
              Positioned(
                top: MediaQuery.of(context).padding.top + 16,
                right: 16,
                child: _buildQrScannerButton(context),
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildMapWithControls(
      HomeController controller, BuildContext context) {
    return Stack(
      children: [
        GoogleMap(
          onMapCreated: (mapController) {
            BuildGuard.runSafely(() {
              controller.mapController = mapController;
              controller.loadMapStyles().then((_) {
                Future.delayed(const Duration(milliseconds: 300), () {
                  controller.applyMapStyle();
                  controller.getCurrentLocation();
                });
              });
            });
          },
          initialCameraPosition: CameraPosition(
            target: controller.currentPosition.value,
            zoom: controller.zoomLevel.value,
          ),
          myLocationEnabled: false, // Using custom marker instead
          myLocationButtonEnabled: false,
          zoomControlsEnabled: false,
          compassEnabled: false,
          mapToolbarEnabled: false,
          rotateGesturesEnabled: false,
          tiltGesturesEnabled: false,
          markers: controller.markers,
          onCameraMove: (position) {
            // Update zoom level when user manually zooms
            controller.zoomLevel.value = position.zoom;
          },
          onCameraIdle: () {
            // Refresh markers when zooming stops
            controller.loadChargerMarkers();
            controller.markers.refresh();
          },
        ),
        Positioned(
          right: 16,
          bottom: 16,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Zoom In Button
              Container(
                height: 50,
                width: 50,
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: const Color.fromARGB(255, 185, 227, 185), // Light green background
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: FloatingActionButton(
                  heroTag: 'zoomIn',
                  backgroundColor: Colors.transparent, // Make transparent
                  elevation: 0, // Remove elevation
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  onPressed: controller.zoomIn,
                  child: Image.asset(
                    'assets/icons/zoom-in.png',
                    height: 24,
                    width: 24,
                    fit: BoxFit.contain,
                    color: Colors.green[800], // Dark green icon
                  ),
                ),
              ),

              // Zoom Out Button
              Container(
                height: 50,
                width: 50,
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: const Color.fromARGB(255, 185, 227, 185), // Light green background
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: FloatingActionButton(
                  heroTag: 'zoomOut',
                  backgroundColor: Colors.transparent, // Make transparent
                  elevation: 0, // Remove elevation
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  onPressed: controller.zoomOut,
                  child: Image.asset(
                    'assets/icons/zoom-out.png',
                    height: 24,
                    width: 24,
                    fit: BoxFit.contain,
                    color: Colors.green[800], // Dark green icon
                  ),
                ),
              ),

              // Current Location Button
              Container(
                height: 50,
                width: 50,
                decoration: BoxDecoration(
                  color: const Color.fromARGB(255, 185, 227, 185), // Light green background
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: FloatingActionButton(
                  heroTag: 'currentLocation',
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  onPressed: controller.zoomToCurrentLocation,
                  child: Icon(
                    Icons.my_location,
                    size: 24,
                    color: Colors.green[800], // Dark green icon
                  ),
                ),
              )
            ],
          ),
        )
      ],
    );
  }

  // Separate search field widget
  Widget _buildSearchField(BuildContext context) {
    final isDarkTheme = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        // Navigate to search page with transition
        Navigator.of(context).push(
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) => searchpage(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              const begin = Offset(-1.0, 0.0);
              const end = Offset.zero;
              const curve = Curves.easeInOut;

              var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
              var offsetAnimation = animation.drive(tween);

              return SlideTransition(
                position: offsetAnimation,
                child: child,
              );
            },
            transitionDuration: const Duration(milliseconds: 300),
          ),
        );
      },
      child: AbsorbPointer(
        child: Container(
          height: 48,
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(24),
            border: isDarkTheme
                ? Border.all(
              color: Colors.grey.withOpacity(0.3),
              width: 0.8,
            )
                : null,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(width: 16),

              // Search icon
              Icon(
                Icons.search,
                color: Theme.of(context).hintColor,
                size: 20,
              ),
              const SizedBox(width: 12),

              // Search field
              Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search for chargers...',
                    border: InputBorder.none,
                    hintStyle: TextStyle(
                      color: Theme.of(context).hintColor,
                      fontSize: 14,
                    ),
                    contentPadding: EdgeInsets.zero,
                    isDense: true,
                  ),
                  style: TextStyle(
                    color: Theme.of(context).textTheme.headlineLarge?.color,
                    fontSize: 14,
                  ),
                ),
              ),

              // Clear button would go here
              const SizedBox(width: 16),
            ],
          ),
        ),
      ),
    );
  }

  // Separate QR scanner button widget
  Widget _buildQrScannerButton(BuildContext context) {
    return Container(
      height: 50,
      width: 50,
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 185, 227, 185), // Light green background
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(Icons.qr_code_scanner, color: Colors.green[800], // Dark green icon
        ),
        onPressed: () {
          // TODO: Implement QR scanner
          debugPrint('QR scanner pressed');
          Get.snackbar(
            'QR Scanner',
            'QR Scanner functionality will be implemented here',
            snackPosition: SnackPosition.BOTTOM,
          );
        },
      ),
    );
  }
}
