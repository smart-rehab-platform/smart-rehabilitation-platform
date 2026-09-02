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
  final notifier = AuthNotifier(repository, tokenStorage);
  notifier.restoreSession();
  return notifier;
});

class AuthState {
  const AuthState({
    this.user,
    this.token,
    this.isLoading = false,
    this.isInitializing = true,
    this.errorMessage,
  });

  final AuthUser? user;
  final String? token;
  final bool isLoading;
  final bool isInitializing;
  final String? errorMessage;

  bool get isAuthenticated => token != null && token!.isNotEmpty;

  AuthState copyWith({
    Object? user = _sentinel,
    Object? token = _sentinel,
    bool? isLoading,
    bool? isInitializing,
    Object? errorMessage = _sentinel,
  }) {
    return AuthState(
      user: identical(user, _sentinel) ? this.user : user as AuthUser?,
      token: identical(token, _sentinel) ? this.token : token as String?,
      isLoading: isLoading ?? this.isLoading,
      isInitializing: isInitializing ?? this.isInitializing,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._repository, this._tokenStorage)
    : super(const AuthState(isInitializing: true));

  final AuthRepository _repository;
  final TokenStorage _tokenStorage;

  Future<void> restoreSession() async {
    try {
      final rememberMe = await _tokenStorage.getRememberMe();
      final token = await _tokenStorage.getToken();

      if (!rememberMe || token == null || token.isEmpty) {
        if (!rememberMe) {
          await _tokenStorage.clearToken();
        }
        state = state.copyWith(isInitializing: false);
        return;
      }

      _repository.setAuthToken(token);
      final user = await _repository.getMe();
      if (user == null) {
        await _tokenStorage.clearToken();
        await _repository.logout();
        state = const AuthState(isInitializing: false);
        return;
      }

      state = AuthState(token: token, user: user, isInitializing: false);
    } catch (_) {
      await _tokenStorage.clearToken();
      await _repository.logout();
      state = const AuthState(isInitializing: false);
    }
  }

  Future<bool> login({
    required String email,
    required String password,
    bool rememberMe = false,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final response = await _repository.login(
        email: email,
        password: password,
      );

      final success = await _handleAuthSuccess(
        response,
        persistToken: rememberMe,
      );

      if (success) {
        await _tokenStorage.saveRememberMe(rememberMe);
        if (rememberMe) {
          await _tokenStorage.saveEmail(email.trim());
        } else {
          await _tokenStorage.clearToken();
          await _tokenStorage.clearSavedEmail();
        }
      }

      return success;
    } on DioException catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _readDioErrorMessage(error),
      );
      return false;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Unable to sign in right now. Please try again.',
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
    Map<String, dynamic>? specialistProfile,
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
        specialistProfile: specialistProfile,
      );

      state = state.copyWith(isLoading: false, errorMessage: null);

