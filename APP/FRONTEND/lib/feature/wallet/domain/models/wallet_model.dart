class ProgressMetric {
  final double current;
  final double target;
  final String unit;
  final double percentage;

  ProgressMetric({
    required this.current,
    required this.target,
    required this.unit,
    required this.percentage,
  });

  factory ProgressMetric.fromJson(Map<String, dynamic> json) {
    return ProgressMetric(
      current: double.tryParse(json['current'].toString()) ?? 0.0,
      target: double.tryParse(json['target'].toString()) ?? 0.0,
      unit: json['unit'] as String? ?? '',
      percentage: double.tryParse(json['percentage'].toString()) ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'current': current,
      'target': target,
      'unit': unit,
      'percentage': percentage,
    };
  }
}

class ProgressMetrics {
  final ProgressMetric monthlyChargingGoal;
  final ProgressMetric energySavings;
  final ProgressMetric carbonFootprintReduction;

  ProgressMetrics({
    required this.monthlyChargingGoal,
    required this.energySavings,
    required this.carbonFootprintReduction,
  });

  factory ProgressMetrics.fromJson(Map<String, dynamic> json) {
    return ProgressMetrics(
      monthlyChargingGoal: ProgressMetric.fromJson(
          json['monthly_charging_goal'] as Map<String, dynamic>),
      energySavings: ProgressMetric.fromJson(
          json['energy_savings'] as Map<String, dynamic>),
      carbonFootprintReduction: ProgressMetric.fromJson(
          json['carbon_footprint_reduction'] as Map<String, dynamic>),
    );
  }

  factory ProgressMetrics.empty() {
    return ProgressMetrics(
      monthlyChargingGoal:
          ProgressMetric(current: 0, target: 100, unit: 'kWh', percentage: 0),
      energySavings:
          ProgressMetric(current: 0, target: 2000, unit: 'Rs.', percentage: 0),
      carbonFootprintReduction: ProgressMetric(
          current: 0, target: 100, unit: 'kg CO₂', percentage: 0),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'monthly_charging_goal': monthlyChargingGoal.toJson(),
      'energy_savings': energySavings.toJson(),
      'carbon_footprint_reduction': carbonFootprintReduction.toJson(),
    };
  }
}

class FetchwalletbalanceModel {
  final bool error;
  final double? walletBalance;
  final double? totalCredited;
  final double? totalDebited;
  final int? creditedCount;
  final int? debitedCount;
  final String? message;
  final ProgressMetrics? progressMetrics;

  FetchwalletbalanceModel({
    required this.error,
    this.walletBalance,
    this.totalCredited,
    this.totalDebited,
    this.creditedCount,
    this.debitedCount,
    this.message,
    this.progressMetrics,
  });

  factory FetchwalletbalanceModel.fromJson(Map<String, dynamic> json) {
    // Extract the nested 'data' object
    final data = json['data'] as Map<String, dynamic>?;

    return FetchwalletbalanceModel(
      error: json['error'] as bool,
      // Ensure wallet_balance is parsed correctly as a double
      walletBalance: data != null && data['wallet_balance'] != null
          ? double.tryParse(data['wallet_balance'].toString()) ?? 0.0
          : 0.0,
      // Parse total_credited and total_debited
      totalCredited: data != null && data['total_credited'] != null
          ? double.tryParse(data['total_credited'].toString()) ?? 0.0
          : 0.0,
      totalDebited: data != null && data['total_debited'] != null
          ? double.tryParse(data['total_debited'].toString()) ?? 0.0
          : 0.0,
      // Parse credited_count and debited_count
      creditedCount: data != null && data['credited_count'] != null
          ? int.tryParse(data['credited_count'].toString()) ?? 0
          : 0,
      debitedCount: data != null && data['debited_count'] != null
          ? int.tryParse(data['debited_count'].toString()) ?? 0
          : 0,
      // Parse progress metrics if available
      progressMetrics: data != null && data['progress_metrics'] != null
          ? ProgressMetrics.fromJson(
              data['progress_metrics'] as Map<String, dynamic>)
          : ProgressMetrics.empty(),
      message: json['message'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'error': error,
      'data': {
        'wallet_balance': walletBalance ?? 0.0,
        'total_credited': totalCredited ?? 0.0,
        'total_debited': totalDebited ?? 0.0,
        'credited_count': creditedCount ?? 0,
        'debited_count': debitedCount ?? 0,
        'progress_metrics': progressMetrics?.toJson(),
      },
      'message': message,
    };
  }
}
