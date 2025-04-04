import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:ionhive/feature/more/presentation/pages/transactions/data/url.dart';
import 'package:ionhive/utils/exception/exception.dart'; // Exception thrown Handler


class Transactionapicalls{
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

  Future<Map<String, dynamic>> Fetchalltransactions(
      String email,  int userId, String authToken) async {
    final url = Transactionurl.Fetchtransactions;

    try {
      final response = await http
          .post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: jsonEncode(
            {'email_id': email,  'user_id': userId}),
      )
          .timeout(const Duration(seconds: 10), onTimeout: () {
        throw TimeoutException(408, 'Request timed out. Please try again.');
      });
      final data = jsonDecode(response.body);
      print('transaction response :$data');
      return _handleResponse(response);
    } on http.ClientException {
      throw HttpException(503, 'Please check your internet connection.');
    } catch (e) {
      debugPrint("Error: $e");
      throw HttpException(500, '$e');
    }
  }

  Future<Map<String, dynamic>> SaveTransactionfilter(
      String email, int userId, String authToken, int? days) async {
    final url = Transactionurl.SaveTransactionfilter;

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: jsonEncode({
          'email_id': email,
          'user_id': userId,
          'days': days,
        }),
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw TimeoutException(408, 'Request timed out. Please try again.');
        },
      );

      final data = jsonDecode(response.body);
      print('Transaction filter response: $data');

      if (response.statusCode == 200) {
        return data;
      } else {
        throw HttpException(response.statusCode, data['message'] ?? 'Unknown error');
      }
    } on http.ClientException {
      throw HttpException(503, 'Please check your internet connection.');
    } catch (e) {
      debugPrint("Error: $e");
      throw HttpException(500, '$e');
    }
  }

  Future<Map<String, dynamic>> Fetchtransactionfilter(
      String email,  int userId, String authToken) async {
    final url = Transactionurl.Fetchtransactionfilter;

    try {
      final response = await http
          .post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: jsonEncode(
            {'email_id': email,  'user_id': userId}),
      )
          .timeout(const Duration(seconds: 10), onTimeout: () {
        throw TimeoutException(408, 'Request timed out. Please try again.');
      });
      final data = jsonDecode(response.body);
      print('transaction response :$data');
      return _handleResponse(response);
    } on http.ClientException {
      throw HttpException(503, 'Please check your internet connection.');
    } catch (e) {
      debugPrint("Error: $e");
      throw HttpException(500, '$e');
    }
  }

  Future<Map<String, dynamic>> Clearsavedfilter(
      String email,  int userId, String authToken) async {
    final url = Transactionurl.Clearsavedfilter;

    try {
      final response = await http
          .post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: jsonEncode(
            {'email_id': email,  'user_id': userId}),
      )
          .timeout(const Duration(seconds: 10), onTimeout: () {
        throw TimeoutException(408, 'Request timed out. Please try again.');
      });
      final data = jsonDecode(response.body);
      print('transaction response :$data');
      return _handleResponse(response);
    } on http.ClientException {
      throw HttpException(503, 'Please check your internet connection.');
    } catch (e) {
      debugPrint("Error: $e");
      throw HttpException(500, '$e');
    }
  }


}
