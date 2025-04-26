import 'package:ionhive/feature/ChargingStation/data/api.dart';
import 'package:ionhive/feature/ChargingStation/domain/models/Chargingstation_model.dart';

class Chargingstationsrepo {
  final CharginStationapicalls _api = CharginStationapicalls();

  Future<Savestationsresponse> savestations(
      int user_id, String email, String authToken, int station_id, bool status) async {
    try {
      final responseJson =
      await _api.savechargingstations(user_id, email, authToken, station_id, status);
      return Savestationsresponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<Removestationsresponse> Removestations(
      int user_id, String email, String authToken, int station_id, bool status) async {
    try {
      final responseJson =
      await _api.removechargingstation(user_id, email, authToken, station_id, status);
      return Removestationsresponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }
}