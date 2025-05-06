import 'package:web_socket_channel/web_socket_channel.dart';

class WebSocketService {
  WebSocketChannel? _channel;
  bool _isConnected = false;
  final String url;

  WebSocketService(this.url);

  bool get isConnected => _isConnected;

  void connect() {
    if (_channel != null && _channel!.closeCode == null) return;

    _channel = WebSocketChannel.connect(Uri.parse(url));
    _isConnected = true;
  }

  void disconnect() {
    if (_channel != null) {
      try {
        if (_channel!.closeCode == null) {
          print('Closing WebSocket connection to: $url');
          _channel!.sink.close();
          print('WebSocket connection closed successfully');
        } else {
          print(
              'WebSocket was already closed with code: ${_channel!.closeCode}');
        }
      } catch (e) {
        print('Error closing WebSocket connection: $e');
      }
      _channel = null;
      _isConnected = false;
    }
  }

  Stream get stream {
    if (_channel == null) {
      connect();
    }
    return _channel!.stream;
  }

  void sendMessage(String message) {
    if (_channel != null && _channel!.closeCode == null) {
      _channel!.sink.add(message);
    }
  }
}
