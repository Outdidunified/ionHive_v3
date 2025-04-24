import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:ionhive/feature/more/presentation/pages/manage/data/url.dart';
import 'package:ionhive/utils/exception/exception.dart';

class Manageapicall {
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
