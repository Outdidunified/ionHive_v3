class EndChargingsessionresponse {
  final bool error;
  final String message;


  EndChargingsessionresponse({
    required this.error,
    required this.message,
  });

  factory EndChargingsessionresponse.fromJson(Map<String, dynamic> json) {
    // Consider "no changes made" as a non-error case
    final isNoChangesError = json['error'] == true &&
        json['message'] == 'No changes made to favorite stations';

    return EndChargingsessionresponse(
      error: isNoChangesError ? false : json['error'] ?? true,
      message: json['message'] ?? "No message",
    );
  }
}

class ChargerStatusData {
  final String chargerId;
  final int connectorId;
  final int connectorType;
  final String chargerStatus;
  final DateTime timestamp;
  final String errorCode;
  final double chargerCapacity;

  ChargerStatusData({
    required this.chargerId,
    required this.connectorId,
    required this.connectorType,
    required this.chargerStatus,
    required this.timestamp,
    required this.errorCode,
    required this.chargerCapacity,
  });

  factory ChargerStatusData.fromJson(Map<String, dynamic> json) {
    return ChargerStatusData(
      chargerId: json['charger_id'] ?? '',
      connectorId: json['connector_id'] ?? 0,
      connectorType: json['connector_type'] ?? 0,
      chargerStatus: json['charger_status'] ?? 'Unknown',
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
      errorCode: json['error_code'] ?? 'NoError',
      chargerCapacity: (json['ChargerCapacity'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class Fetchlaststatusresponse {
  final bool error;
  final String message;
  final ChargerStatusData? data;

  Fetchlaststatusresponse({
    required this.error,
    required this.message,
    required this.data,
  });

  factory Fetchlaststatusresponse.fromJson(Map<String, dynamic> json) {
    return Fetchlaststatusresponse(
      error: json['error'] ?? true,
      message: json['message'] ?? "No message",
      data: json['data'] != null ? ChargerStatusData.fromJson(json['data']) : null,
    );
  }
}