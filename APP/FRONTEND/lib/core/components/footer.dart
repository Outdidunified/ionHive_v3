import 'package:flutter/material.dart';

class Footer extends StatelessWidget {
  final Function(int) onTabChanged;
  final int currentIndex;

  const Footer({
    super.key,
    required this.onTabChanged,
    required this.currentIndex,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: EdgeInsets.zero,
      padding: EdgeInsets.zero,
      child: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: currentIndex,
        onTap: onTabChanged,
        selectedItemColor: theme.primaryColor,
        unselectedItemColor: theme.iconTheme.color,
        backgroundColor: theme.scaffoldBackgroundColor,
        elevation: 0,
        items: [
          BottomNavigationBarItem(
            icon: Image.asset(
              currentIndex == 0
                  ? 'assets/icons/home.png'  // Active icon
                  : 'assets/icons/home_n.png', // Inactive icon
            width: 22,
              height: 22,
              color: currentIndex == 0 ? theme.primaryColor : theme.iconTheme.color,
            ),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Image.asset(
              currentIndex == 1
                  ? 'assets/icons/walleta.png'  // Active icon
                  : 'assets/icons/wallet.png', // Inactive icon
            width: 22,
              height: 22,
              color: currentIndex == 1 ? theme.primaryColor : theme.iconTheme.color,
            ),
            label: 'Wallet',
          ),
          BottomNavigationBarItem(
            icon: Image.asset(
              currentIndex == 2
                  ? 'assets/icons/history.png'  // Active icon
                  : 'assets/icons/historyn.png', // Inactive icon
            width: 22,
              height: 22,
              color: currentIndex == 2 ? theme.primaryColor : theme.iconTheme.color,
            ),
            label: 'History',
          ),
          BottomNavigationBarItem(
            icon: Image.asset(
              currentIndex == 3
                  ? 'assets/icons/more.png'  // Active icon
                  : 'assets/icons/application.png', // Inactive icon
            width: 22,
              height: 22,
              color: currentIndex == 3 ? theme.primaryColor : theme.iconTheme.color,
            ),
            label: 'More',
          ),
        ],
      ),
    );
  }
}