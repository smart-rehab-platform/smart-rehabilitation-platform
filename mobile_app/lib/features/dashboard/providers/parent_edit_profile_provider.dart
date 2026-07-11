import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../data/parent_profile_repository.dart';
import '../models/parent_profile_models.dart';
import '../models/specialist_profile_models.dart';
import '../widgets/profile_image_picker.dart';
import 'parent_profile_provider.dart';
import 'parent_dashboard_provider.dart';

class ParentEditProfileState {
  const ParentEditProfileState({
    this.isLoading = false,
    this.isSaving = false,
    this.errorMessage,
    this.validationMessage,
    this.profileId,
    this.profileImageUrl,
    this.pendingImageBytes,
    this.pendingImageFilename,
    this.fullName = '',
    this.phone = '',
    this.address = '',
    this.relationshipNotes = '',
  });

  final bool isLoading;
  final bool isSaving;
  final String? errorMessage;
  final String? validationMessage;
  final String? profileId;
  final String? profileImageUrl;
  final Uint8List? pendingImageBytes;
  final String? pendingImageFilename;
  final String fullName;
  final String phone;
  final String address;
  final String relationshipNotes;

  ParentEditProfileState copyWith({
    bool? isLoading,
    bool? isSaving,
    Object? errorMessage = _sentinel,
    Object? validationMessage = _sentinel,
    String? profileId,
    String? profileImageUrl,
    Uint8List? pendingImageBytes,
    String? pendingImageFilename,
    bool clearPendingImage = false,
    String? fullName,
    String? phone,
    String? address,
    String? relationshipNotes,
  }) {
    return ParentEditProfileState(
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      validationMessage: identical(validationMessage, _sentinel)
          ? this.validationMessage
          : validationMessage as String?,
      profileId: profileId ?? this.profileId,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      pendingImageBytes: clearPendingImage
          ? null
          : (pendingImageBytes ?? this.pendingImageBytes),
      pendingImageFilename: clearPendingImage
          ? null
          : (pendingImageFilename ?? this.pendingImageFilename),
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      relationshipNotes: relationshipNotes ?? this.relationshipNotes,
    );
  }
}

final parentEditProfileProvider =
    StateNotifierProvider<ParentEditProfileNotifier, ParentEditProfileState>(
      (ref) => ParentEditProfileNotifier(
        ref,
        ref.watch(parentProfileRepositoryProvider),
      ),
    );

class ParentEditProfileNotifier extends StateNotifier<ParentEditProfileState> {
  ParentEditProfileNotifier(this._ref, this._repository)
    : super(const ParentEditProfileState());

  final Ref _ref;
  final ParentProfileRepository _repository;

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
      final cached = _ref.read(parentProfileProvider).bundle;
      final bundle = cached ?? await _repository.fetchProfileBundle(userId);

      state = state.copyWith(
        isLoading: false,
        profileId: bundle.profileId,
        profileImageUrl: bundle.profileImageUrl,
        fullName: bundle.fullName,
        phone: bundle.phone ?? '',
        address: bundle.address ?? '',
        relationshipNotes: bundle.relationshipNotes ?? '',
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
  void setAddress(String value) => state = state.copyWith(address: value);
  void setRelationshipNotes(String value) =>
      state = state.copyWith(relationshipNotes: value);

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

  UpdateParentProfileInput _parentProfileInput() {
    return UpdateParentProfileInput(
      address: _nullableTrim(state.address),
      relationshipNotes: _nullableTrim(state.relationshipNotes),
    );
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

      final parentInput = _parentProfileInput();
      final profileId = state.profileId;

      if (profileId != null && profileId.isNotEmpty) {
        await _repository.updateParentProfile(profileId, parentInput);
      } else {
        final created = await _repository.createParentProfile(parentInput);
        state = state.copyWith(profileId: created.profileId);
      }
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
      await _ref.read(parentProfileProvider.notifier).refresh();
      _ref.read(parentDashboardProvider.notifier).syncUserFromAuth();

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
