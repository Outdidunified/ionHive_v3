import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:ionhive/core/controllers/session_controller.dart';
import 'package:ionhive/feature/more/presentation/pages/help&support/domain/model/chatbot_model.dart';

class ChatController extends GetxController {
  final sessionController = Get.find<SessionController>();

  var messages = <ChatMessage>[].obs;

  Future<void> sendMessage(String message) async {
    messages.add(ChatMessage(text: message, isUserMessage: true));

    final authToken = sessionController.token.value;
    try {
      final response = await http.post(
        Uri.parse(
            'http://192.168.1.10:3003/profile/chatbot'), // ← Replace with actual API
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: jsonEncode({'message': message}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final botReply = data['message'] ?? "Sorry, I didn't understand that.";
        messages.add(ChatMessage(text: botReply, isUserMessage: false));
      } else {
        messages.add(ChatMessage(
            text: "Server error. Try again later.", isUserMessage: false));
      }
    } catch (e) {
      messages.add(ChatMessage(
          text: "Error: Unable to connect to server.", isUserMessage: false));
    }
  }
}
