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