import 'package:ionhive/feature/more/presentation/pages/account/data/api.dart';
import 'package:ionhive/feature/more/presentation/pages/account/domain/models/account_model.dart';

class AccountRepository {
  final AccountAPICalls _api = AccountAPICalls();

  Future<DeleteAccountResponse> DeleteAccount(
      String email, String reason, int userId, String authToken) async {
    try {
      final responseJson =
          await _api.DeleteAccount(email, reason, userId, authToken);

      return DeleteAccountResponse.fromJson(
          responseJson); // Parse JSON to model
    } catch (e) {
      rethrow; // Re-throw the error to be handled by the controller
    }
  }
}
