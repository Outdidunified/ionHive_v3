import 'package:get/get.dart';
import 'package:flutter_swiper_null_safety/flutter_swiper_null_safety.dart';


class BannerController extends GetxController{
  final List<String> imageList = [

    "assets/Image/banner1.jpg",
    "assets/Image/banner4.jpg",
    "assets/Image/banner3.png",
  ];
  var currentIndex = 0.obs;
  final SwiperController swiperController = SwiperController();

  @override
  void onClose() {
    swiperController.dispose();
    super.onClose();
  }

  void updateIndex(int index) {
    currentIndex.value = index;
  }
}
