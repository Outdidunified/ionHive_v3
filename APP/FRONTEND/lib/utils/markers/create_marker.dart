import 'dart:async';
import 'dart:ui' as ui;
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MarkerGenerator {
  /// Creates a custom marker with text using the Poppins font
  static Future<BitmapDescriptor> createCustomTextMarker({
    required String text,
    double width = 200,
    double height = 80,
    Color backgroundColor = Colors.white,
    Color textColor = Colors.black,
    double fontSize = 16,
    bool usePoppinsFont = true,
    FontWeight fontWeight = FontWeight.normal,
  }) async {
    final pictureRecorder = ui.PictureRecorder();
    final canvas = Canvas(pictureRecorder);
    final paint = Paint()..color = backgroundColor;

    // Create rounded rectangle for background
    final RRect roundedRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, width, height),
      Radius.circular(height / 3),
    );

    // Draw shadow
    canvas.drawShadow(
        Path()..addRRect(roundedRect), Colors.black.withOpacity(0.4), 4, true);

    // Draw background
    canvas.drawRRect(roundedRect, paint);

    // Create text painter
    final TextStyle textStyle = usePoppinsFont
        ? TextStyle(
            fontFamily: 'CustomFont',
            fontSize: fontSize,
            color: textColor,
            fontWeight: fontWeight,
          )
        : TextStyle(
            fontSize: fontSize,
            color: textColor,
            fontWeight: fontWeight,
          );

    final textPainter = TextPainter(
      text: TextSpan(
        text: text,
        style: textStyle,
      ),
      textDirection: TextDirection.ltr,
      textAlign: TextAlign.center,
    );

    // Layout and draw text
    textPainter.layout(maxWidth: width - 20);
    textPainter.paint(
      canvas,
      Offset(
        (width - textPainter.width) / 2,
        (height - textPainter.height) / 2,
      ),
    );

    // Convert to image
    final picture = pictureRecorder.endRecording();
    final img = await picture.toImage(width.toInt(), height.toInt());
    final byteData = await img.toByteData(format: ui.ImageByteFormat.png);

    if (byteData != null) {
      final bytes = byteData.buffer.asUint8List();
      return BitmapDescriptor.fromBytes(bytes);
    } else {
      // Fallback to default marker
      return BitmapDescriptor.defaultMarker;
    }
  }

  /// Creates a blue dot marker similar to the Google Maps current location marker
  static Future<BitmapDescriptor> createLocationMarker({
    double size = 150,
    Color color = Colors.blue,
  }) async {
    final pictureRecorder = ui.PictureRecorder();
    final canvas = Canvas(pictureRecorder);
    final paint = Paint()..color = color.withOpacity(0.8);

    // Draw outer circle (blue with transparency)
    canvas.drawCircle(Offset(size / 2, size / 2), size / 2, paint);

    // Draw inner circle (white)
    final innerPaint = Paint()..color = Colors.white;
    canvas.drawCircle(Offset(size / 2, size / 2), size / 4, innerPaint);

    // Draw center dot (blue)
    final centerPaint = Paint()..color = color;
    canvas.drawCircle(Offset(size / 2, size / 2), size / 8, centerPaint);

    // Convert to image
    final picture = pictureRecorder.endRecording();
    final img = await picture.toImage(size.toInt(), size.toInt());
    final byteData = await img.toByteData(format: ui.ImageByteFormat.png);

    if (byteData != null) {
      final bytes = byteData.buffer.asUint8List();
      return BitmapDescriptor.fromBytes(bytes);
    } else {
      // Fallback to default marker if custom creation fails
      return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure);
    }
  }

  /// Creates a location marker with custom text label using Poppins font
  static Future<BitmapDescriptor> createLocationMarkerWithLabel({
    required String text,
    double dotSize = 150,
    double labelWidth = 200,
    double labelHeight = 50,
    Color dotColor = Colors.blue,
    Color labelBackgroundColor = Colors.white,
    Color labelTextColor = Colors.black,
    double fontSize = 14,
    bool usePoppinsFont = true,
  }) async {
    final pictureRecorder = ui.PictureRecorder();
    final canvas = Canvas(pictureRecorder);

    // Calculate total dimensions
    final totalWidth = math.max(dotSize, labelWidth);
    final totalHeight = dotSize + labelHeight + 10; // 10px spacing

    // Draw the blue dot at the top
    final dotPaint = Paint()..color = dotColor.withOpacity(0.8);
    final dotCenter = Offset(totalWidth / 2, dotSize / 2);

    // Draw outer circle (blue with transparency)
    canvas.drawCircle(dotCenter, dotSize / 2, dotPaint);

    // Draw inner circle (white)
    final innerPaint = Paint()..color = Colors.white;
    canvas.drawCircle(dotCenter, dotSize / 4, innerPaint);

    // Draw center dot (blue)
    final centerPaint = Paint()..color = dotColor;
    canvas.drawCircle(dotCenter, dotSize / 8, centerPaint);

    // Draw the text label below the dot
    final labelPaint = Paint()..color = labelBackgroundColor;

    // Create rounded rectangle for label background
    final RRect roundedRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(
          (totalWidth - labelWidth) / 2,
          dotSize + 10, // Position below the dot with 10px spacing
          labelWidth,
          labelHeight),
      Radius.circular(labelHeight / 3),
    );

    // Draw shadow for label
    canvas.drawShadow(
        Path()..addRRect(roundedRect), Colors.black.withOpacity(0.4), 4, true);

    // Draw label background
    canvas.drawRRect(roundedRect, labelPaint);

    // Create text painter for label
    final TextStyle textStyle = usePoppinsFont
        ? TextStyle(
            fontFamily: 'CustomFont',
            fontSize: fontSize,
            color: labelTextColor,
            fontWeight: FontWeight.bold,
          )
        : TextStyle(
            fontSize: fontSize,
            color: labelTextColor,
            fontWeight: FontWeight.bold,
          );

    final textPainter = TextPainter(
      text: TextSpan(
        text: text,
        style: textStyle,
      ),
      textDirection: TextDirection.ltr,
      textAlign: TextAlign.center,
    );

    // Layout and draw text
    textPainter.layout(maxWidth: labelWidth - 20);
    textPainter.paint(
      canvas,
      Offset(
        (totalWidth - textPainter.width) / 2,
        dotSize + 10 + (labelHeight - textPainter.height) / 2,
      ),
    );

    // Convert to image
    final picture = pictureRecorder.endRecording();
    final img = await picture.toImage(totalWidth.toInt(), totalHeight.toInt());
    final byteData = await img.toByteData(format: ui.ImageByteFormat.png);

    if (byteData != null) {
      final bytes = byteData.buffer.asUint8List();
      return BitmapDescriptor.fromBytes(bytes);
    } else {
      // Fallback to default marker
      return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure);
    }
  }

  /// Creates a pulsing animation for the location marker
  static Future<List<BitmapDescriptor>> createPulsingLocationMarkers({
    int frames = 3,
    double baseSize = 150,
    Color color = Colors.blue,
  }) async {
    List<BitmapDescriptor> markers = [];

    for (int i = 0; i < frames; i++) {
      // Calculate size for this frame (pulsing effect)
      double pulseSize = baseSize * (0.8 + (0.2 * i / (frames - 1)));

      // Calculate opacity for this frame
      double opacity = 0.6 + (0.4 * (1 - i / (frames - 1)));

      final pictureRecorder = ui.PictureRecorder();
      final canvas = Canvas(pictureRecorder);

      // Draw outer circle with varying size and opacity
      final paint = Paint()..color = color.withOpacity(opacity);
      canvas.drawCircle(
          Offset(baseSize / 2, baseSize / 2), pulseSize / 2, paint);

      // Draw inner circle (white)
      final innerPaint = Paint()..color = Colors.white;
      canvas.drawCircle(
          Offset(baseSize / 2, baseSize / 2), baseSize / 4, innerPaint);

      // Draw center dot (blue)
      final centerPaint = Paint()..color = color;
      canvas.drawCircle(
          Offset(baseSize / 2, baseSize / 2), baseSize / 8, centerPaint);

      // Convert to image
      final picture = pictureRecorder.endRecording();
      final img = await picture.toImage(baseSize.toInt(), baseSize.toInt());
      final byteData = await img.toByteData(format: ui.ImageByteFormat.png);

      if (byteData != null) {
        final bytes = byteData.buffer.asUint8List();
        markers.add(BitmapDescriptor.fromBytes(bytes));
      } else {
        // Fallback to default marker
        markers.add(
            BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure));
      }
    }

    return markers;
  }
}
