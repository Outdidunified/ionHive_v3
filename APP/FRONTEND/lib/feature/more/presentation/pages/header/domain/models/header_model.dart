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

class FetchResponseModel {
  final bool success;
  final String message;
  final Map<String, dynamic>? profile; // Add this to store profile data

  FetchResponseModel({
    required this.success,
    required this.message,
    this.profile, // Optional profile data
  });

  factory FetchResponseModel.fromJson(Map<String, dynamic> json) {
    return FetchResponseModel(
      success: json['error'] == false, // Map 'error' to 'success'
      message: json['message'] ?? "No message",
      profile: json['data'] as Map<String, dynamic>?, // Map 'data' to 'profile'
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'profile': profile,
    };
  }
}

class FetchwalletbalanceModel {
  final bool error;
  final double? walletBalance;
  final String? message;

  FetchwalletbalanceModel({
    required this.error,
    this.walletBalance,
    this.message,
  });

  factory FetchwalletbalanceModel.fromJson(Map<String, dynamic> json) {
    // Extract the nested 'data' object
    final data = json['data'] as Map<String, dynamic>?;

    return FetchwalletbalanceModel(
      error: json['error'] as bool,
      // Ensure wallet_balance is parsed correctly as a double
      walletBalance: data != null && data['wallet_balance'] != null
          ? double.tryParse(data['wallet_balance'].toString()) ?? 0.0
          : 0.0,
      message: json['message'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'error': error,
      'data': {
        'wallet_balance': walletBalance ?? 0.0, // Ensure it always returns a valid double
      },
      'message': message,
    };
  }
}


class FetchSessionModel {
  final bool error;
  final int? totalSessions;
  final double? totalChargingTimeInHours;
  final double? totalEnergyConsumed;
  final String? message;

  FetchSessionModel({
    required this.error,
    this.totalSessions,
    this.totalChargingTimeInHours,
    this.totalEnergyConsumed,
    this.message,
  });

  factory FetchSessionModel.fromJson(Map<String, dynamic> json) {
    return FetchSessionModel(
      error: json['error'] as bool,
      totalSessions: json['totalSessions'] != null
          ? int.tryParse(json['totalSessions'].toString())
          : 0,
      totalChargingTimeInHours: json['totalChargingTimeInHours'] != null
          ? double.tryParse(json['totalChargingTimeInHours'].toString())
          : 0.0,
      totalEnergyConsumed: json['totalEnergyConsumed'] != null
          ? double.tryParse(json['totalEnergyConsumed'].toString())
          : 0.0,
      message: json['message'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'error': error,
      'totalSessions': totalSessions ?? 0,
      'totalChargingTimeInHours': totalChargingTimeInHours ?? 0.0,
      'totalEnergyConsumed': totalEnergyConsumed ?? 0.0,
      'message': message,
    };
  }
}




