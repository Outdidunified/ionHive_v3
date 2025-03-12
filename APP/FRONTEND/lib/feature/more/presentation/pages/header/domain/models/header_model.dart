// GET OTP Response Model {handleGetOTP()}
class CompleteProfileResponse {
  final bool error; // Updated to match the response structure
  final String message; // Message field

  CompleteProfileResponse({
    required this.error,
    required this.message,
  });

  // Factory constructor for creating an instance from JSON
  factory CompleteProfileResponse.fromJson(Map<String, dynamic> json) {
    return CompleteProfileResponse(
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
