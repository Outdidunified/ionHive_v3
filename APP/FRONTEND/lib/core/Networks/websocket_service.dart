import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class WebSocketService {
  WebSocketChannel? _channel;
  bool _isConnected = false;
  final String url;
  StreamController<dynamic>? _streamController;
  StreamSubscription? _subscription;

  WebSocketService(this.url);

  bool get isConnected => _isConnected;

  void connect() {
    // Always force a new connection to ensure we're properly connected
    _cleanupExistingConnection();

    try {
      debugPrint('Connecting to WebSocket: $url');
      _channel = WebSocketChannel.connect(Uri.parse(url));
      _streamController = StreamController<dynamic>.broadcast();

      // Set up subscription to the actual WebSocket stream
      _subscription = _channel!.stream.listen(
        (data) {
          debugPrint('WebSocket received data');
          if (_streamController != null && !_streamController!.isClosed) {
            _streamController!.add(data);
          }
          _isConnected = true; // Confirm connection on first data received
        },
        onError: (error) {
          debugPrint('WebSocket error in service: $error');
          _isConnected = false;
          if (_streamController != null && !_streamController!.isClosed) {
            _streamController!.addError(error);
          }
        },
        onDone: () {
          debugPrint('WebSocket connection closed in service');
          _isConnected = false;
          _closeStreamController();
        },
      );

      _isConnected = true; // Assume connected initially
      debugPrint('WebSocket connection initialized');
    } catch (e) {
      debugPrint('Error connecting to WebSocket: $e');
      _isConnected = false;
      _closeStreamController();
    }
  }

  void _cleanupExistingConnection() {
    // Clean up any existing connection
    if (_subscription != null) {
      _subscription!.cancel();
      _subscription = null;
    }

    if (_channel != null) {
      try {
        if (_channel!.closeCode == null) {
          debugPrint('Closing existing WebSocket connection to: $url');
          _channel!.sink.close();
        }
      } catch (e) {
        debugPrint('Error closing existing WebSocket connection: $e');
      }
      _channel = null;
    }

    _closeStreamController();
    _isConnected = false;
  }

  void _closeStreamController() {
    if (_streamController != null && !_streamController!.isClosed) {
      _streamController!.close();
      _streamController = null;
    }
  }

  void disconnect() {
    debugPrint('Disconnecting WebSocket service');
    _cleanupExistingConnection();
  }

  Stream get stream {
    if (_streamController == null || _streamController!.isClosed) {
      connect();
    }
    return _streamController!.stream;
  }

  void sendMessage(String message) {
    if (_channel != null && _channel!.closeCode == null && _isConnected) {
      try {
        _channel!.sink.add(message);
        debugPrint('Message sent to WebSocket');
      } catch (e) {
        debugPrint('Error sending message to WebSocket: $e');
        // Try to reconnect if sending fails
        connect();
      }
    } else {
      debugPrint('Cannot send message, WebSocket not connected');
      connect(); // Try to reconnect
    }
  }

  // Check if the connection is actually working
  bool isConnectionActive() {
    return _channel != null &&
        _channel!.closeCode == null &&
        _isConnected &&
        _streamController != null &&
        !_streamController!.isClosed;
  }
}
