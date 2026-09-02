import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_app/features/auth/data/auth_repository.dart';
import 'package:mobile_app/features/auth/data/token_storage.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/features/dashboard/data/parent_ai_chat_repository.dart';
import 'package:mobile_app/features/dashboard/models/parent_ai_chat_models.dart';
import 'package:mobile_app/features/dashboard/providers/parent_ai_chat_provider.dart';

const patientA = '33333333-3333-4333-8333-333333333333';
const patientB = '44444444-4444-4444-8444-444444444444';

class _ImmediateAuthNotifier extends AuthNotifier {
  _ImmediateAuthNotifier(super.repository, super.tokenStorage) {
    state = const AuthState(token: 'test-token', isInitializing: false);
  }

  @override
  Future<void> restoreSession() async {}
}

class _FakeParentAiChatRepository extends ParentAiChatRepository {
  _FakeParentAiChatRepository(this._handler) : super(Dio());

  final Future<dynamic> Function(String method, String path, Map<String, dynamic>? body)
      _handler;

  @override
  Future<List<ParentAiChatConversation>> fetchConversations({
    required String patientId,
  }) async {
    final result = await _handler('GET', '/ai/chat/conversations?patient_id=$patientId', null);
    return (result as List)
        .cast<ParentAiChatConversation>()
        .where((item) => item.patientId == patientId)
        .toList();
  }

  @override
  Future<ParentAiChatConversation> createConversation({
    required String patientId,
  }) async {
    final result = await _handler('POST', '/ai/chat/conversations', {
      'patient_id': patientId,
    });
    return result as ParentAiChatConversation;
  }

  @override
  Future<List<ParentAiChatMessage>> fetchMessages(String conversationId) async {
    final result = await _handler('GET', '/ai/chat/conversations/$conversationId/messages', null);
    return (result as List).cast<ParentAiChatMessage>();
  }

  @override
  Future<ParentAiChatSendResult> sendMessage({
    required String conversationId,
    required String content,
    required String patientId,
  }) async {
    final result = await _handler('POST', '/ai/chat/conversations/$conversationId/messages', {
      'content': content,
      'patient_id': patientId,
    });
    return result as ParentAiChatSendResult;
  }
}

ProviderContainer _createContainer(
  _FakeParentAiChatRepository repository,
) {
  return ProviderContainer(
    overrides: [
      authProvider.overrideWith((ref) {
        return _ImmediateAuthNotifier(
          ref.watch(authRepositoryProvider),
          ref.watch(tokenStorageProvider),
        );
      }),
      parentAiChatRepositoryProvider.overrideWithValue(repository),
    ],
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('initialize picks conversation for selected child only', () async {
    final container = _createContainer(
      _FakeParentAiChatRepository((method, path, body) async {
        if (path.contains(patientA)) {
          return [
            ParentAiChatConversation(
              id: 'conv-a',
              patientId: patientA,
            ),
          ];
        }
        return [
          ParentAiChatConversation(
            id: 'conv-b',
            patientId: patientB,
          ),
        ];
      }),
    );
    addTearDown(container.dispose);

    await container.read(parentAiChatProvider(patientA).notifier).initialize(
          patientName: 'Child A',
        );

    final stateA = container.read(parentAiChatProvider(patientA));
    expect(stateA.conversationId, 'conv-a');
    expect(stateA.patientId, patientA);
    expect(stateA.patientName, 'Child A');
  });

  test('opening child B after child A does not reuse child A conversation', () async {
    final container = _createContainer(
      _FakeParentAiChatRepository((method, path, body) async {
        if (path.contains('patient_id=$patientA')) {
          return [
            ParentAiChatConversation(id: 'conv-a', patientId: patientA),
          ];
        }
        if (path.contains('patient_id=$patientB')) {
          return [
            ParentAiChatConversation(id: 'conv-b', patientId: patientB),
          ];
        }
        return const <ParentAiChatConversation>[];
      }),
    );
    addTearDown(container.dispose);

    await container.read(parentAiChatProvider(patientA).notifier).initialize(
          patientName: 'Child A',
        );
    await container.read(parentAiChatProvider(patientB).notifier).initialize(
          patientName: 'Child B',
        );

    expect(container.read(parentAiChatProvider(patientA)).conversationId, 'conv-a');
    expect(container.read(parentAiChatProvider(patientB)).conversationId, 'conv-b');
  });

  test('missing patientId fails safely without API calls', () async {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    await container.read(parentAiChatProvider('').notifier).initialize(
          patientName: 'Missing',
        );

    final state = container.read(parentAiChatProvider(''));
    expect(state.conversationId, isNull);
    expect(state.errorMessage, isNotNull);
    expect(state.errorMessage, contains('child must be selected'));
  });

  test('sendMessage always includes patient_id in repository call', () async {
    String? capturedPatientId;

    final container = _createContainer(
      _FakeParentAiChatRepository((method, path, body) async {
        if (method == 'GET' && path.contains('conversations?')) {
          return [
            ParentAiChatConversation(id: 'conv-a', patientId: patientA),
          ];
        }
        if (method == 'GET' && path.endsWith('/messages')) {
          return const <ParentAiChatMessage>[];
        }
        if (method == 'POST' && path.endsWith('/messages')) {
          capturedPatientId = body?['patient_id'] as String?;
          return ParentAiChatSendResult(
            userMessage: ParentAiChatMessage(
              id: 'u1',
              conversationId: 'conv-a',
              sender: 'user',
              content: 'Hello',
            ),
            botMessage: ParentAiChatMessage(
              id: 'b1',
              conversationId: 'conv-a',
              sender: 'bot',
              content: 'Hi',
            ),
            conversation: ParentAiChatConversation(
              id: 'conv-a',
              patientId: patientA,
            ),
          );
        }
        throw UnimplementedError('$method $path');
      }),
    );
    addTearDown(container.dispose);

    await container.read(parentAiChatProvider(patientA).notifier).initialize(
          patientName: 'Child A',
        );
    await container.read(parentAiChatProvider(patientA).notifier).sendMessage('Hello');

    expect(capturedPatientId, patientA);
  });
}
