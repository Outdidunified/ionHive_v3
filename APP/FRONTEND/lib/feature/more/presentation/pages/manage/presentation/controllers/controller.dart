import 'package:get/get.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/domain/manage_model.dart';
import 'package:ionhive/feature/more/presentation/pages/manage/domain/manage_repository.dart';

class ManageController extends GetxController {
  final Managerepository repository = Managerepository();
  Rx<Fetchrfidmodel?> rfidData = Rx<Fetchrfidmodel?>(null);
  RxBool isLoading = false.obs;

  Future<void> fetchRFIDData(String email, String token) async {
    try {
      isLoading.value = true;

      final Fetchrfidmodel response = await repository.Fetchrfid(email, token);

      if (response.error) {
        // Get.snackbar("Message", response.message);
        // print(response.message);
      } else {
        // final message = response.message; // ✅ Extract message object
        // print(message);
        // Get.snackbar(
        //     "Success",
        //     "RFID: ${message['tag_id']}, Assigned: ${message['tag_id_assigned']}"
        // );
      }

      // Store the response
      rfidData.value = response;
    } catch (e) {
      Get.snackbar("Error", "An unexpected error occurred: ${e.toString()}");
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> Deactivaterfidc(String email, String token ,int userid,String tagid, bool status) async {
    try {
      isLoading.value = true;

      final DeactivateRfid response = await repository.DeactivateRfidrep(email,token,userid,tagid,status);

      if (response.error) {
        // Get.snackbar("Message", response.message);
        // print(response.message);
      } else {
        // final message = response.message; // ✅ Extract message object
        // print(message);
        // Get.snackbar(
        //     "Success",
        //     "RFID: ${message['tag_id']}, Assigned: ${message['tag_id_assigned']}"
        // );
      }

      // Store the response
    } catch (e) {
      Get.snackbar("Error", "An unexpected error occurred: ${e.toString()}");
      // print("An unexpected error occurred: ${e.toString()}");
    } finally {
      isLoading.value = false;
    }
  }
}

