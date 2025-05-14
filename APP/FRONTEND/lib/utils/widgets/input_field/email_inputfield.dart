import 'package:flutter/material.dart';

class EmailInput extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final String? errorText;
  final void Function(String)? onChanged;
  final bool readOnly;

  const EmailInput({
    super.key,
    required this.controller,
    this.hintText = 'Enter your email',
    this.errorText,
    this.onChanged,
    this.readOnly = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return TextField(
      controller: controller,
      keyboardType: TextInputType.emailAddress,
      onChanged: onChanged,
      readOnly: readOnly,
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: theme.textTheme.bodyLarge?.copyWith(
          color: theme.hintColor,
        ),
        labelText: 'Email',
        labelStyle: theme.textTheme.bodyLarge?.copyWith(
          color: isDark
              ? Colors.grey[300]
              : Colors.grey[700], // Adjust label for contrast
          fontWeight: FontWeight.w300,
        ),
        errorText: errorText,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: theme.colorScheme.primary,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: theme.colorScheme.primary,
            width: 2,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: theme.dividerColor,
          ),
        ),
        suffixIcon: controller.text.isNotEmpty
            ? IconButton(
          icon: Icon(Icons.clear,
              color: theme.iconTheme.color ?? (isDark ? Colors.white : Colors.black)),
          onPressed: () => controller.clear(),
        )
            : null,
        filled: true,
        fillColor: isDark
            ? Colors.grey[900]
            : Colors.grey[100], // Background adapts to theme
        contentPadding:
        const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      style: theme.textTheme.bodyLarge?.copyWith(
        color: isDark ? Colors.white : Colors.black,
      ),
    );
  }
}
