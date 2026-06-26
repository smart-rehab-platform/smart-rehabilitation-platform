import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';

import '../../../core/services/api_client.dart';
import '../data/auth_repository.dart';
import '../data/token_storage.dart';
import '../models/auth_response.dart';
import '../models/auth_user.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthRepository(dio);
});

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return const TokenStorage();
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  final tokenStorage = ref.watch(tokenStorageProvider);
  return AuthNotifier(repository, tokenStorage);
});

class AuthState {
  const AuthState({
    this.user,
    this.token,
    this.isLoading = false,
    this.errorMessage,
  });

  final AuthUser? user;
  final String? token;
  final bool isLoading;
  final String? errorMessage;

  bool get isAuthenticated => token != null && token!.isNotEmpty;

  AuthState copyWith({
    Object? user = _sentinel,
    Object? token = _sentinel,
    bool? isLoading,
    Object? errorMessage = _sentinel,
  }) {
    return AuthState(
      user: identical(user, _sentinel) ? this.user : user as AuthUser?,
      token: identical(token, _sentinel) ? this.token : token as String?,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._repository, this._tokenStorage) : super(const AuthState());

  final AuthRepository _repository;
  final TokenStorage _tokenStorage;

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final response = await _repository.login(
        email: email,
        password: password,
      );

      return await _handleAuthSuccess(
        response,
        persistToken: true,
      );
    } on DioException catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _readDioErrorMessage(error),
      );
      return false;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Login failed: $error',
      );
      return false;
    }
  }

  Future<bool> register({
    required String fullName,
    required String email,
    required String password,
    required String phone,
    required String role,
    String? profileImageUrl,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final response = await _repository.register(
        fullName: fullName,
        email: email,
        password: password,
        phone: phone,
        role: role,
        profileImageUrl: profileImageUrl,
      );

      return await _handleAuthSuccess(
        response,
        persistToken: false,
      );
    } on DioException catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _readDioErrorMessage(error),
      );
      return false;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Registration failed: $error',
      );
      return false;
    }
  }

  Future<void> fetchCurrentUser() async {
    if (state.token == null || state.token!.isEmpty) {
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final user = await _repository.getMe();
      state = state.copyWith(
        user: user,
        isLoading: false,
      );
    } on DioException catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _readDioErrorMessage(error),
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load current user: $error',
      );
    }
  }

  Future<void> logout() async {
    await _tokenStorage.clearToken();
    await _repository.logout();
    state = const AuthState();
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }

  Future<bool> _handleAuthSuccess(
    AuthResponse response, {
    required bool persistToken,
  }) async {
    final token = response.token;
    if (token == null || token.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: response.message ?? 'Authentication token was not returned.',
      );
      return false;
    }

    _repository.setAuthToken(token);
    if (persistToken) {
      await _tokenStorage.saveToken(token);
    }

    var user = response.user;
    user ??= await _repository.getMe();

    state = state.copyWith(
      token: token,
      user: user,
      isLoading: false,
      errorMessage: null,
    );

    return state.isAuthenticated;
  }

  String _readDioErrorMessage(DioException error) {
    final data = error.response?.data;
    if (data is Map<String, dynamic>) {
      return _readMapMessage(data) ?? error.message ?? 'Request failed.';
    }

    if (data is Map) {
      final normalized = data.map(
        (key, value) => MapEntry(key.toString(), value),
      );
      return _readMapMessage(normalized) ?? error.message ?? 'Request failed.';
    }

    if (data is String && data.trim().isNotEmpty) {
      return data.trim();
    }

    return error.message ?? 'Request failed.';
  }

  String? _readMapMessage(Map<String, dynamic> map, [int depth = 0]) {
    if (depth > 3) {
      return null;
    }

    for (final key in const ['message', 'error', 'detail']) {
      final value = map[key];
      if (value is String && value.trim().isNotEmpty) {
        return value.trim();
      }
    }

    for (final key in const ['data', 'result', 'payload']) {
      final value = map[key];
      if (value is Map<String, dynamic>) {
        final nested = _readMapMessage(value, depth + 1);
        if (nested != null) {
          return nested;
        }
      } else if (value is Map) {
        final normalized = value.map(
          (nestedKey, nestedValue) => MapEntry(nestedKey.toString(), nestedValue),
        );
        final nested = _readMapMessage(normalized, depth + 1);
        if (nested != null) {
          return nested;
        }
      }
    }

    return null;
  }
}

const _sentinel = Object();