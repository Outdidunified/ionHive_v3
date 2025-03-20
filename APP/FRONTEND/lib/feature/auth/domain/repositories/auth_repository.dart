import 'package:ionhive/feature/auth/data/api.dart'; // Api data
import 'package:ionhive/feature/auth/domain/models/auth_model.dart'; // Models

class AuthRepository {
  final AuthAPICalls _api = AuthAPICalls();

  Future<GetOtpResponse> GetOTP(String email) async {
    try {
      final responseJson = await _api.GetOTP(email);

      return GetOtpResponse.fromJson(responseJson); // Parse JSON to model
    } catch (e) {
      rethrow; // Re-throw the error to be handled by the controller
    }
  }

  Future<OtpVerificationResponse> authenticateOTP(String email, int otp) async {
    try {
      final responseJson = await _api.authenticateOTP(email, otp);

      return OtpVerificationResponse.fromJson(
          responseJson); // Parse JSON to model
    } catch (e) {
      rethrow; // Re-throw the error to be handled by the controller
    }
  }

  Future<GoogleOAuthVerificationResponse> GoogleSignIN(String idToken) async {
    try {
      final responseJson = await _api.GoogleSignIN(idToken);

      return GoogleOAuthVerificationResponse.fromJson(
          responseJson); // Parse JSON to model
    } catch (e) {
      rethrow; // Re-throw the error to be handled by the controller
    }
  }

  Future<AppleOAuthVerificationResponse> AppleSignIN(String idToken) async {
    try {
      final responseJson = await _api.AppleSignIN(idToken);

      return AppleOAuthVerificationResponse.fromJson(
          responseJson); // Parse JSON to model
    } catch (e) {
      rethrow; // Re-throw the error to be handled by the controller
    }
  }
}
