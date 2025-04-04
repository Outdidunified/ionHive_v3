class Transaction {
  final String status;
  final double amount;
  final DateTime time;

  Transaction({
    required this.status,
    required this.amount,
    required this.time,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      status: json['status'] as String,
      amount: (json['amount'] as num).toDouble(), // Ensures it's a double
      time: DateTime.parse(json['time']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'status': status,
      'amount': amount,
      'time': time.toIso8601String(),
    };
  }
}

class FetchAllTransactionResponse {
  final bool error;
  final List<Transaction> transactions;

  FetchAllTransactionResponse({
    required this.error,
    required this.transactions,
  });

  factory FetchAllTransactionResponse.fromJson(Map<String, dynamic> json) {
    return FetchAllTransactionResponse(
      error: json['error'] as bool,
      transactions: (json['data'] as List<dynamic>)
          .map((item) => Transaction.fromJson(item))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'error': error,
      'data': transactions.map((t) => t.toJson()).toList(),
    };
  }
}

class SaveFilterResponse {
  final bool error;
  final String message;
  final int? days; // Extracted days value

  SaveFilterResponse({
    required this.error,
    required this.message,
    this.days,
  });

  factory SaveFilterResponse.fromJson(Map<String, dynamic> json) {
    return SaveFilterResponse(
      error: json['error'] as bool,
      message: json['message'] as String,
      days: json['updatedTransactionFilter'] != null
          ? (json['updatedTransactionFilter'] as List).isNotEmpty
          ? json['updatedTransactionFilter'][0]['days'] as int?
          : null
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'error': error,
      'message': message,
      'days': days,
    };
  }
}

class FetchTransactionFilter {
  final bool error;
  final String message;
  final int? days; // Extracted days value

  FetchTransactionFilter({
    required this.error,
    required this.message,
    this.days,
  });

  factory FetchTransactionFilter.fromJson(Map<String, dynamic> json) {
    return FetchTransactionFilter(
      error: json['error'] as bool,
      message: json['message'] as String,
      days: json['filter'] != null && (json['filter'] as List).isNotEmpty
          ? json['filter'][0]['days'] as int?
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'error': error,
      'message': message,
      'days': days,
    };
  }
}


class Clearsavedfilter {
  final bool error; // Updated to match the response structure
  final String message; // Message field

  Clearsavedfilter({
    required this.error,
    required this.message,
  });

  // Factory constructor for creating an instance from JSON
  factory Clearsavedfilter.fromJson(Map<String, dynamic> json) {
    return Clearsavedfilter(
      error: json['error'] as bool, // Parse 'error' field
      message: json['message'] as String, // Parse 'message' field
    );
  }

  // Method to convert the instance back to JSON
  Map<String, dynamic> toJson() {
    return {
      'error': error,
      'message': message,
    };
  }
}



