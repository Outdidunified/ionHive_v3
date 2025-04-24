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

  Future<Removevehicleresponse> removevehiclerep(int user_id, String email, String authToken,int vehicle_id,String vehicleNumber) async {
    try {
      final responseJson = await _api.removovevehicle(user_id, email, authToken,vehicle_id,vehicleNumber);
      return Removevehicleresponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }



}
