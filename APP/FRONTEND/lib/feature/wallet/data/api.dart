import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/wallet/data/urls.dart';
import 'package:ionhive/feature/wallet/domain/models/payment_request.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/utils/exception/exception.dart'; // Exception thrown Handler

class WalletAPICalls {
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

  Future<Map<String, dynamic>> fetchwalletblanace(
      int user_id, String email, String authToken) async {
    final url = HeaderUrl.fetchwalletbalance;

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: jsonEncode({'email_id': email, 'user_id': user_id}),
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

  Future<Map<String, dynamic>> savePayment(
      PaymentRequest paymentRequest, String authToken) async {
    final url = HeaderUrl.savePayments;

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: jsonEncode(paymentRequest.toJson()),
      );

      return _handleResponse(response);
    } on TimeoutException {
      throw HttpException(408, 'Request timed out. Please try again.');
    } on http.ClientException {
      throw HttpException(503,
          'Unable to reach the server. \nPlease check your connection or try again later.');
    } catch (e) {
      debugPrint("Error saving payment: $e");
      throw HttpException(500, '$e');
    }
  }

  Future<Map<String, dynamic>> createOrder(
      double amount, String currency, int userId, String authToken) async {
    final url = HeaderUrl.createOrder;

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: jsonEncode({
          'amount': amount,
          'currency': currency,
          'user_id': userId,
        }),
      );

      return _handleResponse(response);
    } on TimeoutException {
      throw HttpException(408, 'Request timed out. Please try again.');
    } on http.ClientException {
      throw HttpException(503,
          'Unable to reach the server. \nPlease check your connection or try again later.');
    } catch (e) {
      debugPrint("Error creating order: $e");
      throw HttpException(500, '$e');
    }
  }
}
