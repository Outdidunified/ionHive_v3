import 'package:flutter/material.dart';
import 'package:get/get.dart';

class Vehiclepage extends StatelessWidget {
  final int userId;
  final String username;
  final String emailId;
  final String token;

  const Vehiclepage({super.key, required this.userId, required this.username, required this.emailId, required this.token});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text('nhbshwd'),
      ),
    );
  }
}
