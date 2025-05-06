class PaymentRequest {
  final String emailId;
  final int userId;
  final double rechargeAmount;
  final String transactionId;
  final String responseCode;
  final String dateTime;
  final String paymentMethod;

  PaymentRequest({
    required this.emailId,
    required this.userId,
    required this.rechargeAmount,
    required this.transactionId,
    required this.responseCode,
    required this.dateTime,
    required this.paymentMethod,
  });

  Map<String, dynamic> toJson() {
    return {
      'email_id': emailId,
      'user_id': userId,
      'RechargeAmt': rechargeAmount,
      'transactionId': transactionId,
      'responseCode': responseCode,
      'date_time': dateTime,
      'paymentMethod': paymentMethod,
    };
  }
}
