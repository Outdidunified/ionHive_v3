import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:get/get.dart';

class ConnectivityController extends GetxController {
  final Connectivity _connectivity = Connectivity();
  late StreamSubscription<ConnectivityResult> _subscription;

  RxBool isConnected = true.obs;
  String? lastRoute; // Store the last visited screen

  @override
  void onInit() {
    super.onInit();
    checkConnection();
    _subscription = _connectivity.onConnectivityChanged.listen(_updateConnectionStatus);
  }

  Future<void> checkConnection() async {
    ConnectivityResult result = await _connectivity.checkConnectivity();
    _updateConnectionStatus(result);
  }

  void _updateConnectionStatus(ConnectivityResult result) {
    bool wasConnected = isConnected.value;
    isConnected.value = (result != ConnectivityResult.none);

    if (!isConnected.value) {
      // Store the last route before redirecting
      if (lastRoute == null || lastRoute != '/noInternet') {
        lastRoute = Get.currentRoute.isNotEmpty ? Get.currentRoute : '/';
      }

      // Navigate to NoInternetScreen if not already there
      if (Get.currentRoute != '/noInternet') {
        Get.offAllNamed('/noInternet');
      }
    } else {
      // If internet is back, go back to the last visited screen
      if (!wasConnected && lastRoute != null && lastRoute != '/noInternet') {
        Get.offAllNamed(lastRoute!);
      } else {
        Get.offAllNamed('/'); // Default to SplashScreen
      }
    }
  }

  @override
  void onClose() {
    _subscription.cancel();
    super.onClose();
  }
}
