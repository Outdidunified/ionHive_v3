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