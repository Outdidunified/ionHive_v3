import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ionhive/feature/more/presentation/pages/help&support/domain/model/chatbot_model.dart';
import 'package:ionhive/feature/more/presentation/pages/help&support/presentation/controllers/chatbot_controller.dart';

class ChatBotPage extends StatelessWidget {
  final ChatController chatController =
      Get.put(ChatController(), permanent: true);
  final TextEditingController inputController = TextEditingController();

  ChatBotPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("ChatBot")),
      body: Column(
        children: [
          Expanded(
            child: Obx(() {
              return ListView.builder(
                padding: const EdgeInsets.all(10),
                itemCount: chatController.messages.length,
                itemBuilder: (context, index) {
                  final ChatMessage msg = chatController.messages[index];
                  return Align(
                    alignment: msg.isUserMessage
                        ? Alignment.centerRight
                        : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 5),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color:
                            msg.isUserMessage ? Colors.blue : Colors.grey[300],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        msg.text,
                        style: TextStyle(
                          color:
                              msg.isUserMessage ? Colors.white : Colors.black,
                        ),
                      ),
                    ),
                  );
                },
              );
            }),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            color: Colors.white,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: inputController,
                    decoration: InputDecoration(
                      hintText: "Type a message...",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: () {
                    if (inputController.text.trim().isNotEmpty) {
                      chatController.sendMessage(inputController.text.trim());
                      inputController.clear();
                    }
                  },
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
