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
      autostopTime: json['autostop_time'] != null
          ? int.tryParse(json['autostop_time'].toString())
          : null,
      autostopTimeIsChecked: json['autostop_time_is_checked'] ?? false,
      autostopUnit: json['autostop_unit'] != null
          ? int.tryParse(json['autostop_unit'].toString())
          : null,
      autostopUnitIsChecked: json['autostop_unit_is_checked'] ?? false,
      autostopPrice: json['autostop_price'] != null
          ? double.tryParse(json['autostop_price'].toString())
          : null,
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
      autostopTimeIsChecked:
          autostopTimeIsChecked ?? this.autostopTimeIsChecked,
      autostopUnit: autostopUnit ?? this.autostopUnit,
      autostopUnitIsChecked:
          autostopUnitIsChecked ?? this.autostopUnitIsChecked,
      autostopPrice: autostopPrice ?? this.autostopPrice,
      autostopPriceIsChecked:
          autostopPriceIsChecked ?? this.autostopPriceIsChecked,
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

class ChargingSession {
  final String id;
  final String chargerId;
  final int connectorId;
  final String startTime;
  final String stopTime;
  final double unitConsumed;
  final double price;
  final double unitPrice;
  final String emailId;
  final int sessionId;
  final int connectorType;
  final String errorCode;
  final String location;
  final String createdDate;
  final String stop_reason;
  final String status;
  final double ebFee;
  final double station_fee;
  final double client_commission;
  final double convenience_fee;
  final double gst_amount;
  final double gst_percentage;
  final double parking_fee;
  final double processing_fee;
  final double reseller_commission;
  final double service_fee;
  final double association_commission; // Added association_commission

  ChargingSession({
    required this.id,
    required this.chargerId,
    required this.connectorId,
    required this.startTime,
    required this.stopTime,
    required this.unitConsumed,
    required this.price,
    required this.unitPrice,
    required this.stop_reason,
    required this.emailId,
    required this.sessionId,
    required this.connectorType,
    required this.errorCode,
    required this.location,
    required this.createdDate,
    required this.status,
    required this.ebFee,
    required this.client_commission,
    required this.convenience_fee,
    required this.gst_amount,
    required this.gst_percentage,
    required this.parking_fee,
    required this.processing_fee,
    required this.reseller_commission,
    required this.service_fee,
    required this.station_fee,
    required this.association_commission, // Added association_commission
  });

  factory ChargingSession.fromJson(Map<String, dynamic> json) {
    return ChargingSession(
      id: json['_id']?.toString() ?? '',
      chargerId: json['charger_id']?.toString() ?? '',
      connectorId:
          num.tryParse(json['connector_id']?.toString() ?? '0')?.toInt() ?? 0,
      stop_reason: json['stop_reason']?.toString() ?? '',
      startTime: json['start_time']?.toString() ?? '',
      stopTime: json['stop_time']?.toString() ?? '',
      unitConsumed:
          num.tryParse(json['unit_consummed']?.toString() ?? '0')?.toDouble() ??
              0.0,
      price: num.tryParse(json['price']?.toString() ?? '0')?.toDouble() ?? 0.0,
      unitPrice:
          num.tryParse(json['unit_price']?.toString() ?? '0')?.toDouble() ??
              0.0,
      emailId: json['email_id']?.toString() ?? '',
      sessionId:
          num.tryParse(json['session_id']?.toString() ?? '0')?.toInt() ?? 0,
      connectorType:
          num.tryParse(json['connector_type']?.toString() ?? '0')?.toInt() ?? 0,
      errorCode: json['error_code']?.toString() ?? 'NoError',
      location: json['location']?.toString() ?? '',
      createdDate: json['created_date']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      ebFee: num.tryParse(json['EB_fee']?.toString() ?? '0')?.toDouble() ?? 0.0,
      client_commission:
          num.tryParse(json['client_commission']?.toString() ?? '0')
                  ?.toDouble() ??
              0.0,
      convenience_fee: num.tryParse(json['convenience_fee']?.toString() ?? '0')
              ?.toDouble() ??
          0.0,
      gst_amount:
          num.tryParse(json['gst_amount']?.toString() ?? '0')?.toDouble() ??
              0.0,
      gst_percentage:
          num.tryParse(json['gst_percentage']?.toString() ?? '0')?.toDouble() ??
              0.0,
      parking_fee:
          num.tryParse(json['parking_fee']?.toString() ?? '0')?.toDouble() ??
              0.0,
      processing_fee:
          num.tryParse(json['processing_fee']?.toString() ?? '0')?.toDouble() ??
              0.0,
      reseller_commission:
          num.tryParse(json['reseller_commission']?.toString() ?? '0')
                  ?.toDouble() ??
              0.0,
      service_fee:
          num.tryParse(json['service_fee']?.toString() ?? '0')?.toDouble() ??
              0.0,
      station_fee:
          num.tryParse(json['station_fee']?.toString() ?? '0')?.toDouble() ??
              0.0,
      association_commission:
          num.tryParse(json['association_commission']?.toString() ?? '0')
                  ?.toDouble() ??
              0.0, // Added association_commission parsing
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'charger_id': chargerId,
      'connector_id': connectorId,
      'start_time': startTime,
      'stop_time': stopTime,
      'unit_consummed': unitConsumed,
      'price': price,
      'unit_price': unitPrice,
      'email_id': emailId,
      'session_id': sessionId,
      'connector_type': connectorType,
      'error_code': errorCode,
      'location': location,
      'created_date': createdDate,
      'status': status,
      'stop_reason': stop_reason,
      'EB_fee': ebFee,
      'client_commission': client_commission,
      'convenience_fee': convenience_fee,
      'gst_amount': gst_amount,
      'gst_percentage': gst_percentage,
      'parking_fee': parking_fee,
      'processing_fee': processing_fee,
      'reseller_commission': reseller_commission,
      'service_fee': service_fee,
      'station_fee': station_fee,
      'association_commission':
          association_commission, // Added association_commission
    };
  }
}

