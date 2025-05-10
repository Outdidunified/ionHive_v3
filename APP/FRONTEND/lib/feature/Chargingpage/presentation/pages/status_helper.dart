import 'package:flutter/material.dart';

// Helper method to get status color
Color getStatusColor(String status) {
  switch (status) {
    case 'Available':
      return Colors.green;
    case 'Preparing':
      return Colors.blue;
    case 'Charging':
      return Colors.indigo;
    case 'Suspended':
      return Colors.amber;
    case 'Finishing':
      return Colors.teal;
    case 'Reserved':
      return Colors.purple;
    case 'Unavailable':
      return Colors.grey;
    case 'Faulted':
      return Colors.red;
    default:
      return Colors.orange;
  }
}
