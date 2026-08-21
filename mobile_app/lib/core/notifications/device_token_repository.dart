import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/api_client.dart';

class DeviceTokenRepository {
  DeviceTokenRepository(this._dio);

  final Dio _dio;

  Future<void> registerDeviceToken({required String deviceToken}) async {
    final trimmed = deviceToken.trim();
    if (trimmed.isEmpty) {
      return;
    }

    await _dio.post(
      '/notifications/device-tokens',
      data: <String, dynamic>{
        'device_token': trimmed,
        'platform': 'android',
      },
    );
  }
}

final deviceTokenRepositoryProvider = Provider<DeviceTokenRepository>((ref) {
  return DeviceTokenRepository(ref.watch(dioProvider));
});
