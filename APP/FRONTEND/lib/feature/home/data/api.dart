import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:ionhive/core/controllers/session_controller.dart' show SessionController;
import 'package:ionhive/feature/home/data/urls.dart';
import 'package:ionhive/utils/exception/exception.dart';
import 'package:get/get.dart';
import 'package:flutter/material.dart';


class HomeAPICalls {
  bool _tokenDialogShown = false;

  String _getDefaultErrorMessage(int statusCode) {
    switch (statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Invalid credentials. Please try again.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'An error occurred on the server. Please try again later.';
      case 503:
        return 'Service is temporarily unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    try {
      final responseBody = jsonDecode(response.body);

      // ✅ Handle token invalidation (e.g. account deactivated)
      if (responseBody is Map<String, dynamic> &&
          responseBody['invalidateToken'] == true) {
        _handleTokenExpired(responseBody['message'] ?? 'Your session is no longer valid. Please log in again.');
        throw HttpException(
          response.statusCode,
          responseBody['message'] ?? _getDefaultErrorMessage(response.statusCode),
        );
      }

      if (response.statusCode == 200) {
        return responseBody;
      }

      // ✅ Handle token expired based on status code and message
      if (response.statusCode == 403 &&
          (responseBody['message']?.toString().toLowerCase().contains('token expired') ?? false)) {
        _handleTokenExpired(responseBody['message'] ?? 'Your session has expired. Please log in again.');
      }

      // 🚨 Throw for all other errors
      throw HttpException(
        response.statusCode,
        responseBody['message'] ?? _getDefaultErrorMessage(response.statusCode),
      );
    } catch (e) {
      throw HttpException(
        response.statusCode,
        _getDefaultErrorMessage(response.statusCode),
      );
    }
  }

  void _handleTokenExpired(String message) {
    if (_tokenDialogShown) return;
    _tokenDialogShown = true;

    Get.defaultDialog(
      title: 'Session Expired',
      barrierDismissible: false,
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, color: Colors.red, size: 48),
          const SizedBox(height: 10),
          Text(message),
        ],
      ),
    );

    Future.delayed(Duration(seconds: 3), () {
      final sessionController = Get.find<SessionController>();
      sessionController.clearSession();
      _tokenDialogShown = false;
      Get.offAllNamed('/login');
    });
  }

  Future<Map<String, dynamic>> fetchnearbystations(
    int user_id,
    String email,
    String authToken,
    double latitude,
    double longitude,
  ) async {
    final bool isGuest =
        user_id == 0 && email.toLowerCase() == '';
    final url = isGuest
        ? HomeUrls.fetchnearbystationsForGuest
        : HomeUrls.fetchnearbystations;

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (!isGuest) 'Authorization': authToken, // Only add for non-guests
        },
        body: jsonEncode(
          isGuest
              ? {
                  'latitude': latitude,
                  'longitude': longitude,
                }
              : {
                  'email_id': email,
                  'user_id': user_id,
                  'latitude': latitude,
                  'longitude': longitude,
                },
        ),
      );

      return _handleResponse(response);
    } on TimeoutException {
      throw HttpException(408, 'Request timed out. Please try again.');
    } on http.ClientException {
      throw HttpException(503,
          'Unable to reach the server. \nPlease check your connection or try again later.');
    } catch (e) {
      debugPrint("Error: $e");
      throw HttpException(500, '$e');
    }
  }

  Future<Map<String, dynamic>> fetchactivechargers(
      int user_id, String email, String authToken) async {
    final url = HomeUrls.fetchactivechargers;

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: jsonEncode({
          'email_id': email,
          'user_id': user_id,
        }),
      );
      final data = jsonDecode(response.body);
      debugPrint('fetched active chargers ; $data');

      return _handleResponse(response);
    } on TimeoutException {
      throw HttpException(408, 'Request timed out. Please try again.');
    } on http.ClientException {
      throw HttpException(503,
          'Unable to reach the server. \nPlease check your connection or try again later.');
    } catch (e) {
      debugPrint("Error: $e");
      throw HttpException(500, '$e');
    }
  }
}