class User {
  final String id;
  final int roleId;
  final String? resellerId;
  final String? clientId;
  final String? associationId;
  final int userId;
  final String username;
  final String phoneNo;
  final String emailId;
  final double walletBal;
  final double autostopPrice;
  final bool autostopPriceIsChecked;
  final int autostopTime;
  final bool autostopTimeIsChecked;
  final int autostopUnit;
  final bool autostopUnitIsChecked;
  final int tagId;
  final int assignedAssociation;
  final String createdBy;
  final String createdDate;

  User({
    required this.id,
    required this.roleId,
    this.resellerId,
    this.clientId,
    this.associationId,
    required this.userId,
    required this.username,
    required this.phoneNo,
    required this.emailId,
    required this.walletBal,
    required this.autostopPrice,
    required this.autostopPriceIsChecked,
    required this.autostopTime,
    required this.autostopTimeIsChecked,
    required this.autostopUnit,
    required this.autostopUnitIsChecked,
    required this.tagId,
    required this.assignedAssociation,
    required this.createdBy,
    required this.createdDate,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id']?.toString() ?? '',
      roleId: num.tryParse(json['role_id']?.toString() ?? '0')?.toInt() ?? 0,
      resellerId: json['reseller_id']?.toString(),
      clientId: json['client_id']?.toString(),
      associationId: json['association_id']?.toString(),
      userId: num.tryParse(json['user_id']?.toString() ?? '0')?.toInt() ?? 0,
      username: json['username']?.toString() ?? '',
      phoneNo: json['phone_no']?.toString() ?? '',
      emailId: json['email_id']?.toString() ?? '',
      walletBal:
          num.tryParse(json['wallet_bal']?.toString() ?? '0')?.toDouble() ??
              0.0,
      autostopPrice:
          num.tryParse(json['autostop_price']?.toString() ?? '0')?.toDouble() ??
              0.0,
      autostopPriceIsChecked: json['autostop_price_is_checked'] ?? false,
      autostopTime:
          num.tryParse(json['autostop_time']?.toString() ?? '0')?.toInt() ?? 0,
      autostopTimeIsChecked: json['autostop_time_is_checked'] ?? false,
      autostopUnit:
          num.tryParse(json['autostop_unit']?.toString() ?? '0')?.toInt() ?? 0,
      autostopUnitIsChecked: json['autostop_unit_is_checked'] ?? false,
      tagId: num.tryParse(json['tag_id']?.toString() ?? '0')?.toInt() ?? 0,
      assignedAssociation:
          num.tryParse(json['assigned_association']?.toString() ?? '0')
                  ?.toInt() ??
              0,
      createdBy: json['created_by']?.toString() ?? '',
      createdDate: json['created_date']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'role_id': roleId,
      'reseller_id': resellerId,
      'client_id': clientId,
      'association_id': associationId,
      'user_id': userId,
      'username': username,
      'phone_no': phoneNo,
      'email_id': emailId,
      'wallet_bal': walletBal,
      'autostop_price': autostopPrice,
      'autostop_price_is_checked': autostopPriceIsChecked,
      'autostop_time': autostopTime,
      'autostop_time_is_checked': autostopTimeIsChecked,
      'autostop_unit': autostopUnit,
      'autostop_unit_is_checked': autostopUnitIsChecked,
      'tag_id': tagId,
      'assigned_association': assignedAssociation,
      'created_by': createdBy,
      'created_date': createdDate,
    };
  }
}

class GenerateChargingBillResponse {
  final bool error;
  final String message;
  final Map<String, dynamic>? data;
  final ChargingSession? chargingSession;
  final User? user;

  GenerateChargingBillResponse({
    required this.error,
    required this.message,
    this.data,
    this.chargingSession,
    this.user,
  });

  factory GenerateChargingBillResponse.fromJson(Map<String, dynamic> json) {
    final isNoChangesError = json['error'] == true &&
        json['message'] == 'No changes made to favorite stations';

    final data = json['data'] as Map<String, dynamic>?;
    ChargingSession? chargingSession;
    User? user;

    if (data != null) {
      if (data['chargingSession'] != null) {
        chargingSession = ChargingSession.fromJson(data['chargingSession']);
      }
      if (data['user'] != null) {
        user = User.fromJson(data['user']);
      }
    }

    return GenerateChargingBillResponse(
      error: isNoChangesError ? false : json['error'] ?? true,
      message: json['message']?.toString() ?? "No message",
      data: data,
      chargingSession: chargingSession,
      user: user,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'error': error,
      'message': message,
      'data': data,
      'chargingSession': chargingSession?.toJson(),
      'user': user?.toJson(),
    };
  }
}
