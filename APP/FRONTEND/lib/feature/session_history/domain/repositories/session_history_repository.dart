
import 'package:ionhive/feature/session_history/data/api.dart';
import 'package:ionhive/feature/session_history/domain/models/session_history_model.dart';

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


}
