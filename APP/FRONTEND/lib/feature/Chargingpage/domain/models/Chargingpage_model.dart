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

class MeterValue {
  final double? voltage;
  final double? current;
  final double? power;
  final double? energy;
  final double? frequency;
  final double? powerFactor;

  MeterValue({
    this.voltage,
    this.current,
    this.power,
    this.energy,
    this.frequency,
    this.powerFactor,
  });

  factory MeterValue.fromJson(Map<String, dynamic> json) {
    return MeterValue(
      voltage: double.tryParse(json['value']?.toString() ?? '0'),
      current: double.tryParse(json['value']?.toString() ?? '0'),
      power: double.tryParse(json['value']?.toString() ?? '0'),
      energy: double.tryParse(json['value']?.toString() ?? '0'),
      frequency: double.tryParse(json['value']?.toString() ?? '0'),
      powerFactor: double.tryParse(json['value']?.toString() ?? '0'),
    );
  }
}

class ChargerStatusData {
  final String chargerStatus;
  final double chargerCapacity;
  final String errorCode;
  final DateTime timestamp;
  final String timestampIST; // Change type to String
  final MeterValue? meterValue;

  ChargerStatusData({
    required this.chargerStatus,
    required this.chargerCapacity,
    required this.errorCode,
    required this.timestamp,
    required this.timestampIST, // Updated field name
    this.meterValue,
  });

  factory ChargerStatusData.fromJson(Map<String, dynamic> json) {
    return ChargerStatusData(
      chargerStatus: json['charger_status'],
      chargerCapacity: (json['ChargerCapacity'] ?? 0.0).toDouble(),
      errorCode: json['error_code'] ?? 'NoError',
      timestamp: DateTime.parse(json['timestamp']),
      timestampIST: json['timestamp_IST'] ?? '-', // Treat as String
    );
  }

  ChargerStatusData copyWith({
    String? chargerStatus,
    DateTime? timestamp,
    String? errorCode,
    double? chargerCapacity,
    String? timestampIST,
  }) {
    return ChargerStatusData(
      chargerStatus: chargerStatus ?? this.chargerStatus,
      timestamp: timestamp ?? this.timestamp,
      errorCode: errorCode ?? this.errorCode,
      chargerCapacity: chargerCapacity ?? this.chargerCapacity,
      timestampIST: timestampIST ?? this.timestampIST,
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
      data: json['data'] != null
          ? ChargerStatusData.fromJson(json['data'])
          : null,
    );
  }
}

class StartChargingresponse {
  final bool error;
  final String message;

  StartChargingresponse({
    required this.error,
    required this.message,
  });

  factory StartChargingresponse.fromJson(Map<String, dynamic> json) {
    // Consider "no changes made" as a non-error case
    final isNoChangesError = json['error'] == true &&
        json['message'] == 'No changes made to favorite stations';

    return StartChargingresponse(
      error: isNoChangesError ? false : json['error'] ?? true,
      message: json['message'] ?? "No message",
    );
  }
}

class StopChargingresponse {
  final bool error;
  final String message;

  StopChargingresponse({
    required this.error,
    required this.message,
  });

  factory StopChargingresponse.fromJson(Map<String, dynamic> json) {
    // Consider "no changes made" as a non-error case
    final isNoChangesError = json['error'] == true &&
        json['message'] == 'No changes made to favorite stations';

    return StopChargingresponse(
      error: isNoChangesError ? false : json['error'] ?? true,
      message: json['message'] ?? "No message",
    );
  }
}

class Updateautostopresponse {
  final bool error;
  final String message;

  Updateautostopresponse({
    required this.error,
    required this.message,
  });

  factory Updateautostopresponse.fromJson(Map<String, dynamic> json) {
    // Consider "no changes made" as a non-error case
    final isNoChangesError = json['error'] == true &&
        json['message'] == 'No changes made to favorite stations';

    return Updateautostopresponse(
      error: isNoChangesError ? false : json['error'] ?? true,
      message: json['message'] ?? "No message",
    );
  }
}
