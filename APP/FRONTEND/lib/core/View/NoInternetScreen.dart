import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/core/controllers/connectivity_controller.dart';

class NoInternetScreen extends StatelessWidget {
  const NoInternetScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final connectivityController = Get.find<ConnectivityController>();
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final colorScheme = theme.colorScheme;
    final mediaQuery = MediaQuery.of(context);

    double screenWidth = mediaQuery.size.width;
    double screenHeight = mediaQuery.size.height;

    return Scaffold(
      backgroundColor: colorScheme.background,
      body: Obx(() {
        if (connectivityController.isConnected.value) {
          // Navigate back when internet is restored
          WidgetsBinding.instance.addPostFrameCallback((_) => Get.back());
        }

        return Center(
          child: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.08),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.wifi_off,
                    size: screenWidth * 0.2, // Responsive icon size
                    color: colorScheme.error,
                  ),
                  SizedBox(height: screenHeight * 0.03),
                  Text(
                    "No Internet Connection",
                    style: textTheme.bodyLarge?.copyWith(
                      color: textTheme.bodyMedium?.color?.withOpacity(0.7),
                      fontWeight: FontWeight.bold
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: screenHeight * 0.02),
                  Text(
                    "Please check your connection and try again.",
                    style: textTheme.bodyLarge?.copyWith(
                      color: textTheme.headlineMedium?.color,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: screenHeight * 0.04),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: colorScheme.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: EdgeInsets.symmetric(
                        vertical: screenHeight * 0.018,
                        horizontal: screenWidth * 0.12,
                      ),
                    ),
                    onPressed: () async {
                      await connectivityController.checkConnection();
                      if (!connectivityController.isConnected.value) {
                        _showNoInternetSnackbar();
                      }
                    },
                    child: Text(
                      "Retry",
                      style: textTheme.bodyLarge?.copyWith(
                        color: colorScheme.onPrimary,)
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }),
    );
  }

  void _showNoInternetSnackbar() {
    Get.snackbar(
      "No Internet",
      "Please check your connection!",
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.grey.shade900,
      colorText: Colors.white,
      icon: const Icon(Icons.wifi_off, color: Colors.white),
      duration: const Duration(seconds: 3),
      margin: const EdgeInsets.all(12),
      borderRadius: 10,
    );
  }
}
