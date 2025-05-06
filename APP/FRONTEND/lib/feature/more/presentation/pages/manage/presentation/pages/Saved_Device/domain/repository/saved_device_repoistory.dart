import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/Saved_Device/data/api.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/presentation/pages/Saved_Device/domain/model/saved_device_model.dart';

class SavedDeviceRepoistory {
  final Saveddeviceapicalls _api = Saveddeviceapicalls();

  Future<Fetchsaveddevicemodel> fetchprofile(int user_id, String email, String authToken) async {
    try {
      final responseJson = await _api.fetchsaveddevice(user_id, email, authToken);
      return Fetchsaveddevicemodel.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }


}
