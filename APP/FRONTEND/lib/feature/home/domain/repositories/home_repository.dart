import 'package:ionhive/feature/home/data/api.dart';
import 'package:ionhive/feature/home/domain/models/home_model.dart';

class HomeRepository {
  final HomeAPICalls _api = HomeAPICalls();



  Future<Fetchnearbychargersresponse> fetchnearbychargers(
      int user_id, String email, String authToken,double latitude, double longitude) async {
    try {
      final responseJson =
      await _api.fetchnearbystations(user_id, email, authToken,latitude,longitude);
      return Fetchnearbychargersresponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }




}
