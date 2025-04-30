class Connector {
  final int connectorId;
  final int connectorType;
  final String connectorTypeName;
  final String chargerStatus;

  Connector({
    required this.connectorId,
    required this.connectorType,
    required this.connectorTypeName,
    required this.chargerStatus,
  });

  factory Connector.fromJson(Map<String, dynamic> json) {
    return Connector(
      connectorId: json['connector_id'],
      connectorType: json['connector_type'],
      connectorTypeName: json['connector_type_name'],
      chargerStatus: json['charger_status'],
    );
  }

  Map<String, dynamic> toJson() => {
        'connector_id': connectorId,
        'connector_type': connectorType,
        'connector_type_name': connectorTypeName,
        'charger_status': chargerStatus,
      };
}

class Charger {
  final String chargerId;
  final String model;
  final String type;
  final List<Connector> connectors;
  final String vendor;
  final String charger_type;
  final int max_power;
  final String address;
  final bool status;

  Charger({
    required this.chargerId,
    required this.model,
    required this.type,
    required this.connectors,
    required this.vendor,
    required this.charger_type,
    required this.max_power,
    required this.address,
    required this.status,
  });

  factory Charger.fromJson(Map<String, dynamic> json) {
    return Charger(
      chargerId: json['charger_id'],
      model: json['model'],
      type: json['type'],
      connectors: (json['connectors'] as List<dynamic>)
          .map((e) => Connector.fromJson(e))
          .toList(),
      vendor: json['vendor'],
      charger_type: json['charger_type'],
      max_power: json['max_power'],
      address: json['address'],
      status: json['status'],
    );
  }

  Map<String, dynamic> toJson() => {
        'charger_id': chargerId,
        'model': model,
        'type': type,
        'connectors': connectors.map((e) => e.toJson()).toList(),
        'vendor': vendor,
        'charger_type': charger_type,
        'max_power': max_power,
        'address': address,
        'status': status,
      };
}

class FetchSpecificQrChargerResponse {
  final bool status;
  final String message;
  final Charger? data;

  FetchSpecificQrChargerResponse({
    required this.status,
    required this.message,
    required this.data,
  });

  factory FetchSpecificQrChargerResponse.fromJson(Map<String, dynamic> json) {
    return FetchSpecificQrChargerResponse(
      status: !(json['error'] ?? true),
      message: json['message'] ?? '',
      data: json['charger'] != null ? Charger.fromJson(json['charger']) : null,
    );
  }
}

class Updateconnectorwithchargerid {
  final bool error;
  final String message;
  final double unitPrice;

  Updateconnectorwithchargerid({
    required this.error,
    required this.message,
    required this.unitPrice,
  });

  factory Updateconnectorwithchargerid.fromJson(Map<String, dynamic> json) {
    return Updateconnectorwithchargerid(
      error: json['error'] ?? true,
      message: json['message'] ?? "No message",
      unitPrice: (json['unitPrice'] ?? 0.0).toDouble(),
    );
  }
}
