import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class PasswordInput extends StatefulWidget {
  final TextEditingController controller;
  final String? hintText;
  final String? errorText;
  final void Function(String)? onChanged;

  const PasswordInput({
    required this.controller,
    this.hintText,
    this.errorText,
    this.onChanged,
    super.key,
  });

  @override
  _PasswordInputState createState() => _PasswordInputState();
}

class _PasswordInputState extends State<PasswordInput> {
  // ValueNotifier to manage the password visibility state
  final ValueNotifier<bool> _obscureTextNotifier = ValueNotifier<bool>(true);

  @override
  void dispose() {
    // Dispose the ValueNotifier when the widget is disposed
    _obscureTextNotifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ValueListenableBuilder<bool>(
      valueListenable: _obscureTextNotifier,
      builder: (context, isObscure, child) {
        return TextField(
          controller: widget.controller,
          obscureText: isObscure, // Toggles password visibility
          onChanged: widget.onChanged,
          keyboardType: TextInputType.number, // Restrict input to numbers
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly, // Allow only digits
            LengthLimitingTextInputFormatter(4), // Limit input to 4 digits
          ],
          decoration: InputDecoration(
            hintText: widget.hintText ?? 'Enter your password',
            hintStyle: theme.textTheme.bodyLarge?.copyWith(
              color: theme.hintColor,
            ),
            errorText: widget.errorText,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: theme.colorScheme.primary),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: theme.primaryColor, width: 2),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: theme.dividerColor),
            ),
            labelText: 'Password',
            labelStyle: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurface,
              fontWeight: FontWeight.w300,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                isObscure ? Icons.visibility_off : Icons.visibility,
                color: theme.iconTheme.color,
              ),
              onPressed: () {
                // Toggle password visibility
                _obscureTextNotifier.value = !isObscure;
              },
            ),
            filled: true,
            fillColor: theme.colorScheme.surface,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
          style: theme.textTheme.bodyLarge,
        );
      },
    );
  }
}
