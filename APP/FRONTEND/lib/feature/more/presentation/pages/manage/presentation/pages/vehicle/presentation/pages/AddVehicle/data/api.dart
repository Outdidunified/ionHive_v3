import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:ionhive/core/controllers/session_controller.dart' show SessionController;
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/AddVehicle/data/url.dart';
import 'package:ionhive/utils/exception/exception.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AddVehicleApicalls {
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
    debugPrint('Response status: ${response.statusCode}');
    debugPrint('Response body: ${response.body}');

    try {
      final responseBody = jsonDecode(response.body);

      // ✅ Handle token invalidation
      if (responseBody is Map<String, dynamic> &&
          responseBody['invalidateToken'] == true) {
        _handleTokenExpired(
          responseBody['message'] ?? 'Your session is no longer valid. Please log in again.',
        );
        throw HttpException(
          response.statusCode,
          responseBody['message'] ?? _getDefaultErrorMessage(response.statusCode),
        );
      }

      // ✅ Handle token expiration
      if (response.statusCode == 403 &&
          (responseBody['message']?.toString().toLowerCase().contains('token expired') ?? false)) {
        _handleTokenExpired(
          responseBody['message'] ?? 'Your session has expired. Please log in again.',
        );
        throw HttpException(
          response.statusCode,
          responseBody['message'] ?? _getDefaultErrorMessage(response.statusCode),
        );
      }

      // ✅ Allow 200 and special 402 response
      if (response.statusCode == 200 ||
          (response.statusCode == 402 &&
              responseBody.containsKey('error') &&
              responseBody.containsKey('message'))) {
        return responseBody;
      }

      // 🚨 Throw for other unexpected status codes
      throw HttpException(
        response.statusCode,
        responseBody['message'] ?? _getDefaultErrorMessage(response.statusCode),
      );
    } catch (e) {
      debugPrint('Error parsing response or handling error: $e');
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


  Future<Map<String, dynamic>> fetchvehiclemodel(String authToken) async {
    final url = AddVehicleurl.fetchvehiclemodel;

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
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

  Future<Map<String, dynamic>> addVehicleNumber({
    required String authToken,
    required int userId,
    required String emailId,
    required String vehicleNumber,
    required int vehicleId,
  }) async {
    final url = AddVehicleurl.addvehiclenumber;

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: jsonEncode({
          'user_id': userId,
          'email_id': emailId,
          'vehicle_number': vehicleNumber,
          'vehicle_id': vehicleId,
        }),
      );
      final data = jsonDecode(response.body);
      debugPrint('save vehicle response: $data');

      return _handleResponse(response);
    } on TimeoutException {
      throw HttpException(408, 'Request timed out. Please try again.');
    } on http.ClientException {
      throw HttpException(503,
          'Unable to reach the server. Please check your connection or try again later.');
    } catch (e) {
      debugPrint("Error: $e");
      throw HttpException(500, 'Internal server error: $e');
    }
  }
}
