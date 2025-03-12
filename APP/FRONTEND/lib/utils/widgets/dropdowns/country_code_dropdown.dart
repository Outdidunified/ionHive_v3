import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SelectReasonDropdown extends StatelessWidget {
  final List<String> reasons;
  final RxString selectedReason;

  const SelectReasonDropdown({
    super.key,
    required this.reasons,
    required this.selectedReason,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InputDecorator(
      decoration: InputDecoration(
        labelText: 'Reason for Deletion',
        labelStyle: theme.textTheme.bodyMedium?.copyWith(
          color: theme.colorScheme.onSecondary,
          fontWeight: FontWeight.w300,
        ),
        errorText:
            selectedReason.value.isEmpty ? 'Please select a reason' : null,
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
        filled: true,
        fillColor: theme.colorScheme.surface,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      child: DropdownButtonHideUnderline(
        child: Obx(
          () {
            return DropdownButton<String>(
              isExpanded: true,
              value: selectedReason.value.isEmpty ? null : selectedReason.value,
              hint: const Text("Select Reason"),
              items: reasons.map((reason) {
                return DropdownMenuItem(
                  value: reason,
                  child: Text(reason),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  selectedReason.value = value;
                }
              },
              iconSize: 30,
              icon: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: Icon(
                  selectedReason.value.isEmpty
                      ? Icons.arrow_drop_down
                      : Icons.check_circle,
                  key: ValueKey(selectedReason.value),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
