import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/admin_profile_repository.dart';
import '../models/specialist_profile_models.dart';
import '../widgets/profile_image_picker.dart';

final adminProfileRepositoryProvider = Provider<AdminProfileRepository>((ref) {
  return AdminProfileRepository(ref.watch(dioProvider));
});

class AdminEditProfileState {
  const AdminEditProfileState({
    this.isLoading = true,
    this.isSaving = false,
    this.errorMessage,
    this.validationMessage,
    this.profileImageUrl,
    this.pendingImageBytes,
    this.pendingImageFilename,
    this.fullName = '',
    this.phone = '',
  });

  final bool isLoading;
  final bool isSaving;
  final String? errorMessage;
  final String? validationMessage;
  final String? profileImageUrl;
  final Uint8List? pendingImageBytes;
  final String? pendingImageFilename;
  final String fullName;
  final String phone;

  AdminEditProfileState copyWith({
    bool? isLoading,
    bool? isSaving,
    Object? errorMessage = _sentinel,
    Object? validationMessage = _sentinel,
    String? profileImageUrl,
    Uint8List? pendingImageBytes,
    String? pendingImageFilename,
    bool clearPendingImage = false,
    String? fullName,
    String? phone,
  }) {
    return AdminEditProfileState(
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      validationMessage: identical(validationMessage, _sentinel)
          ? this.validationMessage
          : validationMessage as String?,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      pendingImageBytes: clearPendingImage
          ? null
          : (pendingImageBytes ?? this.pendingImageBytes),
      pendingImageFilename: clearPendingImage
          ? null
          : (pendingImageFilename ?? this.pendingImageFilename),
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
    );
  }
}

final adminEditProfileProvider =
    StateNotifierProvider<AdminEditProfileNotifier, AdminEditProfileState>(
      (ref) => AdminEditProfileNotifier(
        ref,
        ref.watch(adminProfileRepositoryProvider),
      ),
    );

class AdminEditProfileNotifier extends StateNotifier<AdminEditProfileState> {
  AdminEditProfileNotifier(this._ref, this._repository)
    : super(const AdminEditProfileState());

  final Ref _ref;
  final AdminProfileRepository _repository;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  Future<void> initialize() async {
    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      state = state.copyWith(isLoading: false, errorMessage: 'Not signed in');
      return;
    }

    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final bundle = await _repository.fetchProfileBundle(userId);

      state = state.copyWith(
        isLoading: false,
        profileImageUrl: bundle.profileImageUrl,
        fullName: bundle.fullName,
        phone: bundle.phone ?? '',
        clearPendingImage: true,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load profile: $error',
      );
    }
  }

  void setFullName(String value) => state = state.copyWith(fullName: value);
  void setPhone(String value) => state = state.copyWith(phone: value);

  void setPendingProfileImage(ProfileImagePickerResult result) {
    state = state.copyWith(
      pendingImageBytes: result.bytes,
      pendingImageFilename: result.filename,
      errorMessage: null,
      validationMessage: null,
    );
  }

  String? _validate() {
    if (state.fullName.trim().isEmpty) {
      return 'Full name is required';
    }
    return null;
  }

  String? _nullableTrim(String value) {
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  Future<bool> save() async {
    if (state.isSaving) {
      return false;
    }

    final validation = _validate();
    if (validation != null) {
      state = state.copyWith(validationMessage: validation);
      return false;
    }

    _ensureAuthToken();
    state = state.copyWith(
      isSaving: true,
      errorMessage: null,
      validationMessage: null,
    );

    try {
      await _repository.updateMyUserProfile(
        UpdateUserProfileInput(
          fullName: state.fullName.trim(),
          phone: _nullableTrim(state.phone),
        ),
      );
    } catch (error) {
      state = state.copyWith(
        isSaving: false,
        errorMessage: 'Failed to save profile: $error',
      );
      return false;
    }

    try {
      await uploadPendingProfileImage(
        ref: _ref,
        pendingImageBytes: state.pendingImageBytes,
        pendingImageFilename: state.pendingImageFilename,
      );
    } catch (error) {
      state = state.copyWith(
        isSaving: false,
        errorMessage:
            'Profile details were saved, but the image upload failed: $error',
      );
      return false;
    }

    try {
      await _ref.read(authProvider.notifier).fetchCurrentUser();

      state = state.copyWith(
        isSaving: false,
        clearPendingImage: true,
        profileImageUrl: _ref.read(authProvider).user?.profileImageUrl,
      );
      return true;
    } catch (error) {
      state = state.copyWith(
        isSaving: false,
        errorMessage: 'Profile saved, but refresh failed: $error',
      );
      return false;
    }
  }
}

const _sentinel = Object();
