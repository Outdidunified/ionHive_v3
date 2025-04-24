class Fetchrfidmodel {
  final bool error;
  final dynamic message; // Can be String or Map<String, dynamic>

  Fetchrfidmodel({
    required this.error,
    required this.message,
  });

  // Factory constructor for creating an instance from JSON
  factory Fetchrfidmodel.fromJson(Map<String, dynamic> json) {
    return Fetchrfidmodel(
      error: json['error'] as bool,
      message: json['message'], // Keep it dynamic (can be String or Map)
    );
  }

  // Method to convert the instance back to JSON
  Map<String, dynamic> toJson() {
    return {
      'error': error,
      'message': message, // No change needed
    };
  }
}

class DeactivateRfid {
  final bool error;
  final dynamic message; // Can be String or Map<String, dynamic>

  DeactivateRfid({
    required this.error,
    required this.message,
  });

  // Factory constructor for creating an instance from JSON
  factory DeactivateRfid.fromJson(Map<String, dynamic> json) {
    return DeactivateRfid(
      error: json['error'] as bool,
      message: json['message'], // Keep it dynamic (can be String or Map)
    );
  }

  // Method to convert the instance back to JSON
  Map<String, dynamic> toJson() {
    return {
      'error': error,
      'message': message, // No change needed
    };
  }
}
