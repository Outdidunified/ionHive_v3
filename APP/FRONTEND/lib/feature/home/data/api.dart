import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:ionhive/feature/home/data/urls.dart';
import 'package:ionhive/utils/exception/exception.dart';

class HomeAPICalls {
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
