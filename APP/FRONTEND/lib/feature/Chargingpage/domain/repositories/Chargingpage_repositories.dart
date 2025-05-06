import 'package:ionhive/feature/Chargingpage/data/api.dart';
import 'package:ionhive/feature/Chargingpage/domain/models/Chargingpage_model.dart';

class Chargingpagerepo {
  final Chargingpageapicalls _api = Chargingpageapicalls();

  Future<EndChargingsessionresponse> endchargingsession(
      int user_id, String email, String authToken, int connector_id, String charger_id) async {
    try {
      final responseJson =
      await _api.endChargingsession(user_id, email, authToken, connector_id, charger_id);
      return EndChargingsessionresponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<Fetchlaststatusresponse> fetchlastdata(
      int user_id, String email, String authToken, int connector_id, String charger_id,int connector_type) async {
    try {
      final responseJson =
      await _api.fetchlaststaus(user_id, email, authToken, connector_id, charger_id,connector_type);
      return Fetchlaststatusresponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }



}