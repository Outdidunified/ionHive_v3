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
  final String? message; // Added message property

  FetchAllTransactionResponse({
    required this.error,
    required this.transactions,
    this.message, // Optional message
  });

  factory FetchAllTransactionResponse.fromJson(Map<String, dynamic> json) {
    // Handle the case where 'data' might be null or not a list
    List<Transaction> transactionsList = [];

    if (json['data'] != null) {
      try {
        if (json['data'] is List) {
          transactionsList = (json['data'] as List)
              .map((item) => Transaction.fromJson(item as Map<String, dynamic>))
              .toList();
        } else {
          // Log the unexpected data type
          print("Unexpected data type for 'data': ${json['data'].runtimeType}");
        }
      } catch (e) {
        print("Error parsing transactions: $e");
      }
    }

    return FetchAllTransactionResponse(
      error: json['error'] as bool,
      transactions: transactionsList,
      message: json['message'] as String?, // Extract message if available
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'error': error,
      'data': transactions.map((t) => t.toJson()).toList(),
      'message': message,
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
    int? daysValue;

    if (json['updatedTransactionFilter'] != null) {
      try {
        if (json['updatedTransactionFilter'] is List &&
            (json['updatedTransactionFilter'] as List).isNotEmpty) {
          // Handle updatedTransactionFilter as a list
          daysValue = json['updatedTransactionFilter'][0]['days'] as int?;
        } else if (json['updatedTransactionFilter'] is Map) {
          // Handle updatedTransactionFilter as a map
          final filterMap =
              json['updatedTransactionFilter'] as Map<String, dynamic>;
          if (filterMap.containsKey('days')) {
            daysValue = filterMap['days'] as int?;
          }
        } else {
          // Log the unexpected data type
          print(
              "Unexpected data type for 'updatedTransactionFilter': ${json['updatedTransactionFilter'].runtimeType}");
        }
      } catch (e) {
        print("Error parsing updatedTransactionFilter days: $e");
      }
    }

    return SaveFilterResponse(
      error: json['error'] as bool,
      message: json['message'] as String,
      days: daysValue,
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
    int? daysValue;

    if (json['filter'] != null) {
      try {
        if (json['filter'] is List && (json['filter'] as List).isNotEmpty) {
          // Handle filter as a list
          daysValue = json['filter'][0]['days'] as int?;
        } else if (json['filter'] is Map) {
          // Handle filter as a map
          final filterMap = json['filter'] as Map<String, dynamic>;
          if (filterMap.containsKey('days')) {
            daysValue = filterMap['days'] as int?;
          }
        } else {
          // Log the unexpected data type
          print(
              "Unexpected data type for 'filter': ${json['filter'].runtimeType}");
        }
      } catch (e) {
        print("Error parsing filter days: $e");
      }
    }

    return FetchTransactionFilter(
      error: json['error'] as bool,
      message: json['message'] as String,
      days: daysValue,
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
