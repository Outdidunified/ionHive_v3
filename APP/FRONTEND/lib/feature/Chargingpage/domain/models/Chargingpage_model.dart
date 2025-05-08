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
  final String timestampIST;
  final MeterValue? meterValue;

  // Auto-stop settings fields
  final int? autostopTime;
  final bool autostopTimeIsChecked;
  final int? autostopUnit;
  final bool autostopUnitIsChecked;
  final double? autostopPrice;
  final bool autostopPriceIsChecked;

  ChargerStatusData({
    required this.chargerStatus,
    required this.chargerCapacity,
    required this.errorCode,
    required this.timestamp,
    required this.timestampIST,
    this.meterValue,
    this.autostopTime,
    this.autostopTimeIsChecked = false,
    this.autostopUnit,
    this.autostopUnitIsChecked = false,
    this.autostopPrice,
    this.autostopPriceIsChecked = false,
  });

  factory ChargerStatusData.fromJson(Map<String, dynamic> json) {
    return ChargerStatusData(
      chargerStatus: json['charger_status'],
      chargerCapacity: (json['ChargerCapacity'] ?? 0.0).toDouble(),
      errorCode: json['error_code'] ?? 'NoError',
      timestamp: DateTime.parse(json['timestamp']),
      timestampIST: json['timestamp_IST'] ?? '-',
      autostopTime: json['autostop_time'] != null ? int.tryParse(json['autostop_time'].toString()) : null,
      autostopTimeIsChecked: json['autostop_time_is_checked'] ?? false,
      autostopUnit: json['autostop_unit'] != null ? int.tryParse(json['autostop_unit'].toString()) : null,
      autostopUnitIsChecked: json['autostop_unit_is_checked'] ?? false,
      autostopPrice: json['autostop_price'] != null ? double.tryParse(json['autostop_price'].toString()) : null,
      autostopPriceIsChecked: json['autostop_price_is_checked'] ?? false,
    );
  }

  ChargerStatusData copyWith({
    String? chargerStatus,
    double? chargerCapacity,
    String? errorCode,
    DateTime? timestamp,
    String? timestampIST,
    MeterValue? meterValue,
    int? autostopTime,
    bool? autostopTimeIsChecked,
    int? autostopUnit,
    bool? autostopUnitIsChecked,
    double? autostopPrice,
    bool? autostopPriceIsChecked,
  }) {
    return ChargerStatusData(
      chargerStatus: chargerStatus ?? this.chargerStatus,
      chargerCapacity: chargerCapacity ?? this.chargerCapacity,
      errorCode: errorCode ?? this.errorCode,
      timestamp: timestamp ?? this.timestamp,
      timestampIST: timestampIST ?? this.timestampIST,
      meterValue: meterValue ?? this.meterValue,
      autostopTime: autostopTime ?? this.autostopTime,
      autostopTimeIsChecked: autostopTimeIsChecked ?? this.autostopTimeIsChecked,
      autostopUnit: autostopUnit ?? this.autostopUnit,
      autostopUnitIsChecked: autostopUnitIsChecked ?? this.autostopUnitIsChecked,
      autostopPrice: autostopPrice ?? this.autostopPrice,
      autostopPriceIsChecked: autostopPriceIsChecked ?? this.autostopPriceIsChecked,
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

class Startedatresponse {
  final bool error;
  final String message;
  final String? data; // Added to hold the timestamp

  Startedatresponse({
    required this.error,
    required this.message,
    this.data,
  });

  factory Startedatresponse.fromJson(Map<String, dynamic> json) {
    final isNoChangesError = json['error'] == true &&
        json['message'] == 'No changes made to favorite stations';

    return Startedatresponse(
      error: isNoChangesError ? false : json['error'] ?? true,
      message: json['message'] ?? "No message",
      data: json['data'], // Parse the data field
    );
  }
}