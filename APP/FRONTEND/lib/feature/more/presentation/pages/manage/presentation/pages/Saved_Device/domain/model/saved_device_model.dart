class Fetchsaveddevicemodel {
  final bool success;
  final String message;
  final List<Map<String, dynamic>>? saveddevice; // Updated to List

  Fetchsaveddevicemodel({
    required this.success,
    required this.message,
    this.saveddevice, // Optional list of charger details
  });

  factory Fetchsaveddevicemodel.fromJson(Map<String, dynamic> json) {
    return Fetchsaveddevicemodel(
      success: json['error'] == false, // Map 'error' to 'success'
      message: json['message'] ?? "No message",
      saveddevice: (json['favChargersDetails'] as List<dynamic>?)?.map((item) => item as Map<String, dynamic>).toList(), // Cast list of maps
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'favChargersDetails': saveddevice,
    };
  }
}