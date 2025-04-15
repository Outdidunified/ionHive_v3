

import 'package:ionhive/feature/wallet%20/domain/models/wallet_model.dart';

import '../../data/api.dart';

class WalletRepository {
  final WalletAPICalls _api = WalletAPICalls();

  Future<FetchwalletbalanceModel> fetchwalletbalance(
      int user_id, String email, String authToken) async {
    try {
      final responseJson =
          await _api.fetchwalletblanace(user_id, email, authToken);
      return FetchwalletbalanceModel.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }
}
