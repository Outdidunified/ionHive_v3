class Savestationsresponse {
  final bool error;
  final String message;
  final List<dynamic> updatedFavStations;

  Savestationsresponse({
    required this.error,
    required this.message,
    required this.updatedFavStations,
  });

  factory Savestationsresponse.fromJson(Map<String, dynamic> json) {
    // Consider "no changes made" as a non-error case
    final isNoChangesError = json['error'] == true &&
        json['message'] == 'No changes made to favorite stations';

    return Savestationsresponse(
      error: isNoChangesError ? false : json['error'] ?? true,
      message: json['message'] ?? "No message",
      updatedFavStations: json['updatedFavStations'] ?? [],
    );
  }
}

class Removestationsresponse {
  final bool error;
  final String message;
  final List<dynamic> updatedFavStations;

  Removestationsresponse({
    required this.error,
    required this.message,
    required this.updatedFavStations,
  });

  factory Removestationsresponse.fromJson(Map<String, dynamic> json) {
    // Consider "no changes made" as a non-error case
    final isNoChangesError = json['error'] == true &&
        json['message'] == 'No changes made to favorite stations';

    return Removestationsresponse(
      error: isNoChangesError ? false : json['error'] ?? true,
      message: json['message'] ?? "No message",
      updatedFavStations: json['updatedFavStations'] ?? [],
    );
  }
}

class Fetchspecificchargerresponse {
  final bool error;
  final String message;
  final List<dynamic> specificchargers;

  Fetchspecificchargerresponse({
    required this.error,
    required this.message,
    required this.specificchargers,
  });

  factory Fetchspecificchargerresponse.fromJson(Map<String, dynamic> json) {
    // Consider "no changes made" as a non-error case
    final isNoChangesError = json['error'] == true &&
        json['message'] == 'No changes made to favorite stations';

    return Fetchspecificchargerresponse(
      error: isNoChangesError ? false : json['error'] ?? true,
      message: json['message'] ?? "No message",
      specificchargers: json['chargers'] ?? [], // Updated key from 'specificchargers' to 'chargers'
    );
  }
}

class Savechargersresponse {
  final bool error;
  final String message;
  final List<dynamic> updatedFavChargers;

  Savechargersresponse({
    required this.error,
    required this.message,
    required this.updatedFavChargers,
  });

  factory Savechargersresponse.fromJson(Map<String, dynamic> json) {
    // Consider "no changes made" as a non-error case
    final isNoChangesError = json['error'] == true &&
        json['message'] == 'No changes made to favorite stations';

    return Savechargersresponse(
      error: isNoChangesError ? false : json['error'] ?? true,
      message: json['message'] ?? "No message",
      updatedFavChargers: json['updatedFavChargers'] ?? [],
    );
  }
}

class Removerchargerresponse {
  final bool error;
  final String message;
  final List<dynamic> updatedFavChargers;

  Removerchargerresponse({
    required this.error,
    required this.message,
    required this.updatedFavChargers,
  });

  factory Removerchargerresponse.fromJson(Map<String, dynamic> json) {
    // Consider "no changes made" as a non-error case
    final isNoChangesError = json['error'] == true &&
        json['message'] == 'No changes made to favorite stations';

    return Removerchargerresponse(
      error: isNoChangesError ? false : json['error'] ?? true,
      message: json['message'] ?? "No message",
      updatedFavChargers: json['updatedFavChargers'] ?? [],
    );
  }
}