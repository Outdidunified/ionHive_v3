import 'dart:developer';
import 'package:flutter/foundation.dart';


const String ansiReset = '\x1B[0m';
const String ansiGreen = '\x1B[32m';
const String ansiRed = '\x1B[31m';

void debuglog(String message, {String level = 'INFO'}) {
  final timestamp = DateTime.now().toIso8601String();
  log('[$level] $timestamp: $message');
}

void debugEnvSpeficlog(String message) {
  if (kDebugMode) {
    final timestamp = DateTime.now().toIso8601String();
    log('$timestamp: $message');
  }
}

void debuglogForLoadINFO(String message, {String level = 'INFO'}) {
  final timestamp = DateTime.now().toIso8601String();
  final logMessage = '[$level] $timestamp: $message';

    // Green-colored log for verification
    log('$ansiGreen$logMessage$ansiReset');
}

void debuglogError(String message, {String level = 'ERROR'}) {
  final timestamp = DateTime.now().toIso8601String();
  final logMessage = '[$level] $timestamp: $message';

  // Red-colored log for error
  log('$ansiRed$logMessage$ansiReset');
}