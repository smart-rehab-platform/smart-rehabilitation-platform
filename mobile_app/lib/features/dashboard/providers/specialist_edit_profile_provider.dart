import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../data/specialist_profile_repository.dart';
import '../models/specialist_profile_models.dart';
import '../widgets/profile_image_picker.dart';
import 'specialist_profile_provider.dart';
import 'specialist_dashboard_provider.dart';

class SpecialistEditProfileState {
  const SpecialistEditProfileState({
    this.isLoading = true,
    this.isSaving = false,
    this.errorMessage,
    this.validationMessage,
    this.profileId,
    this.profileImageUrl,
    this.pendingImageBytes,
    this.pendingImageFilename,
    this.fullName = '',
    this.phone = '',
    this.specialization = '',
    this.licenseNumber = '',
    this.yearsOfExperience = '',
    this.bio = '',
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
  final String specialization;
  final String licenseNumber;
  final String yearsOfExperience;
  final String bio;

  SpecialistEditProfileState copyWith({
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
    String? specialization,
    String? licenseNumber,
    String? yearsOfExperience,
    String? bio,
  }) {
    return SpecialistEditProfileState(
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
      specialization: specialization ?? this.specialization,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      yearsOfExperience: yearsOfExperience ?? this.yearsOfExperience,
      bio: bio ?? this.bio,
    );
  }
}

final specialistEditProfileProvider =
    StateNotifierProvider<
      SpecialistEditProfileNotifier,
      SpecialistEditProfileState
    >(
      (ref) => SpecialistEditProfileNotifier(
        ref,
        ref.watch(specialistProfileRepositoryProvider),
      ),
    );

class SpecialistEditProfileNotifier
    extends StateNotifier<SpecialistEditProfileState> {
  SpecialistEditProfileNotifier(this._ref, this._repository)
    : super(const SpecialistEditProfileState());

  final Ref _ref;
  final SpecialistProfileRepository _repository;

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
      final cached = _ref.read(specialistProfileProvider).bundle;
      final bundle = cached ?? await _repository.fetchProfileBundle(userId);
      final professional = bundle.professional;

      state = state.copyWith(
        isLoading: false,
        profileId: professional?.profileId,
        profileImageUrl: bundle.profileImageUrl,
        fullName: bundle.fullName,
        phone: bundle.phone ?? '',
        specialization: professional?.specialization ?? '',
        licenseNumber: professional?.licenseNumber ?? '',
        yearsOfExperience: professional?.yearsOfExperience?.toString() ?? '',
        bio: professional?.bio ?? '',
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
  void setSpecialization(String value) =>
      state = state.copyWith(specialization: value);
  void setLicenseNumber(String value) =>
      state = state.copyWith(licenseNumber: value);
  void setYearsOfExperience(String value) =>
      state = state.copyWith(yearsOfExperience: value);
  void setBio(String value) => state = state.copyWith(bio: value);

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

    final yearsText = state.yearsOfExperience.trim();
    if (yearsText.isNotEmpty) {
      final years = int.tryParse(yearsText);
      if (years == null || years < 0) {
        return 'Years of experience must be a valid number';
      }
    }

    return null;
  }

  UpdateSpecialistProfessionalInput _professionalInput() {
    final yearsText = state.yearsOfExperience.trim();
    final years = yearsText.isEmpty ? null : int.tryParse(yearsText);

    return UpdateSpecialistProfessionalInput(
      specialization: _nullableTrim(state.specialization),
      licenseNumber: _nullableTrim(state.licenseNumber),
      bio: _nullableTrim(state.bio),
      yearsOfExperience: years,
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

      final professionalInput = _professionalInput();
      final profileId = state.profileId;

      if (profileId != null && profileId.isNotEmpty) {
        await _repository.updateSpecialistProfile(profileId, professionalInput);
      } else {
        final created = await _repository.createSpecialistProfile(
          professionalInput,
        );
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
      await _ref.read(specialistProfileProvider.notifier).refresh();
      _ref.read(specialistDashboardProvider.notifier).syncUserFromAuth();

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
