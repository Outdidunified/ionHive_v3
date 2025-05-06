import 'package:web_socket_channel/web_socket_channel.dart';

class WebSocketService {
  late WebSocketChannel _channel;
  final String url;

  WebSocketService(this.url);

  void connect() {
    _channel = WebSocketChannel.connect(Uri.parse(url));
  }

  void disconnect() {
    _channel.sink.close();
  }

  Stream get stream => _channel.stream;

  void sendMessage(String message) {
    if (_channel.closeCode == null) {
      _channel.sink.add(message);
    }
  }
}