class VehicleModel {
  final String id;
  final String name;
  final String plateNumber;
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
    required this.plateNumber,
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
      plateNumber: json['vehicle_number'] ?? '',
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

class VehicleModelData {
  final String id;
  final int vehicleId;
  final String model;
  final String type;
  final String vehicleCompany;
  final double batterySizeKwh;
  final String chargerType;
  final String vehicleImage;

  VehicleModelData({
    required this.id,
    required this.vehicleId,
    required this.model,
    required this.type,
    required this.vehicleCompany,
    required this.batterySizeKwh,
    required this.chargerType,
    required this.vehicleImage,
  });

  factory VehicleModelData.fromJson(Map<String, dynamic> json) {
    return VehicleModelData(
      id: json['_id'] ?? '',
      vehicleId: json['vehicle_id'] ?? 0,
      model: json['model'] ?? '',
      type: json['type'] ?? '',
      vehicleCompany: json['vehicle_company'] ?? '',
      batterySizeKwh: (json['battery_size_kwh'] is num)
          ? (json['battery_size_kwh'] as num).toDouble()
          : double.tryParse(json['battery_size_kwh'].toString()) ?? 0.0,
      chargerType: json['charger_type'] ?? '',
      vehicleImage: json['vehicle_image'] ?? '',
    );
  }
}

class GetAllVehicleModel {
  final bool error;
  final List<VehicleModelData> vehicleModels;

  GetAllVehicleModel({
    required this.error,
    required this.vehicleModels,
  });

  factory GetAllVehicleModel.fromJson(Map<String, dynamic> json) {
    return GetAllVehicleModel(
      error: json['error'] ?? false,
      vehicleModels: (json['vehicleModels'] as List<dynamic>?)
          ?.map((e) => VehicleModelData.fromJson(e))
          .toList() ??
          [],
    );
  }
}



