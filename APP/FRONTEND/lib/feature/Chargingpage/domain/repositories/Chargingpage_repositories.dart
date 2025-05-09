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
      int user_id, String email, String authToken, int connector_id, String charger_id, int connector_type) async {
    try {
      final responseJson =
      await _api.fetchlaststaus(user_id, email, authToken, connector_id, charger_id, connector_type);
      return Fetchlaststatusresponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<StartChargingresponse> StartCharging(
      int user_id, String email, String authToken, int connector_id, String charger_id, int connector_type) async {
    try {
      final responseJson =
      await _api.Startcharging(user_id, email, authToken, connector_id, charger_id, connector_type);
      return StartChargingresponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<StopChargingresponse> StopCharging(
      int user_id, String email, String authToken, int connector_id, String charger_id, int connector_type) async {
    try {
      final responseJson =
      await _api.Stopcharging(user_id, email, authToken, connector_id, charger_id, connector_type);
      return StopChargingresponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<Updateautostopresponse> updateAutoStopSettings({
    required int user_id,
    required String email,
    required String authToken,
    required int? updateUserTimeVal,
    required int? updateUserUnitVal,
    required double? updateUserPriceVal,
    required bool updateUserTime_isChecked,
    required bool updateUserUnit_isChecked,
    required bool updateUserPrice_isChecked,
  }) async {
    try {
      final responseJson = await _api.Autostop(
        user_id,
        email,
        authToken,
        updateUserTimeVal ?? 0, // Provide default if null
        updateUserUnitVal ?? 0, // Provide default if null
        updateUserPriceVal?.toInt() ?? 0, // Convert to int if needed
        updateUserTime_isChecked,
        updateUserUnit_isChecked,
        updateUserPrice_isChecked,
      );
      return Updateautostopresponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<Startedatresponse> Startedat(
      int user_id, String email, String authToken, int connector_id, String charger_id, int connector_type) async {
    try {
      final responseJson =
      await _api.fetchstartedat(user_id, email, authToken, connector_id, charger_id, connector_type);
      return Startedatresponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<GenerateChargingBillResponse> generatechargingbill(
      int user_id, String email, String authToken, int connector_id, String charger_id, int connector_type) async {
    try {
      final responseJson =
      await _api.generatechargingbill(user_id, email, authToken, connector_id, charger_id, connector_type);
      return GenerateChargingBillResponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }
}