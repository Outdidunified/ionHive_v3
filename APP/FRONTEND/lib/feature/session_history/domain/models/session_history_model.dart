// Response model for total session count (unchanged)
class Fetchtotalsessioncountresponse {
  final bool error;
  final String message;
  final Map<String, dynamic>? totalData;

  Fetchtotalsessioncountresponse({
    required this.error,
    required this.message,
    this.totalData,
  });

  factory Fetchtotalsessioncountresponse.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic> data = {};
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
      error: json['error'] ?? false,
      message: json['message'] ?? "No message",
      totalData: data.isNotEmpty ? data : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'error': error,
      'message': message,
      'totalData': totalData,
    };
  }
}

// Model for session history details (unchanged)
class SessionHistoryDetailsResponse {
  final bool error;
  final String message;
  final List<SessionHistoryItem> sessions;

  SessionHistoryDetailsResponse({
    required this.error,
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
      error: json['error'] ?? false,
      message: json['message'] ?? "No message",
      sessions: sessionsList,
    );
  }
}

// Model for individual session history item (updated to include all fees and modified_date)
class SessionHistoryItem {
  final String id;
  final String chargerId;
  final String sessionId;
  final String stop_reason;
  final DateTime startTime;
  final DateTime? stopTime;
  final double unitConsumed;
  final double price;
  final int? connectorId;
  final int? connectorType;
  final double ebFee;
  final double associationCommission;
  final double clientCommission;
  final double convenienceFee;
  final double gstAmount;
  final double gstPercentage;
  final double parkingFee;
  final double processingFee;
  final double resellerCommission;
  final double serviceFee;
  final double stationFee;
  final DateTime? modifiedDate;

  SessionHistoryItem({
    required this.id,
    required this.chargerId,
    required this.sessionId,
    required this.stop_reason,
    required this.startTime,
    this.stopTime,
    required this.unitConsumed,
    required this.price,
    this.connectorId,
    this.connectorType,
    required this.ebFee,
    required this.associationCommission,
    required this.clientCommission,
    required this.convenienceFee,
    required this.gstAmount,
    required this.gstPercentage,
    required this.parkingFee,
    required this.processingFee,
    required this.resellerCommission,
    required this.serviceFee,
    required this.stationFee,
    this.modifiedDate,
  });

  factory SessionHistoryItem.fromJson(Map<String, dynamic> json) {
    return SessionHistoryItem(
      id: json['_id'] ?? '',
      chargerId: json['charger_id'] ?? '',
      sessionId: json['session_id']?.toString() ?? '',
      stop_reason: json['stop_reason']?.toString() ?? '',
      startTime: json['start_time'] != null
          ? DateTime.parse(json['start_time'])
          : DateTime.now(),
      stopTime:
      json['stop_time'] != null ? DateTime.parse(json['stop_time']) : null,
      unitConsumed: json['unit_consummed'] != null
          ? double.parse(json['unit_consummed'].toString())
          : 0.0,
      price:
      json['price'] != null ? double.parse(json['price'].toString()) : 0.0,
      connectorId: json['connector_id'],
      connectorType: json['connector_type'],
      ebFee: json['EB_fee'] != null
          ? double.parse(json['EB_fee'].toString())
          : 0.0,
      associationCommission: json['association_commission'] != null
          ? double.parse(json['association_commission'].toString())
          : 0.0,
      clientCommission: json['client_commission'] != null
          ? double.parse(json['client_commission'].toString())
          : 0.0,
      convenienceFee: json['convenience_fee'] != null
          ? double.parse(json['convenience_fee'].toString())
          : 0.0,
      gstAmount: json['gst_amount'] != null
          ? double.parse(json['gst_amount'].toString())
          : 0.0,
      gstPercentage: json['gst_percentage'] != null
          ? double.parse(json['gst_percentage'].toString())
          : 0.0,
      parkingFee: json['parking_fee'] != null
          ? double.parse(json['parking_fee'].toString())
          : 0.0,
      processingFee: json['processing_fee'] != null
          ? double.parse(json['processing_fee'].toString())
          : 0.0,
      resellerCommission: json['reseller_commission'] != null
          ? double.parse(json['reseller_commission'].toString())
          : 0.0,
      serviceFee: json['service_fee'] != null
          ? double.parse(json['service_fee'].toString())
          : 0.0,
      stationFee: json['station_fee'] != null
          ? double.parse(json['station_fee'].toString())
          : 0.0,
      modifiedDate: json['modified_date'] != null
          ? DateTime.parse(json['modified_date'])
          : null,
    );
  }
}

