import 'package:flutter/material.dart';
import 'package:get/get.dart';

class Chargingpage extends StatelessWidget {
  final String chargerId;
  final Map<String, dynamic> chargerDetails;
  final String connectorId;
  final Map<String, dynamic> connectorDetails;

  Chargingpage({
    super.key,
    required this.chargerId,
    required this.chargerDetails,
    required this.connectorId,
    required this.connectorDetails,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Charger ID: $chargerId'),
            Text('Vendor: ${chargerDetails['vendor'] ?? 'Unknown'}'),
            Text('Power: ${chargerDetails['max_power'] ?? 'N/A'}W'),
            Text('Connector ID: $connectorId'),
            Text('Type: ${connectorDetails['type'] == '1' ? 'Socket' : 'Gun'}'),
            Text('Power: ${connectorDetails['power']}'),
            Text('Status: ${connectorDetails['status']}'),
          ],
        ),
      ),
    );
  }
}