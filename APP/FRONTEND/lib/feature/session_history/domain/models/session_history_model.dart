class Fetchtotalsessioncountresponse {
  final bool success;
  final String message;
  final Map<String, dynamic>? totalData; // Store the session data

  Fetchtotalsessioncountresponse({
    required this.success,
    required this.message,
    this.totalData,
  });

  factory Fetchtotalsessioncountresponse.fromJson(Map<String, dynamic> json) {
    // Based on the API response format: {error: false, message: Total charging session data retrieved successfully., totalChargingTimeInHours: 102.50, totalSessions: 10, totalEnergyConsumed: 29.60}

    // Map root-level fields to totalData
    final Map<String, dynamic> data = {};

    // Extract the data fields from the response
    if (json.containsKey('totalSessions')) {
      data['totalSessions'] = json['totalSessions'];
    }

    if (json.containsKey('totalEnergyConsumed')) {
      data['totalEnergyConsumed'] = json['totalEnergyConsumed'];
    }

    if (json.containsKey('totalChargingTimeInHours')) {
      data['totalChargingTimeInHours'] = json['totalChargingTimeInHours'];
    }

    return Fetchtotalsessioncountresponse(
      success: json['error'] == false,
      message: json['message'] ?? "No message",
      totalData: data.isNotEmpty ? data : null, // Only set if data exists
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'totalData': totalData,
    };
  }
}

// Model for session history details
class SessionHistoryDetailsResponse {
  final bool success;
  final String message;
  final List<SessionHistoryItem> sessions;

  SessionHistoryDetailsResponse({
    required this.success,
    required this.message,
    required this.sessions,
  });

  factory SessionHistoryDetailsResponse.fromJson(Map<String, dynamic> json) {
    final sessionsList = <SessionHistoryItem>[];

    if (json['data'] != null && json['data'] is List) {
      sessionsList.addAll(
        (json['data'] as List).map(
              (item) => SessionHistoryItem.fromJson(item),
        ),
      );
    }

    return SessionHistoryDetailsResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? "No message",
      sessions: sessionsList,
    );
  }
}

class SessionHistoryItem {
  final String id;
  final String chargerId;
  final String sessionId;
  final DateTime startTime;
  final DateTime? stopTime;
  final double unitConsumed;
  final double price;

  SessionHistoryItem({
    required this.id,
    required this.chargerId,
    required this.sessionId,
    required this.startTime,
    this.stopTime,
    required this.unitConsumed,
    required this.price,
  });

  factory SessionHistoryItem.fromJson(Map<String, dynamic> json) {
    return SessionHistoryItem(
      id: json['_id'] ?? '',
      chargerId: json['charger_id'] ?? '',
      sessionId: json['session_id']?.toString() ?? '',
      startTime: json['start_time'] != null
          ? DateTime.parse(json['start_time'])
          : DateTime.now(),
      stopTime: json['stop_time'] != null
          ? DateTime.parse(json['stop_time'])
          : null,
      unitConsumed: json['unit_consummed'] != null
          ? double.parse(json['unit_consummed'].toString())
          : 0.0,
      price: json['price'] != null
          ? double.parse(json['price'].toString())
          : 0.0,
    );
  }
}
