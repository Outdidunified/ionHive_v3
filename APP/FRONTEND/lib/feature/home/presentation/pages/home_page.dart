import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:ionhive/feature/home/presentation/pages/search/presentation/pages/search_page.dart';
import 'package:ionhive/feature/home/presentation/widgets/station_card.dart';
import 'package:ionhive/utils/widgets/loading/loading_overlay.dart';
import 'package:ionhive/utils/debug/build_guard.dart';
import '../controllers/home_controller.dart';
import 'qrscanner/presentation/pages/qr_scannerpage.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    // Use Get.put with a check to persist controller
    HomeController controller;
    try {
      controller = Get.find<HomeController>();
    } catch (e) {
      controller = Get.put(HomeController(), permanent: true);
    }

    // Update theme after frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final isDark = Theme.of(context).brightness == Brightness.dark;
      if (controller.isDarkMode.value != isDark) {
        controller.isDarkMode.value = isDark;
      }
    });

    return WillPopScope(
      onWillPop: () async {
        if (Navigator.of(context).canPop()) {
          Navigator.of(context).pop();
          return false;
        } else {
          final shouldExit =
              await controller.showExitConfirmationDialog(context);
          return shouldExit;
        }
      },
      child: Obx(
        () => LoadingOverlay(
          isLoading: controller.isLoading.value,
          opacity: 0.7,
          child: Scaffold(
            body: Stack(
              children: [
                _buildMapWithControls(controller, context),
                Positioned(
                  top: MediaQuery.of(context).padding.top + 16,
                  left: 16,
                  right: 80,
                  child: _buildSearchField(context, controller),
                ),
                Positioned(
                  top: MediaQuery.of(context).padding.top + 16,
                  right: 16,
                  child: _buildQrScannerButton(context, controller),
                ),
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: _buildStationCardsList(controller, context),
                ),
                Positioned(
                  top: MediaQuery.of(context).padding.top + 80,
                  right: 16,
                  child: _buildRefreshButton(context, controller),
                ),
                Positioned(
                  top: MediaQuery.of(context).padding.top + 140,
                  right: 16,
                  child: ActiveChargersbutton(context, controller),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMapWithControls(
      HomeController controller, BuildContext context) {
    final isDarkTheme = controller.isDarkMode.value;

    return Stack(
      children: [
        GoogleMap(
          onMapCreated: (mapController) {
            BuildGuard.runSafely(() {
              controller.mapController = mapController;
              if (!controller.mapControllerCompleter.isCompleted) {
                controller.mapControllerCompleter.complete(mapController);
              }

              controller.loadMapStyles().then((_) {
                Future.delayed(const Duration(milliseconds: 300), () {
                  controller.applyMapStyle();
                  // Only fetch if location isn't cached
                  if (!controller.isLocationFetched.value) {
                    controller.getCurrentLocation().then((_) {
                      controller.fetchNearbyChargers();
                    });
                  }
                });
              });
            });
          },
          initialCameraPosition: CameraPosition(
            target: controller.currentPosition.value,
            zoom: controller.zoomLevel.value,
          ),
          myLocationEnabled: false,
          myLocationButtonEnabled: false,
          zoomControlsEnabled: false,
          compassEnabled: false,
          mapToolbarEnabled: false,
          rotateGesturesEnabled: false,
          tiltGesturesEnabled: false,
          markers: controller.markers,
          onCameraMove: (position) {
            controller.zoomLevel.value = position.zoom;
          },
          onCameraIdle: () {
            controller.loadChargerMarkers();
            controller.markers.refresh();
          },
        ),
        Positioned(
          right: 16,
          bottom: MediaQuery.of(context).size.height < 500
              ? 160
              : (MediaQuery.of(context).size.height < 600 ? 180 : 200),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 50,
                width: 50,
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: isDarkTheme
                      ? Colors.green[800]
                      : const Color.fromARGB(255, 185, 227, 185),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(isDarkTheme ? 0.3 : 0.1),
                      blurRadius: 4,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: FloatingActionButton(
                  heroTag: 'zoomIn',
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  onPressed: controller.zoomIn,
                  child: Image.asset(
                    'assets/icons/zoom-in.png',
                    height: 24,
                    width: 24,
                    fit: BoxFit.contain,
                    color: isDarkTheme
                        ? const Color.fromARGB(255, 185, 227, 185)
                        : Colors.green[800],
                  ),
                ),
              ),
              Container(
                height: 50,
                width: 50,
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: isDarkTheme
                      ? Colors.green[800]
                      : const Color.fromARGB(255, 185, 227, 185),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(isDarkTheme ? 0.3 : 0.1),
                      blurRadius: 4,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: FloatingActionButton(
                  heroTag: 'zoomOut',
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  onPressed: controller.zoomOut,
                  child: Image.asset(
                    'assets/icons/zoom-out.png',
                    height: 24,
                    width: 24,
                    fit: BoxFit.contain,
                    color: isDarkTheme
                        ? const Color.fromARGB(255, 185, 227, 185)
                        : Colors.green[800],
                  ),
                ),
              ),
              Container(
                height: 50,
                width: 50,
                decoration: BoxDecoration(
                  color: isDarkTheme
                      ? Colors.green[800]
                      : const Color.fromARGB(255, 185, 227, 185),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(isDarkTheme ? 0.3 : 0.1),
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
                    color: isDarkTheme
                        ? const Color.fromARGB(255, 185, 227, 185)
                        : Colors.green[800],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSearchField(BuildContext context, HomeController controller) {
    final isDarkTheme = controller.isDarkMode.value;

    return GestureDetector(
      onTap: () async {
        final result = await Navigator.of(context).push(
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) =>
                SearchPage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
              const begin = Offset(-1.0, 0.0);
              const end = Offset.zero;
              const curve = Curves.easeInOut;

              var tween =
                  Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
              var offsetAnimation = animation.drive(tween);

              return SlideTransition(
                position: offsetAnimation,
                child: child,
              );
            },
            transitionDuration: const Duration(milliseconds: 300),
          ),
        );

        if (result != null && result is Map<String, dynamic>) {
          if (result['isChargerId'] == true) {
            final String chargerId = result['chargerId'] ?? '';
            if (chargerId.isNotEmpty) {
              Get.snackbar(
                'Searching for Charger',
                'Looking for charger ID: $chargerId',
                snackPosition: SnackPosition.BOTTOM,
              );
            }
          } else if (result.containsKey('latitude') &&
              result.containsKey('longitude')) {
            final String name = result['name'] ?? 'Selected Location';
            final double latitude = result['latitude'];
            final double longitude = result['longitude'];
            final bool isCurrentLocation = result['isCurrentLocation'] ?? false;

            controller.addSelectedLocationMarker(name, latitude, longitude,
                isCurrentLocation: isCurrentLocation);
          }
        }
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
              Icon(
                Icons.search,
                color: Theme.of(context).hintColor,
                size: 20,
              ),
              const SizedBox(width: 12),
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
              const SizedBox(width: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQrScannerButton(
      BuildContext context, HomeController controller) {
    final isDarkTheme = controller.isDarkMode.value;

    return Container(
      height: 50,
      width: 50,
      decoration: BoxDecoration(
        color: isDarkTheme
            ? Colors.green[800]
            : const Color.fromARGB(255, 185, 227, 185),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDarkTheme ? 0.3 : 0.1),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(
          Icons.qr_code_scanner,
          color: isDarkTheme
              ? const Color.fromARGB(255, 185, 227, 185)
              : Colors.green[800],
        ),
        onPressed: () {
          Get.to(() => const QrScannerpage(), transition: Transition.leftToRight);
        },

      ),
    );
  }

  Widget _buildRefreshButton(BuildContext context, HomeController controller) {
    final isDarkTheme = controller.isDarkMode.value;

    return Container(
      height: 50,
      width: 50,
      decoration: BoxDecoration(
        color: isDarkTheme
            ? Colors.green[800]
            : const Color.fromARGB(255, 185, 227, 185),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDarkTheme ? 0.3 : 0.1),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(
          Icons.refresh,
          color: isDarkTheme
              ? const Color.fromARGB(255, 185, 227, 185)
              : Colors.green[800],
        ),
        onPressed: () {
          controller.refreshData();
        },
      ),
    );
  }

  Widget ActiveChargersbutton(BuildContext context, HomeController controller)       {
    final isDarkTheme = controller.isDarkMode.value;

    return Container(
      height: 50,
      width: 50,
      decoration: BoxDecoration(
        color: isDarkTheme
            ? Colors.green[800]
            : const Color.fromARGB(255, 185, 227, 185),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDarkTheme ? 0.3 : 0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: Image.asset(
          'assets/icons/saved_device.png',
          color: isDarkTheme
              ? const Color.fromARGB(255, 185, 227, 185)
              : Colors.green[800],
          height: 25,
        ),
        onPressed: () {
          controller.fetchactivechargers();
        },
      ),
    );
  }

  Widget _buildStationCardsList(
      HomeController controller, BuildContext context) {
    final isDarkTheme = controller.isDarkMode.value;

    return Obx(() {
      if (!controller.isLocationFetched.value) {
        return const SizedBox.shrink();
      }

      final screenWidth = MediaQuery.of(context).size.width;
      final screenHeight = MediaQuery.of(context).size.height;
      final isSmallScreen = screenWidth < 360 || screenHeight < 600;
      final verySmallScreen = screenWidth < 320 || screenHeight < 500;

      return Container(
        height: verySmallScreen ? 170 : (isSmallScreen ? 165 : 185),
        decoration: BoxDecoration(
          color: isDarkTheme
              ? Colors.black.withOpacity(0.7)
              : Colors.white.withOpacity(0.9),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Nearby Charging Stations',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isDarkTheme ? Colors.white : Colors.black87,
                    ),
                  ),
                  TextButton(
                    onPressed: controller.navigateToAllChargers,
                    child: Text(
                      'View All',
                      style: TextStyle(
                        color: Colors.green[700],
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: controller.chargers.isEmpty
                  ? Center(
                      child: Container(
                        margin: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: Colors.grey,
                            width: 0.2,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          color: isDarkTheme
                              ? Colors.black.withOpacity(0.7)
                              : Colors.white.withOpacity(0.9),
                        ),
                        child: const Center(
                          child: Text(
                            'No Charging Stations available in this location',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                              color: Colors.grey,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                    )
                  : Column(
                      children: [
                        Expanded(
                          child: PageView.builder(
                            controller: controller.stationPageController ??=
                                PageController(
                              viewportFraction: 0.85,
                              initialPage:
                                  controller.selectedChargerIndex.value,
                            ),
                            padEnds: false,
                            physics: const BouncingScrollPhysics(),
                            onPageChanged: (index) {
                              controller.animateToCharger(index);
                            },
                            itemCount: controller.chargers.length,
                            itemBuilder: (context, index) {
                              final station = controller.chargers[index];
                              return Padding(
                                padding: const EdgeInsets.only(left: 12),
                                child: StationCard(
                                  station: station,
                                  isDarkTheme: isDarkTheme,
                                  onTap: () {
                                    controller.showStationDetails(station);
                                    if (controller.mapController != null) {
                                      final position =
                                          station['position'] as LatLng;
                                      controller.mapController!.animateCamera(
                                        CameraUpdate.newLatLngZoom(
                                            position, 18.0),
                                      );
                                    }
                                  },
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      );
    });
  }
}
