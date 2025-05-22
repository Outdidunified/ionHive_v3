import 'package:flutter/foundation.dart';

class iOnHiveCore {
  // Define base URLs for each environment
  static const String prodBaseUrl = 'http://192.168.1.5:3003';
  static const String devBaseUrl = 'http://192.168.1.5:3003';
  static const String testingBaseUrl = 'http://172.235.29.67:3003';

  // Define WebSocket URLs for each environment
  static const String prodWsUrl = 'ws://192.168.1.5:7004';
  static const String devWsUrl = 'ws://192.168.1.5:7004';
  static const String testingWsUrl = 'ws://172.235.29.67:7004';

  // Dynamically select URLs based on the environment
  static final String baseUrl = _getBaseUrl();
  static final String webSocketUrl = _getWebSocketUrl();

  // Private method to determine the base URL
  static String _getBaseUrl() {
    if (kDebugMode) {
      return testingBaseUrl;
    } else if (kProfileMode) {
      return devBaseUrl;
    } else if (kReleaseMode) {
      return prodBaseUrl;
    }
    return prodBaseUrl;
  }

  // Private method to determine WebSocket URL
  static String _getWebSocketUrl() {
    if (kDebugMode) {
      return testingWsUrl;
    } else if (kProfileMode) {
      return devWsUrl;
    } else if (kReleaseMode) {
      return prodWsUrl;
    }
    return prodWsUrl;
  }

  // Helper method to get charging-specific WebSocket URL
  static String getChargingWebSocketUrl(String chargerId, int connectorId) {
    return '$webSocketUrl/charging/$chargerId/$connectorId';
  }
}
