import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/utils/debug/build_guard.dart';

class ConnectivityController extends GetxController {
  final Connectivity _connectivity = Connectivity();
  late StreamSubscription<ConnectivityResult> _subscription;

  RxBool isConnected = true.obs;
  String? lastRoute; // Store the last visited screen

  @override
  void onInit() {
    super.onInit();

    // Delay the initial check to ensure GetX is fully initialized
    Future.delayed(Duration(milliseconds: 500), () {
      checkConnection();
      _subscription =
          _connectivity.onConnectivityChanged.listen(_updateConnectionStatus);
    });
  }

  Future<void> checkConnection() async {
    ConnectivityResult result = await _connectivity.checkConnectivity();
    _updateConnectionStatus(result);
  }

  void _updateConnectionStatus(ConnectivityResult result) {
    // Use BuildGuard to prevent state changes during build
    BuildGuard.runSafely(() {
      bool wasConnected = isConnected.value;
      isConnected.value = (result != ConnectivityResult.none);

      // Only perform navigation if GetX is properly initialized and has a valid context
      if (Get.context == null) {
        print('GetX context not available, skipping navigation');
        return;
      }

      // Additional safety check
      try {
        // This will throw an error if navigation is not possible
        final _ = Get.currentRoute;
      } catch (e) {
        print('GetX navigation not ready: $e');
        return;
      }

      if (!isConnected.value) {
        // Store the last route before redirecting
        if (lastRoute == null || lastRoute != '/noInternet') {
          try {
            lastRoute = Get.currentRoute.isNotEmpty ? Get.currentRoute : '/';
          } catch (e) {
            lastRoute = '/';
          }
        }

        // Navigate to NoInternetScreen if not already there
        try {
          if (Get.currentRoute != '/noInternet') {
            Get.toNamed('/noInternet');
          }
        } catch (e) {
          print('Navigation error: $e');
        }
      } else if (wasConnected != isConnected.value) {
        // Only navigate if connection status actually changed
        // If internet is back, go back to the last visited screen
        try {
          if (!wasConnected &&
              lastRoute != null &&
              lastRoute != '/noInternet') {
            Get.offNamed(lastRoute!);
          }
        } catch (e) {
          print('Navigation error: $e');
        }
      }
    });
  }

  @override
  void onClose() {
    _subscription.cancel();
    super.onClose();
  }
}
