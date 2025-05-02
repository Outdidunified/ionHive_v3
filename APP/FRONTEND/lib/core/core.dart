import 'package:flutter/foundation.dart';

class iOnHiveCore {
  // Define base URLs for each environment
  static const String prodBaseUrl = 'http://192.168.1.10:3003';
  static const String devBaseUrl = 'http://192.168.1.10:3003';
  static const String testingBaseUrl = 'http://192.168.1.10:3003';

  // Dynamically select the base URL based on the environment
  static final String baseUrl = _getBaseUrl();

  // Private method to determine the base URL
  static String _getBaseUrl() {
    if (kDebugMode) {
      // Debug mode
      return testingBaseUrl;
    } else if (kProfileMode) {
      // Profile mode
      return devBaseUrl;
    } else if (kReleaseMode) {
      // Release mode
      return prodBaseUrl;
    }
    return prodBaseUrl; // Default to production URL as a fallback
  }
}
