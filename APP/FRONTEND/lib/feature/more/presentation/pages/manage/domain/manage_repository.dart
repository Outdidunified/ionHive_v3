import 'package:ionhive/feature/more/presentation/pages/manage/data/api.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/domain/manage_model.dart';

class Managerepository{
  final Manageapicall _api = Manageapicall();

  Future<Fetchrfidmodel> Fetchrfid(String email,String token) async {
    try {
      final responseJson = await _api.Fetchrfid(email,token);

      return Fetchrfidmodel.fromJson(responseJson); // Parse JSON to model
    } catch (e) {
      rethrow; // Re-throw the error to be handled by the controller
    }
  }

  Future<DeactivateRfid> DeactivateRfidrep(String email, String token ,int userid,String tagid, bool status) async {
    try {
      final responseJson = await _api.DeactivateRfid(email,token,userid,tagid,status);

      return DeactivateRfid.fromJson(responseJson); // Parse JSON to model
    } catch (e) {
      rethrow; // Re-throw the error to be handled by the controller
    }
  }
}