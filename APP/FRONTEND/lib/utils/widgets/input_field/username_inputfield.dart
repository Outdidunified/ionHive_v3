import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class UsernameInputField extends StatefulWidget {
  final TextEditingController controller;
  final Function(String)? onChanged;

  const UsernameInputField({
    super.key,
    required this.controller,
    this.onChanged,
  });

  @override
  State<UsernameInputField> createState() => _UsernameInputFieldState();
}

class _UsernameInputFieldState extends State<UsernameInputField> {
  bool _hasError = false;

  void _validateInput(String value) {
    setState(() {
      _hasError = value.length < 3;
    });
    widget.onChanged?.call(value);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return TextField(
      controller: widget.controller,
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'^[a-zA-Z0-9_. ]*$')),
        LengthLimitingTextInputFormatter(20),
      ],
      keyboardType: TextInputType.name,
      textCapitalization: TextCapitalization.words,
      style: theme.textTheme.bodyLarge,
      decoration: InputDecoration(
        labelText: 'Username',
        labelStyle: theme.textTheme.bodyMedium,
        prefixIcon: Icon(
          Icons.person_outline,
          color: theme.primaryColor,
        ),
        hintText: 'Enter your username',
        hintStyle: theme.textTheme.bodyMedium?.copyWith(
          color: theme.colorScheme.onSurface.withOpacity(0.5),
        ),
        filled: true,
        fillColor: theme.colorScheme.surface,
        contentPadding:
            const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
        errorText: _hasError ? "Username must be at least 3 characters" : null,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: theme.dividerColor, width: 2.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: theme.dividerColor, width: 2.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: theme.primaryColor, width: 2.0),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: theme.colorScheme.error, width: 2.0),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: theme.colorScheme.error, width: 2.0),
        ),
      ),
      onChanged: _validateInput,
    );
  }
}
