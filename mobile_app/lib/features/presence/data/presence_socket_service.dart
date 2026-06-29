import 'package:socket_io_client/socket_io_client.dart' as io;

import '../../../core/constants/api_constants.dart';
import '../models/presence_status.dart';

typedef PresenceEventHandler = void Function(PresenceStatus status);

class PresenceSocketService {
  io.Socket? _socket;

  bool get isConnected => _socket?.connected ?? false;

  void connect({
    required String token,
    required PresenceEventHandler onUserOnline,
    required PresenceEventHandler onUserOffline,
    void Function(Object error)? onError,
  }) {
    disconnect();

    _socket = io.io(
      ApiConstants.serverOrigin,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );

    _socket!
      ..onConnect((_) {})
      ..onConnectError((error) => onError?.call(error))
      ..onError((error) => onError?.call(error))
      ..on('presence:user_online', (data) {
        final status = _parseEvent(data, isOnline: true);
        if (status != null) {
          onUserOnline(status);
        }
      })
      ..on('presence:user_offline', (data) {
        final status = _parseEvent(data, isOnline: false);
        if (status != null) {
          onUserOffline(status);
        }
      });

    _socket!.connect();
  }

  Future<void> disconnect() async {
    final socket = _socket;
    _socket = null;

    if (socket == null) {
      return;
    }

    socket
      ..clearListeners()
      ..disconnect();
    socket.dispose();
  }

  PresenceStatus? _parseEvent(dynamic data, {required bool isOnline}) {
    if (data is! Map) {
      return null;
    }

    final map = data.map((key, value) => MapEntry(key.toString(), value));
    final userId = (map['user_id'] ?? map['userId'] ?? map['id'] ?? '').toString();
    if (userId.isEmpty) {
      return null;
    }

    DateTime? lastSeen;
    final lastSeenRaw = map['last_seen'] ?? map['lastSeen'];
    if (lastSeenRaw is String && lastSeenRaw.isNotEmpty) {
      lastSeen = DateTime.tryParse(lastSeenRaw);
    }

    return PresenceStatus(
      userId: userId,
      isOnline: isOnline,
      lastSeen: isOnline ? null : lastSeen,
    );
  }
}
