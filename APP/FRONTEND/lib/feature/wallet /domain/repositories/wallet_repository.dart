import 'package:ionhive/feature/wallet%20/domain/models/wallet_model.dart';
import 'package:ionhive/feature/wallet%20/domain/models/payment_request.dart';
import 'package:ionhive/feature/wallet%20/domain/models/payment_response.dart';
import 'package:ionhive/feature/wallet%20/domain/models/order_response.dart';

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

  Future<PaymentResponse> savePayment(
      PaymentRequest paymentRequest, String authToken) async {
    try {
      final responseJson = await _api.savePayment(paymentRequest, authToken);
      return PaymentResponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<OrderResponse> createOrder(
      {required double amount,
      required String currency,
      required int userId,
      required String authToken}) async {
    try {
      final responseJson =
          await _api.createOrder(amount, currency, userId, authToken);
      return OrderResponse.fromJson(responseJson);
    } catch (e) {
      rethrow;
    }
  }
}
