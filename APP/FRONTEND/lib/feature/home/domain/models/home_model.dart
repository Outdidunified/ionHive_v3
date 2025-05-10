class Fetchnearbychargersresponse {
  final bool success;
  final String message;
  final dynamic nearbychargers; // Can be Map or List depending on response

  Fetchnearbychargersresponse({
    required this.success,
    required this.message,
    this.nearbychargers, // Optional data
  });

  factory Fetchnearbychargersresponse.fromJson(Map<String, dynamic> json) {
    return Fetchnearbychargersresponse(
      success: json['error'] == false, // Map 'error' to 'success'
      message: json['message'] ?? "No message",
      nearbychargers: json['stations'] ??
          json['data'], // Try to get 'stations' first, then fallback to 'data'
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'nearbychargers': nearbychargers,
    };
  }
}

class Fetchactivechargersresponse {
  final bool success;
  final String message;
  final dynamic activechargers; // Can be Map or List depending on response

  Fetchactivechargersresponse({
    required this.success,
    required this.message,
    this.activechargers, // Optional data
  });

  factory Fetchactivechargersresponse.fromJson(Map<String, dynamic> json) {
    return Fetchactivechargersresponse(
      success: json['error'] == false, // Map 'error' to 'success'
      message: json['message'] ?? "No message",
      activechargers: json['stations'] ??
          json['data'], // Try to get 'stations' first, then fallback to 'data'
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'activechargers': activechargers,
    };
  }
}
