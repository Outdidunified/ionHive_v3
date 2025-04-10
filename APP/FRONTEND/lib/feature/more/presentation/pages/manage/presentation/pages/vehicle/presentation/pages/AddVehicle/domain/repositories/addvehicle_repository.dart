
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/AddVehicle/data/api.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/AddVehicle/domain/model/addvehicle_model.dart';

class AddVehicleRepository{
  final AddVehicleApicalls _api = AddVehicleApicalls();



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