      return response.rawData.isNotEmpty || response.message != null;
    } on DioException catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _readDioErrorMessage(error),
      );
      return false;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage:
            'Unable to create your account right now. Please try again.',
      );
      return false;
    }
  }

  Future<String?> forgotPassword({required String email}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final message = await _repository.forgotPassword(email: email);
      state = state.copyWith(isLoading: false, errorMessage: null);
      return message;
    } on DioException catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _readDioErrorMessage(error),
      );
      return null;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage:
            'Unable to send the reset link right now. Please try again.',
      );
      return null;
    }
  }

  Future<String?> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final message = await _repository.resetPassword(
        token: token,
        newPassword: newPassword,
      );
      state = state.copyWith(isLoading: false, errorMessage: null);
      return message;
    } on DioException catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _readDioErrorMessage(error),
      );
      return null;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage:
            'Unable to reset your password right now. Please try again.',
      );
      return null;
    }
  }

  Future<String?> verifyEmail({required String token}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final message = await _repository.verifyEmail(token: token);
      state = state.copyWith(isLoading: false, errorMessage: null);
      return message;
    } on DioException catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _readDioErrorMessage(error),
      );
      return null;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage:
            'Unable to verify your email right now. Please try again later.',
      );
      return null;
    }
  }

  Future<String?> sendVerification({required String email}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final message = await _repository.sendVerification(email: email);
      state = state.copyWith(isLoading: false, errorMessage: null);
      return message;
    } on DioException catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _readDioErrorMessage(error),
      );
      return null;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage:
            'Unable to send the verification email right now. Please try again.',
      );
      return null;
    }
  }

  Future<AuthUser?> fetchCurrentUser() async {
    if (state.token == null || state.token!.isEmpty) {
      return state.user;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final fetched = await _repository.getMe();
      final user = _mergeUser(state.user, fetched);
      state = state.copyWith(user: user, isLoading: false);
      return user;
    } on DioException catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _readDioErrorMessage(error),
      );
      return null;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Unable to load your account details right now.',
      );
      return null;
    }
  }

  Future<String?> uploadSignupProfileImage(
    List<int> bytes,
    String filename,
  ) async {
    try {
      return await _repository.uploadSignupProfileImage(bytes, filename);
    } on DioException catch (error) {
      state = state.copyWith(errorMessage: _readDioErrorMessage(error));
      return null;
    } catch (error) {
      state = state.copyWith(
        errorMessage: 'Failed to upload profile image: $error',
      );
      return null;
    }
  }

  Future<bool> uploadProfileImage(List<int> bytes, String filename) async {
    try {
      await _repository.uploadProfileImage(bytes, filename);
      final fetched = await _repository.getMe();
      final user = _mergeUser(state.user, fetched);
      if (user == null) {
        state = state.copyWith(
          errorMessage: 'Photo uploaded but profile could not be refreshed.',
        );
        return false;
      }

      state = state.copyWith(user: user, errorMessage: null);
      return true;
    } on DioException catch (error) {
      state = state.copyWith(errorMessage: _readDioErrorMessage(error));
      return false;
    } catch (error) {
      state = state.copyWith(
        errorMessage: 'Failed to upload profile image: $error',
      );
      return false;
    }
  }

  Future<void> logout({bool clearRememberedLogin = false}) async {
    state = const AuthState();
    await _tokenStorage.clearToken();
    if (clearRememberedLogin) {
      await _tokenStorage.clearSession();
    }
    await _repository.logout();
  }

  Future<({bool rememberMe, String? email})> loadRememberedLogin() async {
    final rememberMe = await _tokenStorage.getRememberMe();
    final email = rememberMe ? await _tokenStorage.getSavedEmail() : null;
    return (rememberMe: rememberMe, email: email);
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }

  AuthUser? _mergeUser(AuthUser? current, AuthUser? fetched) {
    if (fetched == null) {
      return current;
    }
    if (current == null) {
      return fetched;
    }

    return AuthUser(
      id: fetched.id ?? current.id,
      fullName: fetched.fullName.isNotEmpty
          ? fetched.fullName
          : current.fullName,
      email: fetched.email.isNotEmpty ? fetched.email : current.email,
      phone: fetched.phone ?? current.phone,
      role: fetched.role ?? current.role,
      verificationStatus:
          fetched.verificationStatus ?? current.verificationStatus,
      profileImageUrl: fetched.profileImageUrl ?? current.profileImageUrl,
      rawData: fetched.rawData.isNotEmpty ? fetched.rawData : current.rawData,
    );
  }

  Future<bool> _handleAuthSuccess(
    AuthResponse response, {
    required bool persistToken,
    bool allowMissingToken = false,
  }) async {
    final token = response.token;
    if (token == null || token.isEmpty) {
      if (allowMissingToken) {
        state = state.copyWith(
          isLoading: false,
          isInitializing: false,
          errorMessage: null,
        );
        return true;
      }

      state = state.copyWith(
        isLoading: false,
        errorMessage:
            response.message ?? 'Authentication token was not returned.',
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
      isInitializing: false,
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
          (nestedKey, nestedValue) =>
              MapEntry(nestedKey.toString(), nestedValue),
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
