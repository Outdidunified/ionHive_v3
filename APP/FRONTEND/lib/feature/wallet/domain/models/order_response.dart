class OrderResponse {
  final bool success;
  final Order order;

  OrderResponse({
    required this.success,
    required this.order,
  });

  factory OrderResponse.fromJson(Map<String, dynamic> json) {
    return OrderResponse(
      success: json['success'] ?? false,
      order: Order.fromJson(json['order'] ?? {}),
    );
  }
}

class Order {
  final int amount;
  final int amountDue;
  final int amountPaid;
  final int attempts;
  final int createdAt;
  final String currency;
  final String entity;
  final String id;
  final List<dynamic> notes;
  final String? offerId;
  final String? receipt;
  final String status;

  Order({
    required this.amount,
    required this.amountDue,
    required this.amountPaid,
    required this.attempts,
    required this.createdAt,
    required this.currency,
    required this.entity,
    required this.id,
    required this.notes,
    this.offerId,
    this.receipt,
    required this.status,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      amount: json['amount'] ?? 0,
      amountDue: json['amount_due'] ?? 0,
      amountPaid: json['amount_paid'] ?? 0,
      attempts: json['attempts'] ?? 0,
      createdAt: json['created_at'] ?? 0,
      currency: json['currency'] ?? 'INR',
      entity: json['entity'] ?? '',
      id: json['id'] ?? '',
      notes: json['notes'] ?? [],
      offerId: json['offer_id'],
      receipt: json['receipt'],
      status: json['status'] ?? 'unknown',
    );
  }
}
