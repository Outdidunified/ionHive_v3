import 'package:flutter/widgets.dart';

class BuildGuard {
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

  static VoidCallback makeSafe(VoidCallback callback,
      {bool deferIfBuilding = true}) {
    return () => runSafely(callback, deferIfBuilding: deferIfBuilding);
  }
}
