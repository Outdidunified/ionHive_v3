class PaymentResponse {
  final bool error;
  final String message;

  PaymentResponse({
    required this.error,
    required this.message,
  });

  factory PaymentResponse.fromJson(Map<String, dynamic> json) {
    return PaymentResponse(
      error: json['error'] ?? true,
      message: json['message'] ?? 'Unknown response',
    );
  }
}
