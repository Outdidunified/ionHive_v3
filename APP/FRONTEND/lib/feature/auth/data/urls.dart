import 'package:ionhive/core/core.dart';

class AuthUrl {
  static final String GetOTP = '${iOnHiveCore.baseUrl}/auth/GenerateOTP';
  static final String AuthenticateOTP = '${iOnHiveCore.baseUrl}/auth/authOTP';
  static final String GoogleSignIN = '${iOnHiveCore.baseUrl}/auth/googleSignIN';
  static final String AppleSignIN = '${iOnHiveCore.baseUrl}/auth/AppleSignIN';
}
