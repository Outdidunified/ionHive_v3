class Fetchsavedstationmodel {
  final bool success;
  final String message;
  final List<Map<String, dynamic>>? savedstation; // Updated to List

  Fetchsavedstationmodel({
    required this.success,
    required this.message,
    this.savedstation, // Optional list of charger details
  });

  factory Fetchsavedstationmodel.fromJson(Map<String, dynamic> json) {
    return Fetchsavedstationmodel(
      success: json['error'] == false, // Map 'error' to 'success'
      message: json['message'] ?? "No message",
      savedstation: (json['favStations'] as List<dynamic>?)?.map((item) => item as Map<String, dynamic>).toList(), // Cast list of maps
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'favChargersDetails': savedstation,
    };
  }
}