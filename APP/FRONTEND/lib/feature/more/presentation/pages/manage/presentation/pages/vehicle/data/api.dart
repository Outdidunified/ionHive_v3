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

  Future<Map<String, dynamic>> removovevehicle(
      int user_id, String email, String authToken, int vehicle_id,String vehicleNumber) async {
    final url = Vehicleurl.removevehicle;

    try {
      debugPrint("Removing vehicle API call - URL: $url");
      debugPrint(
          "Params: user_id=$user_id, email=$email, vehicle_id=$vehicle_id,vehicle_number=$vehicleNumber");

      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: jsonEncode(
            {'email_id': email, 'user_id': user_id, 'vehicle_id': vehicle_id,'vehicle_number':vehicleNumber}),
      );

      final data = jsonDecode(response.body);
      debugPrint('Remove vehicle response: $data');
      debugPrint('Status code: ${response.statusCode}');

      // Check if the response contains an error message even with status 200
      if (response.statusCode == 200 && data['error'] == true) {
        throw HttpException(400, data['message'] ?? 'Failed to remove vehicle');
      }

      return _handleResponse(response);
    } on TimeoutException {
      debugPrint("Timeout exception while removing vehicle");
      throw HttpException(408, 'Request timed out. Please try again.');
    } on http.ClientException catch (e) {
      debugPrint("Client exception while removing vehicle: $e");
      throw HttpException(503,
          'Unable to reach the server. \nPlease check your connection or try again later.');
    } on FormatException catch (e) {
      debugPrint("Format exception while removing vehicle: $e");
      throw HttpException(500, 'Invalid response format from server');
    } catch (e) {
      debugPrint("Error removing vehicle: $e");
      throw HttpException(500, 'An unexpected error occurred: $e');
    }
  }
}
