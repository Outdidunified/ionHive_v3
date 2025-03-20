class HttpException implements Exception {
  final int statusCode;
  final String message;

  HttpException(this.statusCode, this.message);

  @override
  String toString() => message;
}

class SocketException implements Exception {
  final int statusCode;
  final String message;

  SocketException(this.statusCode, this.message);

  @override
  String toString() => message;
}

class TimeoutException implements Exception {
  final int statusCode;
  final String message;

  TimeoutException(this.statusCode, this.message);

  @override
  String toString() => message;
}
