import 'package:flutter/foundation.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/AddVehicle/data/api.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/vehicle/presentation/pages/AddVehicle/domain/model/addvehicle_model.dart';

class AddVehicleRepository {
  final AddVehicleApicalls _api = AddVehicleApicalls();

  Future<GetAllVehicleModel> fetchvehiclemodel(String authToken,String emailid,int userid) async {
    try {
      final responseJson = await _api.fetchvehiclemodel(authToken,emailid,userid);
      return GetAllVehicleModel.fromJson(responseJson);
    } catch (e) {
      debugPrint("Repository error in fetchvehiclemodel: $e");
      rethrow;
    }
  }

  Future<AddVehicleResponse> addVehicleRepo({
    required String authToken,
    required int userId,
    required String emailId,
    required String vehicleNumber,
    required int vehicleId,
  }) async {
    try {
      final responseJson = await _api.addVehicleNumber(
        authToken: authToken,
        userId: userId,
        emailId: emailId,
        vehicleNumber: vehicleNumber,
        vehicleId: vehicleId,
      );
      return AddVehicleResponse.fromJson(responseJson);
    } catch (e) {
      debugPrint("Repository error in addVehicleRepo: $e");
      rethrow;
    }
  }
}
