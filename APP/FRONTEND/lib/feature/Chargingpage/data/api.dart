import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:ionhive/feature/Chargingpage/data/url.dart';
import 'package:ionhive/utils/exception/exception.dart';

class Chargingpageapicalls {
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
