import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/data/url.dart';
import 'package:ionhive/utils/exception/exception.dart';

class VehicleApicalls {
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

  Future<Map<String, dynamic>> fetchsavedvehicle(
      int user_id, String email, String authToken) async {
    final url = Vehicleurl.fetchsavedvehiclebyuser;

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: jsonEncode({'email_id': email, 'user_id': user_id}),
      );
      final data = jsonDecode(response.body);
      print('fetching body vehicle : $data');
      print(response.statusCode);

      return _handleResponse(response);
    } on http.ClientException {
      throw HttpException(503, 'Please check your internet connection.');
    } catch (e) {
      debugPrint("Error: $e");
      throw HttpException(500, '$e');
    }
  }

  Future<Map<String, dynamic>> fetchvehiclemodel(
    String authToken) async {
    final url = Vehicleurl.fetchvehiclemodel;

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },

      );
      final data = jsonDecode(response.body);
      print('fetching body vehiclemodel : $data');
      print(response.statusCode);

      return _handleResponse(response);
    } on http.ClientException {
      throw HttpException(503, 'Please check your internet connection.');
    } catch (e) {
      debugPrint("Error: $e");
      throw HttpException(500, '$e');
    }
  }

}
