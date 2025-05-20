import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:ionhive/core/controllers/session_controller.dart' show SessionController;
import 'package:ionhive/feature/more/presentation/pages/manage/data/url.dart';
import 'package:ionhive/utils/exception/exception.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class Manageapicall {
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

  Future<Map<String, dynamic>> Fetchrfid(String email, String token) async {
    final url = Manageurl.fetchRfid;

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: jsonEncode({'email_id': email}),
      );

      // Parse response properly
      final responseData = _handleResponse(response);

      return responseData;
    } on TimeoutException {
      throw HttpException(408, 'Request timed out. Please try again.');
    } on http.ClientException {
      throw HttpException(503,
          'Unable to reach the server. \nPlease check your connection or try again later.');
    } catch (e) {
      debugPrint("Errorhello: $e");
      return {"error": true, "message": "Unexpected error: ${e.toString()}"};
    }
  }

  Future<Map<String, dynamic>> DeactivateRfid(
      String email, String token, int userid, String tagid, bool status) async {
    final url = Manageurl.DeactivateRfid;

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: jsonEncode({
          'email_id': email,
          'user_id': userid,
          'tag_id': tagid,
          'status': false
        }),
      );

      // Parse response properly
      final responseData = _handleResponse(response);

      return responseData;
    } on TimeoutException {
      throw HttpException(408, 'Request timed out. Please try again.');
    } on http.ClientException {
      throw HttpException(503,
          'Unable to reach the server. \nPlease check your connection or try again later.');
    } catch (e) {
      debugPrint("Errorhello: $e");
      return {"error": true, "message": "Unexpected error: ${e.toString()}"};
    }
  }
}
