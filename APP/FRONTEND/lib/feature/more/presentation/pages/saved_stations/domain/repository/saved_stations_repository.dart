import 'package:ionhive/feature/more/presentation/pages/saved_stations/data/api.dart';
import 'package:ionhive/feature/more/presentation/pages/saved_stations/domain/model/saved_stations_model.dart';

class SavedStationsRepository {
  final Savedstationapicalls _api = Savedstationapicalls();

  Future<Fetchsavedstationmodel> fetchsavedstations(
      int user_id, String email, String authToken) async {
    try {
      final responseJson =
          await _api.fetchsavedstations(user_id, email, authToken);
      return Fetchsavedstationmodel.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }
}
