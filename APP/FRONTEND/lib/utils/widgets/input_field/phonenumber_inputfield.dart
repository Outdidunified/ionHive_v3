import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl_phone_field/intl_phone_field.dart';

class AdvancedPhoneNumberInput extends StatefulWidget {
  final TextEditingController controller;
  final Function(String)? onChanged;
  final Function(String)? onCountryChanged;

  const AdvancedPhoneNumberInput({
    super.key,
    required this.controller,
    this.onChanged,
    this.onCountryChanged,
  });

  @override
  State<AdvancedPhoneNumberInput> createState() =>
      _AdvancedPhoneNumberInputState();
}

class _AdvancedPhoneNumberInputState extends State<AdvancedPhoneNumberInput> {
  bool _hasError = false;
  bool _isValid = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final borderColor = _hasError
        ? theme.colorScheme.error
        : _isValid
            ? theme.colorScheme.primary
            : theme.dividerColor;

    return IntlPhoneField(
      controller: widget.controller,
      decoration: InputDecoration(
        labelText: 'Phone Number',
        labelStyle: theme.textTheme.bodyMedium,
        filled: true,
        fillColor: theme.colorScheme.surface,
        contentPadding:
            const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
        errorText: _hasError ? "Enter a valid phone number" : null,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: borderColor, width: 2.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: borderColor, width: 2.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: theme.primaryColor, width: 2.0),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: theme.colorScheme.error, width: 2.0),
        ),
      ),
      initialCountryCode: 'IN', // Default to India 🇮🇳
      onChanged: (phone) {
        setState(() {
          _hasError = phone.number.length < 10;
          _isValid = phone.number.length >= 10;
        });
        widget.onChanged?.call(phone.completeNumber);
      },
      onCountryChanged: (country) =>
          widget.onCountryChanged?.call(country.code),
      keyboardType: TextInputType.phone,
      
      style: theme.textTheme.bodyLarge,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
    );
  }
}
