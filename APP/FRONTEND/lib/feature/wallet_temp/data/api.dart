import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:ionhive/feature/wallet_temp/data/urls.dart';
import 'package:ionhive/feature/wallet_temp/domain/models/payment_request.dart';
import 'package:ionhive/utils/exception/exception.dart'; // Exception thrown Handler

class WalletAPICalls {
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
    final responseBody = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return responseBody;
    }

    throw HttpException(
      response.statusCode,
      responseBody['message'] ?? _getDefaultErrorMessage(response.statusCode),
    );
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
