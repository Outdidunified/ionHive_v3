// ignore_for_file: file_names

import 'package:flutter/material.dart';

class Chargingpage extends StatelessWidget {
  final String chargerId;
  final Map<String, dynamic> chargerDetails;
  final String connectorId;
  final Map<String, dynamic> connectorDetails;
  final double unitPrice;

  const Chargingpage({
    super.key,
    required this.chargerId,
    required this.chargerDetails,
    this.unitPrice = 0.0,
    required this.connectorId,
    required this.connectorDetails,
  });

  @override
  Widget build(BuildContext context) {
    print('charging details: $chargerDetails');
    print('Connector details: $connectorDetails');
    print('Unitprice: $unitPrice');
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Charger ID: $chargerId'),
            Text('Vendor: ${chargerDetails['vendor'] ?? 'Unknown'}'),
            Text('Power: ${chargerDetails['max_power'] ?? 'N/A'}W'),
            Text('Connector ID: $connectorId'),
            Text(
                'Type: ${connectorDetails['connector_type'] == 1 ? 'Socket' : 'Gun'}'),
            Text('Status: ${connectorDetails['status'] ?? 'Unknown'}'),
            if (unitPrice > 0)
              Text('Unit Price: ₹${unitPrice.toStringAsFixed(2)}/kWh'),
          ],
        ),
      ),
    );
  }
}