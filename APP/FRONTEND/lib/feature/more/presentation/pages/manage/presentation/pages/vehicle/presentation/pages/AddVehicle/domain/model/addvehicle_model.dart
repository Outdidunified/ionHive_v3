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