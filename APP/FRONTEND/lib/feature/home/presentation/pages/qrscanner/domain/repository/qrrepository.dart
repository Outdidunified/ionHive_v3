import 'package:ionhive/feature/home/presentation/pages/qrscanner/data/api.dart';
import 'package:ionhive/feature/home/presentation/pages/qrscanner/domain/model/qrmodel.dart';

class Qrscannerrepo {
  final QRScannerapicalls _api = QRScannerapicalls();



  Future<FetchSpecificQrChargerResponse> fetchconnectors(
      int user_id, String email, String authToken, String charger_id) async {
    try {
      final responseJson =
      await _api.getconnectorsforchargerid(user_id, email, authToken,charger_id);
      return FetchSpecificQrChargerResponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<Updateconnectorwithchargerid> updateconnectorstocharging(
      int user_id, String email, String authToken, String charger_id,int connector_id) async {
    try {
      final responseJson =
      await _api.updateconnectorwithchargerid(user_id, email, authToken,charger_id,connector_id);
      return Updateconnectorwithchargerid.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

}