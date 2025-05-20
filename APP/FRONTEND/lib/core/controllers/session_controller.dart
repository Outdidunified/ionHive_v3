import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

// In session_controller.dart
// SessionController
class SessionController extends GetxController {
  var isLoggedIn = false.obs;
  var userId = 0.obs;
  var username = ''.obs;
  var token = ''.obs;
  var emailId = ''.obs;

  @override
  void onInit() {
    super.onInit();
    loadSession();
  }

  // Load session from shared preferences
  Future<void> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    isLoggedIn.value = prefs.getBool('isLoggedIn') ?? false;
    userId.value = prefs.getInt('userId') ?? 0;
    username.value = prefs.getString('username') ?? '';
    emailId.value = prefs.getString('emailId') ?? '';
    token.value = prefs.getString('token') ?? '';
  }

  // Save session to shared preferences
  Future<void> saveSession({
    required int userId,
    required String emailId,
    required String token,
    String? username,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isLoggedIn', true);
    await prefs.setInt('userId', userId);
    await prefs.setString('emailId', emailId);
    await prefs.setString('token', token);
    // Only save username if it's not null
    if (username != null && username.isNotEmpty) {
      await prefs.setString('username', username);
      this.username.value = username; // Update username only if provided
    }
    isLoggedIn.value = true;
    this.userId.value = userId;
    this.emailId.value = emailId;
    this.token.value = token;
  }

  // Clear session data
  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    isLoggedIn.value = false;
    userId.value = 0;
    username.value = '';
    token.value = '';
    emailId.value = '';
  }
}
