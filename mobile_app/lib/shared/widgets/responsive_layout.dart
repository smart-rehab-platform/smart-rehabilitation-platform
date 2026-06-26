import 'package:flutter/material.dart';

extension ResponsiveLayout on BuildContext {
  Size get screenSize => MediaQuery.sizeOf(this);

  EdgeInsets get responsivePadding => EdgeInsets.symmetric(
        horizontal: screenSize.width * 0.06,
        vertical: screenSize.height * 0.02,
      );

  double get spacingUnit => screenSize.width * 0.04;

  double get controlHeight =>
      (screenSize.height * 0.065).clamp(kMinInteractiveDimension, double.infinity);

  double get iconSize => screenSize.width * 0.06;

  double get logoSize => screenSize.width * 0.22;
}
