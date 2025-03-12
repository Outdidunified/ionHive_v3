import 'package:ionhive/feature/more/presentation/pages/header/data/api.dart';
import 'package:ionhive/feature/more/presentation/pages/header/domain/models/header_model.dart';

class HeaderRepository {
  final HeaderAPICalls _api = HeaderAPICalls();

  Future<CompleteProfileResponse> CompleteProfile(String username, int user_id,
      String email, int phone_number, String authToken) async {
    try {
      final responseJson = await _api.completeProfile(
          username, user_id, email, phone_number, authToken);

      return CompleteProfileResponse.fromJson(
          responseJson); // Parse JSON to model
    } catch (e) {
      rethrow; // Re-throw the error to be handled by the controller
    }
  }
}
