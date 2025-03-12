import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:get/get.dart';

class ConnectivityController extends GetxController {
  var isConnected = true.obs; // Track internet connectivity status

  @override
  void onInit() {
    super.onInit();
    _monitorConnectivity(); // Start monitoring connectivity on app startup
  }

  void _monitorConnectivity() async {
    // Check the initial connectivity status
    List<ConnectivityResult> results = await Connectivity().checkConnectivity();

    // Use the first result from the list to set the initial connectivity status
    isConnected.value = _isConnected(results.first);

    // Listen for connectivity changes
    Connectivity()
        .onConnectivityChanged
        .listen((List<ConnectivityResult> results) {
      // Handle the list of connectivity results and update the connection status
      isConnected.value = _isConnected(results.first);
    });
  }

  bool _isConnected(ConnectivityResult result) {
    // Return true if the device is connected to either Wi-Fi or mobile data
    return result == ConnectivityResult.wifi ||
        result == ConnectivityResult.mobile;
  }
}
