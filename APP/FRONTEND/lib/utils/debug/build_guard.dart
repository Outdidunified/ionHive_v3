import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

/// A utility class to help prevent and debug build-time state changes
/// that can cause the "Failed assertion: line 1142 pos 12: '!debugBuildingDirtyElements'" error.
class BuildGuard {
  /// Safely executes a function that might trigger state changes.
  ///
  /// If the function is called during the build phase and [deferIfBuilding] is true,
  /// it will be deferred to the next frame to prevent build-time state changes.
  ///
  /// Example usage:
  /// ```dart
  /// BuildGuard.runSafely(() {
  ///   controller.updateState(); // This would normally cause an error if called during build
  /// });
  /// ```
  static void runSafely(VoidCallback callback, {bool deferIfBuilding = true}) {
    // Check if we're currently in the build phase
    if (deferIfBuilding && WidgetsBinding.instance.debugBuildingDirtyElements) {
      // If we are, defer the callback to the next frame
      WidgetsBinding.instance.addPostFrameCallback((_) {
        callback();
      });
    } else {
      // If we're not in the build phase, execute immediately
      callback();
    }
  }

  /// Wraps a function to make it safe to call during build.
  ///
  /// Returns a new function that, when called during build, will defer execution
  /// to the next frame if [deferIfBuilding] is true.
  ///
  /// Example usage:
  /// ```dart
  /// final safeUpdate = BuildGuard.makeSafe(controller.updateState);
  /// safeUpdate(); // Can be safely called during build
  /// ```
  static VoidCallback makeSafe(VoidCallback callback,
      {bool deferIfBuilding = true}) {
    return () => runSafely(callback, deferIfBuilding: deferIfBuilding);
  }
}
