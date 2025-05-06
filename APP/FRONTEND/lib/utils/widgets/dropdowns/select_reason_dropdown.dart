import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SelectReasonDropdown extends StatefulWidget {
  final List<String> reasons;
  final RxString selectedReason;
  final RxString otherReason;

  const SelectReasonDropdown({
    super.key,
    required this.reasons,
    required this.selectedReason,
    required this.otherReason,
  });

  @override
  State<SelectReasonDropdown> createState() => _SelectReasonDropdownState();
}

class _SelectReasonDropdownState extends State<SelectReasonDropdown> {
  final TextEditingController _otherReasonController = TextEditingController();
  final FocusNode _otherReasonFocusNode = FocusNode();
  final RxBool _showError = false.obs;

  @override
  void initState() {
    super.initState();
    // Initialize the controller with any existing value
    _otherReasonController.text = widget.otherReason.value;

    // Listen for changes to update the Rx variable
    _otherReasonController.addListener(() {
      widget.otherReason.value = _otherReasonController.text;
      // Clear error when user starts typing
      if (_otherReasonController.text.isNotEmpty) {
        _showError.value = false;
      }
    });

    // Focus the text field when "Other" is selected
    ever(widget.selectedReason, (reason) {
      if (reason == 'Other') {
        Future.delayed(const Duration(milliseconds: 100), () {
          _otherReasonFocusNode.requestFocus();
        });
        // Reset error state when changing selection
        _showError.value = false;
      }
    });
  }

  @override
  void dispose() {
    _otherReasonController.dispose();
    _otherReasonFocusNode.dispose();
    super.dispose();
  }

  // Method to validate the "Other" reason text field
  // Returns true if valid, false if invalid
  bool validateOtherReason() {
    if (widget.selectedReason.value == 'Other' &&
        widget.otherReason.value.isEmpty) {
      _showError.value = true;
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        InputDecorator(
          decoration: InputDecoration(
            labelText: 'Reason for Deletion',
            labelStyle: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSecondary,
              fontWeight: FontWeight.w300,
            ),
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
                  value: widget.selectedReason.value.isEmpty
                      ? null
                      : widget.selectedReason.value,
                  hint: const Text("Select Reason"),
                  items: widget.reasons.map((reason) {
                    return DropdownMenuItem<String>(
                      value: reason,
                      child: Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: theme.dividerColor,
                            width: 1,
                          ),
                          color: widget.selectedReason.value == reason
                              ? theme.colorScheme.primary.withOpacity(0.1)
                              : Colors.transparent,
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                              vertical: 10.0, horizontal: 16.0),
                          child: Row(
                            children: [
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  reason,
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: widget.selectedReason.value == reason
                                        ? theme.primaryColor
                                        : theme.colorScheme.onSurface,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  // Allow text to wrap to multiple lines
                                  softWrap: true,
                                  maxLines: 3,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                  onChanged: (value) {
                    widget.selectedReason.value = value ?? '';
                  },
                  iconSize: 30,
                  icon: Icon(
                    Icons.arrow_drop_down,
                    color: theme.colorScheme.onSurface,
                  ),
                  // Allow dropdown items to have more height for multi-line text
                  itemHeight: null,
                  // Ensure dropdown menu is wide enough
                  menuMaxHeight: MediaQuery.of(context).size.height * 0.5,
                );
              },
            ),
          ),
        ),

        // Show text field for "Other" reason
        Obx(() => widget.selectedReason.value == 'Other'
            ? Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: Obx(() => TextField(
                      controller: _otherReasonController,
                      focusNode: _otherReasonFocusNode,
                      decoration: InputDecoration(
                        labelText: 'Please specify your reason *',
                        labelStyle: theme.textTheme.bodyMedium?.copyWith(
                          color: _showError.value
                              ? Colors.red
                              : theme.colorScheme.onSecondary,
                          fontWeight: FontWeight.w300,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide:
                              BorderSide(color: theme.colorScheme.primary),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide:
                              BorderSide(color: theme.primaryColor, width: 2),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: _showError.value
                                ? Colors.red
                                : theme.dividerColor,
                          ),
                        ),
                        errorBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.red, width: 1),
                        ),
                        focusedErrorBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.red, width: 2),
                        ),
                        filled: true,
                        fillColor: theme.colorScheme.surface,
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        helperText: 'Required',
                        helperStyle: TextStyle(
                          color: Colors.red.shade400,
                          fontSize: 12,
                        ),
                        errorText: _showError.value
                            ? 'Please enter your reason'
                            : null,
                      ),
                      maxLines: 3,
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) {
                        // Validate on submission
                        if (widget.otherReason.value.isEmpty) {
                          _showError.value = true;
                        }
                      },
                    )),
              )
            : const SizedBox.shrink()),
      ],
    );
  }
}
