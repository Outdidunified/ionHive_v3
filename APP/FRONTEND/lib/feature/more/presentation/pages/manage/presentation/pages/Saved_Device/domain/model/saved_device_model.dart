class Fetchsaveddevicemodel {
  final bool success;
  final String message;
  final Map<String, dynamic>? saveddevice; // Add this to store profile data

  Fetchsaveddevicemodel({
    required this.success,
    required this.message,
    this.saveddevice, // Optional profile data
  });

  factory Fetchsaveddevicemodel.fromJson(Map<String, dynamic> json) {
    return Fetchsaveddevicemodel(
      success: json['error'] == false, // Map 'error' to 'success'
      message: json['message'] ?? "No message",
      saveddevice: json['data'] as Map<String, dynamic>?, // Map 'data' to 'profile'
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'profile': saveddevice,
    };
  }
}