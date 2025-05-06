import 'package:ionhive/feature/session_history/data/api.dart';
import 'package:ionhive/feature/session_history/domain/models/session_history_model.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'dart:io';
import 'package:http/http.dart' as http;

class Fetchtotalsessioncountrep {
  final Sessionhistoryapicalls _api = Sessionhistoryapicalls();

  Future<Fetchtotalsessioncountresponse> fetchtotaldata(
      int user_id, String email, String authToken) async {
    try {
      final responseJson =
          await _api.fetchtotalsessioncount(user_id, email, authToken);
      return Fetchtotalsessioncountresponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<SessionHistoryDetailsResponse> fetchallsessiondetails(
      int user_id, String email, String authToken) async {
    try {
      final responseJson =
          await _api.fetchSessionHistoryDetails(user_id, email, authToken);
      return SessionHistoryDetailsResponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> downloadChargingSessionDetails(
      String? emailId, double totalUnitConsumed, String authToken) async {
    try {
      final http.Response response = await _api.downloadChargingSessionDetails(
          emailId, totalUnitConsumed, authToken);

      if (response.statusCode == 200 &&
          response.headers['content-type']?.contains('application/pdf') ==
              true) {
        final directory = await getApplicationDocumentsDirectory();
        final filePath = '${directory.path}/ChargingSessions_$emailId.pdf';
        final file = File(filePath);
        await file.writeAsBytes(response.bodyBytes);
        await OpenFile.open(filePath);
      } else {
        throw Exception(
            'Failed to download file: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error downloading file: $e');
    }
  }

  Future<void> downloadinvoice(String? emailId, int session_id,
      String authToken, String charger_id) async {
    try {
      final http.Response response = await _api.downloadinvoice(
          emailId, session_id, authToken, charger_id);

      if (response.statusCode == 200 &&
          response.headers['content-type']?.contains('application/pdf') ==
              true) {
        final directory = await getApplicationDocumentsDirectory();
        final filePath = '${directory.path}/ChargingInvoice_$emailId.pdf';
        final file = File(filePath);
        await file.writeAsBytes(response.bodyBytes);
        await OpenFile.open(filePath);
      } else {
        throw Exception(
            'Failed to download file: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      throw Exception('Error downloading file: $e');
    }
  }
}
