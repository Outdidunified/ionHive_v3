import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/Chargingpage/data/url.dart';
import 'package:ionhive/utils/exception/exception.dart';
import 'package:get/get.dart';
import 'package:flutter/material.dart';

class Chargingpageapicalls {
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


  Future<Map<String, dynamic>> endChargingsession(int user_id, String email,
      String authToken, int connector_id, String charger_id) async {
    final url = Chargingpageurl.endchargingsession;

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
          'connector_id': connector_id,
          'charger_id': charger_id
        }),
      );
      final data = jsonDecode(response.body);
      debugPrint('fetching end charging seesion body : $data');

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

  Future<Map<String, dynamic>> fetchlaststaus(int user_id, String email,
      String authToken, int connector_id, String charger_id,int connector_type) async {
    final url = Chargingpageurl.fetchlaststatus;

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
          'connector_id': connector_id,
          'charger_id': charger_id,
          'connector_type':connector_type
        }),
      );
      final data = jsonDecode(response.body);
      debugPrint('fetching last status  body : $data');

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

  Future<Map<String, dynamic>> Startcharging(int user_id, String email,
      String authToken, int connector_id, String charger_id,int connector_type) async {
    final url = Chargingpageurl.startcharging;

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
          'connector_id': connector_id,
          'charger_id': charger_id,
          'connector_type':connector_type
        }),
      );
      final data = jsonDecode(response.body);
      debugPrint('fetching start charging  body : $data');

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

  Future<Map<String, dynamic>> Stopcharging(int user_id, String email,
      String authToken, int connector_id, String charger_id,int connector_type) async {
    final url = Chargingpageurl.stopcharging;

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
          'connector_id': connector_id,
          'charger_id': charger_id,
          'connector_type':connector_type
        }),
      );
      final data = jsonDecode(response.body);
      debugPrint('fetching stop charging   body : $data');

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

  Future<Map<String, dynamic>> Autostop(int user_id, String email,
      String authToken, int updateUserTimeVal,int updateUserUnitVal,int updateUserPriceVal ,bool updateUserTime_isChecked,bool updateUserUnit_isChecked,bool updateUserPrice_isChecked ) async {
    final url = Chargingpageurl.autostop;
    debugPrint(' from frontend : updateUserTimeVal: $updateUserTimeVal,updateUserUnitVal: $updateUserUnitVal,updateUserPriceVal:$updateUserPriceVal,updateUserTime_isChecked:$updateUserTime_isChecked,updateUserUnit_isChecked:$updateUserUnit_isChecked,updateUserPrice_isChecked:$updateUserPrice_isChecked');

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
          'updateUserTimeVal': updateUserTimeVal,
          'updateUserUnitVal': updateUserUnitVal,
          'updateUserPriceVal':updateUserPriceVal,
          'updateUserTime_isChecked':updateUserTime_isChecked,
          'updateUserUnit_isChecked':updateUserUnit_isChecked,
          'updateUserPrice_isChecked':updateUserPrice_isChecked


        }),
      );
      final data = jsonDecode(response.body);
      debugPrint('fetching update auto stop    body : $data');

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

  Future<Map<String, dynamic>> fetchstartedat(int user_id, String email,
      String authToken, int connector_id, String charger_id,int connector_type) async {
    final url = Chargingpageurl.startedat;

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
          'connector_id': connector_id,
          'charger_id': charger_id,
          'connector_type':connector_type
        }),
      );
      final data = jsonDecode(response.body);
      debugPrint('fetching startedat  body : $data');

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

  Future<Map<String, dynamic>> generatechargingbill(int user_id, String email,
      String authToken, int connector_id, String charger_id,int connector_type) async {
    final url = Chargingpageurl.forgeneratingchargingbill;

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
          'connector_id': connector_id,
          'charger_id': charger_id,
          'connector_type':connector_type
        }),
      );
      final data = jsonDecode(response.body);
      debugPrint('fetching generate charging bill  body : $data');

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
