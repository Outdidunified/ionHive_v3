// DeleteAccountResponse Response Model {DeleteAccount()}
class DeleteAccountResponse {
  final bool error; // Updated to match the response structure
  final String message; // Message field

  DeleteAccountResponse({
    required this.error,
    required this.message,
  });

  // Factory constructor for creating an instance from JSON
  factory DeleteAccountResponse.fromJson(Map<String, dynamic> json) {
    return DeleteAccountResponse(
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
