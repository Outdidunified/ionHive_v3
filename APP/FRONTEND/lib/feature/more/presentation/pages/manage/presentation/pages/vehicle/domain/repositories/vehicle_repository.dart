import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/data/api.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/domain/models/vehicle_model.dart';

class VehicleRepository{
  final VehicleApicalls _api = VehicleApicalls();

  Future<FetchSavedVehicle> fetchsavedvehicle(int user_id, String email, String authToken) async {
    try {
      final responseJson = await _api.fetchsavedvehicle(user_id, email, authToken);
      return FetchSavedVehicle.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<GetAllVehicleModel> fetchvehiclemodel(String authToken) async {
    try {
      final responseJson = await _api.fetchvehiclemodel(authToken);
      print(' rep: $GetAllVehicleModel.fromJson(responseJson)');
      return GetAllVehicleModel.fromJson(responseJson);

    } catch (e) {
      print("Repository error in fetchvehiclemodel: $e");
      rethrow;
    }
  }

}
