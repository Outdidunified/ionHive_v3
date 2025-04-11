class VehicleModel {
  final String id;
  final String name;
  final String? imageUrl;
  final String? model;
  final String? vehicleNumber;
  final String? vehicleCompany;
  final String? range;
  final String? chargerType;
  final double? batterySizeKwh;

  VehicleModel({
    required this.id,
    required this.name,
    this.imageUrl,
    this.model,
    this.vehicleNumber,
    this.vehicleCompany,
    this.range,
    this.chargerType,
    this.batterySizeKwh,
  });

  factory VehicleModel.fromJson(Map<String, dynamic> json) {
    final details = json['details'] ?? {};

    return VehicleModel(
      id: json['vehicle_id']?.toString() ?? '',
      name: details['model'] ?? '',
      imageUrl: details['vehicle_image'],
      model: details['model'],
      vehicleNumber: json['vehicle_number'],
      vehicleCompany: details['vehicle_company'],
      range: details['range'],
      chargerType: details['charger_type'],
      batterySizeKwh: details['battery_size_kwh'] != null
          ? double.tryParse(details['battery_size_kwh'].toString())
          : null, // Safely parse battery size
    );
  }
}

class FetchSavedVehicle {
  final bool error;
  final List<VehicleModel> vehicles;
  final String? message;

  FetchSavedVehicle({
    required this.error,
    required this.vehicles,
    this.message,
  });

  factory FetchSavedVehicle.fromJson(Map<String, dynamic> json) {
    return FetchSavedVehicle(
      error: json['error'] ?? false,
      vehicles: (json['vehicles'] as List<dynamic>?)
              ?.map((e) => VehicleModel.fromJson(e))
              .toList() ??
          [],
      message: json['message'],
    );
  }
}

class Removevehicleresponse {
  final bool error;
  final String message;

  Removevehicleresponse({
    required this.error,
    required this.message,
  });

  factory Removevehicleresponse.fromJson(Map<String, dynamic> json) {
    return Removevehicleresponse(
      error: json['error'] as bool,
      message: json['message'] as String,
    );
  }
}



