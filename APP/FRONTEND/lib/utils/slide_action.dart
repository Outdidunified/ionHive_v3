import 'package:flutter/material.dart';
import 'package:slide_to_act/slide_to_act.dart';
import 'package:flutter_haptic_feedback/flutter_haptic_feedback.dart';

/// A wrapper class that provides a slide-to-action widget
/// This replaces the previous slider_button implementation
class CustomSlideAction extends StatelessWidget {
  final String label;
  final Function onSubmit;
  final Color? backgroundColor;
  final Color? textColor;
  final Color? sliderButtonColor;
  final Color? sliderButtonIconColor;
  final double height;
  final double borderRadius;
  final Widget? icon;

  const CustomSlideAction({
    super.key,
    required this.label,
    required this.onSubmit,
    this.backgroundColor,
    this.textColor,
    this.sliderButtonColor,
    this.sliderButtonIconColor,
    this.height = 60,
    this.borderRadius = 12,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SlideAction(
      height: height,
      borderRadius: borderRadius,
      outerColor: backgroundColor ?? theme.primaryColor,
      innerColor: sliderButtonColor ?? Colors.white,
      text: label,
      textStyle: TextStyle(
        color: textColor ?? Colors.white,
        fontSize: 16,
        fontWeight: FontWeight.bold,
      ),
      sliderButtonIcon: icon ?? const Icon(Icons.arrow_forward),
      onSubmit: () {
        // Provide haptic feedback when the slide is completed
        FlutterHapticFeedback.impact();
        onSubmit();
        return null; // Return null to keep the widget in the submitted state
      },
    );
  }
}
