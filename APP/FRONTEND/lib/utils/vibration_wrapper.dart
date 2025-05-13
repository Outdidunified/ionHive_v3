import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// A wrapper for the vibration package to handle compatibility issues
/// with newer Flutter versions.
class VibrationWrapper {
  static const MethodChannel _channel = MethodChannel('vibration');

  /// Vibrate with a given pattern and repeat.
  static Future<void> vibrate({
    int duration = 500,
    List<int> pattern = const [],
    int repeat = -1,
    List<int> intensities = const [],
    int amplitude = -1,
  }) async {
    try {
      final params = <String, dynamic>{
        "duration": duration,
        "pattern": pattern,
        "repeat": repeat,
        "amplitude": amplitude,
        "intensities": intensities,
      };
      await _channel.invokeMethod("vibrate", params);
    } catch (e) {
      debugPrint("Vibration error: $e");
      // Fallback to HapticFeedback if vibration fails
      try {
        await HapticFeedback.mediumImpact();
      } catch (_) {
        // Ignore if haptic feedback also fails
      }
    }
  }

  /// Check if vibration is available on device
  static Future<bool> hasVibrator() async {
    try {
      final bool? result = await _channel.invokeMethod("hasVibrator");
      return result ?? false;
    } catch (e) {
      debugPrint("Vibration check error: $e");
      return false;
    }
  }

  /// Cancel ongoing vibration
  static Future<void> cancel() async {
    try {
      await _channel.invokeMethod("cancel");
    } catch (e) {
      debugPrint("Vibration cancel error: $e");
    }
  }
}
