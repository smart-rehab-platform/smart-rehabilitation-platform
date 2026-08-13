import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';

import '../models/signup_wizard_models.dart';
import '../providers/auth_provider.dart';
import '../utils/auth_localization_utils.dart';
import '../utils/signup_wizard_helpers.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/locale/language_selector.dart';
import '../../../core/routes/app_routes.dart';
import '../../../l10n/app_localizations.dart';
import '../../../shared/widgets/auth_ui.dart';
import 'signup/signup_personal_info_step.dart';
import 'signup/signup_professional_info_step.dart';
import 'signup/signup_profile_photo_source_sheet.dart';
import 'signup/signup_review_step.dart';
import 'signup/signup_role_step.dart';
import 'signup/signup_security_step.dart';
import 'signup/signup_step_indicator.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final ImagePicker _imagePicker = ImagePicker();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _specializationController = TextEditingController();
  final _licenseNumberController = TextEditingController();
  final _yearsController = TextEditingController();
  final _bioController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  int _currentStep = 1;
  SignupRole? _selectedRole;
  bool _showPassword = false;
  bool _showConfirmPassword = false;
  bool _termsAccepted = false;
  Uint8List? _profilePhotoBytes;
  String? _profileImageUrl;
  String? _profilePhotoFilename;
  bool _isUploadingPhoto = false;
  bool _submitLocked = false;

  AuthFieldState get _emailState {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      return AuthFieldState.idle;
    }
    return isEmailValid(email) ? AuthFieldState.success : AuthFieldState.error;
  }

  AuthFieldState get _passwordState {
    final password = _passwordController.text;
    if (password.isEmpty) {
      return AuthFieldState.idle;
    }
    return isPasswordValid(password)
        ? AuthFieldState.success
        : AuthFieldState.error;
  }

  AuthFieldState get _confirmPasswordState {
    final confirmPassword = _confirmPasswordController.text;
    if (confirmPassword.isEmpty) {
      return AuthFieldState.idle;
    }
    return passwordsMatch(_passwordController.text, confirmPassword)
        ? AuthFieldState.success
        : AuthFieldState.error;
  }

  bool get _canContinuePersonal =>
      isFullNameValid(_fullNameController.text) &&
      isEmailValid(_emailController.text) &&
      isPhoneValid(_phoneController.text) &&
      !_isUploadingPhoto;

  bool get _canContinueProfessional {
    return validateSpecialization(_specializationController.text).valid &&
        validateLicenseNumber(_licenseNumberController.text).valid &&
        validateYearsOfExperience(_yearsController.text).valid &&
        validateBio(_bioController.text).valid;
  }

  bool get _canContinueSecurity =>
      isPasswordValid(_passwordController.text) &&
      passwordsMatch(
        _passwordController.text,
        _confirmPasswordController.text,
      ) &&
      _termsAccepted;

  SpecialistProfileData get _specialistProfile => SpecialistProfileData(
    specialization: _specializationController.text,
    licenseNumber: _licenseNumberController.text,
    yearsOfExperience: _yearsController.text,
    bio: _bioController.text,
  );

  String? _stepSubtitle(AppLocalizations l10n) {
    return localizedSignupStepSubtitle(l10n, _currentStep).isEmpty
        ? null
        : localizedSignupStepSubtitle(l10n, _currentStep);
  }

  @override
  void initState() {
    super.initState();
    for (final controller in [
      _fullNameController,
      _emailController,
      _phoneController,
      _specializationController,
      _licenseNumberController,
      _yearsController,
      _bioController,
      _passwordController,
      _confirmPasswordController,
    ]) {
      controller.addListener(_handleFieldChanged);
    }
  }

  void _handleFieldChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    for (final controller in [
      _fullNameController,
      _emailController,
      _phoneController,
      _specializationController,
      _licenseNumberController,
      _yearsController,
      _bioController,
      _passwordController,
      _confirmPasswordController,
    ]) {
      controller
        ..removeListener(_handleFieldChanged)
        ..dispose();
    }
    super.dispose();
  }

  void _goToStep(int step) {
    if (step == 3 && _selectedRole == SignupRole.parent) {
      step = signupSecurityStep;
    }
    setState(() => _currentStep = step);
  }

  void _handleBack() {
    if (_currentStep == signupSecurityStep) {
      _goToStep(getStepBeforeSecurity(_selectedRole));
      return;
    }
    if (_currentStep > 1) {
      _goToStep(_currentStep - 1);
    }
  }

  void _handleRoleSelected(SignupRole role) {
    setState(() {
      _selectedRole = role;
      if (role == SignupRole.parent) {
        _specializationController.clear();
        _licenseNumberController.clear();
        _yearsController.clear();
        _bioController.clear();
        if (_currentStep == 3) {
          _currentStep = signupSecurityStep;
        }
      }
    });
  }

  void _handleRoleContinue() {
    if (_selectedRole == null) {
      return;
    }
    _goToStep(2);
  }

  void _handlePersonalContinue() {
    final l10n = AppLocalizations.of(context)!;
    if (!_canContinuePersonal) {
      showAuthSnackBar(
        context,
        l10n.signupCompletePersonalFields,
        type: AuthSnackBarType.error,
      );
      return;
    }
    _goToStep(getStepAfterPersonalInfo(_selectedRole));
  }

  void _handleProfessionalContinue() {
    final l10n = AppLocalizations.of(context)!;
    if (!_canContinueProfessional) {
      showAuthSnackBar(
        context,
        l10n.signupCompleteProfessionalFields,
        type: AuthSnackBarType.error,
      );
      return;
    }
    _goToStep(signupSecurityStep);
  }

  void _handleSecurityContinue() {
    final l10n = AppLocalizations.of(context)!;
    if (_passwordController.text.isEmpty ||
        _confirmPasswordController.text.isEmpty) {
      showAuthSnackBar(
        context,
        l10n.authCompleteRequiredFields,
        type: AuthSnackBarType.error,
      );
      return;
    }
    if (_passwordState == AuthFieldState.error) {
      showAuthSnackBar(
        context,
        localizedAuthStrongPasswordMessage(l10n),
        type: AuthSnackBarType.error,
      );
      return;
    }
    if (_confirmPasswordState == AuthFieldState.error) {
      showAuthSnackBar(
        context,
        l10n.authPasswordsDoNotMatch,
        type: AuthSnackBarType.error,
      );
      return;
    }
    if (!_termsAccepted) {
      showAuthSnackBar(
        context,
        l10n.signupTermsRequired,
        type: AuthSnackBarType.error,
      );
      return;
    }
    _goToStep(signupReviewStep);
  }

  Future<void> _pickProfilePhoto() async {
    final previousBytes = _profilePhotoBytes;
    final previousFilename = _profilePhotoFilename;
    final previousImageUrl = _profileImageUrl;

    final source = await showSignupProfilePhotoSourceSheet(context);
    if (source == null || !mounted) {
      return;
    }

    try {
      final pickedImage = await _imagePicker.pickImage(
        source: source == SignupProfilePhotoSource.camera
            ? ImageSource.camera
            : ImageSource.gallery,
        maxWidth: 1200,
        imageQuality: 85,
      );
      if (pickedImage == null) {
        return;
      }

      final imageBytes = await pickedImage.readAsBytes();
      if (imageBytes.isEmpty) {
        throw Exception('Selected image is empty.');
      }

      if (!mounted) {
        return;
      }

      final filename = _normalizeProfileFilename(
        pickedImage.name,
        pickedImage.path,
      );

      setState(() {
        _profilePhotoBytes = imageBytes;
        _profilePhotoFilename = filename;
        _profileImageUrl = null;
        _isUploadingPhoto = true;
      });

      final uploadedUrl = await ref
          .read(authProvider.notifier)
          .uploadSignupProfileImage(imageBytes, filename);

      if (!mounted) {
        return;
      }

      if (uploadedUrl == null) {
        final l10n = AppLocalizations.of(context)!;
        setState(() {
          _profilePhotoBytes = previousBytes;
          _profilePhotoFilename = previousFilename;
          _profileImageUrl = previousImageUrl;
          _isUploadingPhoto = false;
        });
        showAuthSnackBar(
          context,
          mapAuthProviderError(
            l10n,
            ref.read(authProvider).errorMessage ?? l10n.authUploadProfileFailed,
          ),
          type: AuthSnackBarType.error,
        );
        return;
      }

      setState(() {
        _profileImageUrl = uploadedUrl;
        _isUploadingPhoto = false;
      });
    } on PlatformException catch (error) {
      if (!mounted) {
        return;
      }

      setState(() => _isUploadingPhoto = false);

      showAuthSnackBar(
        context,
        _profilePhotoPickerErrorMessage(
          error,
          fromCamera: source == SignupProfilePhotoSource.camera,
        ),
        type: AuthSnackBarType.error,
      );
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() => _isUploadingPhoto = false);

      showAuthSnackBar(
        context,
        AppLocalizations.of(context)!.signupPhotoSelectFailed,
        type: AuthSnackBarType.error,
      );
    }
  }

  String _profilePhotoPickerErrorMessage(
    PlatformException error, {
    required bool fromCamera,
  }) {
    final l10n = AppLocalizations.of(context)!;
    return localizedSignupPhotoPickerError(
      l10n,
      error.code,
      error.message ?? '',
      fromCamera: fromCamera,
    );
  }

  String _normalizeProfileFilename(String name, String path) {
    if (name.trim().isNotEmpty) {
      return name.trim();
    }

    final segments = path.split(RegExp(r'[\\/]'));
    if (segments.isNotEmpty && segments.last.isNotEmpty) {
      return segments.last;
    }

    return 'profile.jpg';
  }

  Future<String?> _ensureProfileImageUrl() async {
    if (_profileImageUrl != null && _profileImageUrl!.trim().isNotEmpty) {
      return _profileImageUrl;
    }

    if (_profilePhotoBytes == null || _profilePhotoFilename == null) {
      return null;
    }

    return ref
        .read(authProvider.notifier)
        .uploadSignupProfileImage(_profilePhotoBytes!, _profilePhotoFilename!);
  }

  Future<void> _register() async {
    if (_submitLocked || ref.read(authProvider).isLoading) {
      return;
    }

    final l10n = AppLocalizations.of(context)!;
    final fullName = _fullNameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();
    final password = _passwordController.text;

    if (_selectedRole == null) {
      showAuthSnackBar(
        context,
        l10n.signupSelectRoleRequired,
        type: AuthSnackBarType.error,
      );
      _goToStep(1);
      return;
    }

    if (!_canContinuePersonal ||
        !_canContinueSecurity ||
        (_selectedRole == SignupRole.specialist && !_canContinueProfessional)) {
      showAuthSnackBar(
        context,
        l10n.authCompleteRequiredFields,
        type: AuthSnackBarType.error,
      );
      return;
    }

    _submitLocked = true;

    Map<String, dynamic>? specialistProfile;
    if (_selectedRole == SignupRole.specialist) {
      specialistProfile = _specialistProfile.toApiMap();
    }

    final profileImageUrl = await _ensureProfileImageUrl();
    if (!mounted) {
      return;
    }

    if (_profilePhotoBytes != null && profileImageUrl == null) {
      _submitLocked = false;
      showAuthSnackBar(
        context,
        mapAuthProviderError(
          l10n,
          ref.read(authProvider).errorMessage ?? l10n.authUploadProfileRetry,
        ),
        type: AuthSnackBarType.error,
      );
      return;
    }

    final success = await ref
        .read(authProvider.notifier)
        .register(
          fullName: fullName,
          email: email,
          password: password,
          phone: phone,
          role: _selectedRole == SignupRole.parent ? 'parent' : 'specialist',
          profileImageUrl: profileImageUrl,
          specialistProfile: specialistProfile,
        );

    if (!mounted) {
      return;
    }

    _submitLocked = false;

    if (success) {
      context.go(
        '${AppRoutes.verifyEmail}?email=${Uri.encodeComponent(email)}',
      );
      return;
    }

    final rawErrorMessage =
        ref.read(authProvider).errorMessage ?? l10n.authRegistrationFailed;

    if (isDuplicateEmailError(rawErrorMessage)) {
      _goToStep(2);
    }

    showAuthSnackBar(
      context,
      mapAuthProviderError(l10n, rawErrorMessage),
      type: AuthSnackBarType.error,
    );
  }

  Widget _buildStepContent() {
    return switch (_currentStep) {
      1 => SignupRoleStep(
        key: const ValueKey('signup-step-1'),
        selectedRole: _selectedRole,
        onRoleSelected: _handleRoleSelected,
        onContinue: _handleRoleContinue,
      ),
      2 => SignupPersonalInfoStep(
        key: const ValueKey('signup-step-2'),
        fullNameController: _fullNameController,
        emailController: _emailController,
        phoneController: _phoneController,
        emailState: _emailState,
        canContinue: _canContinuePersonal,
        imageBytes: _profilePhotoBytes,
        onPickPhoto: _pickProfilePhoto,
        onBack: _handleBack,
        onContinue: _handlePersonalContinue,
      ),
      3 => SignupProfessionalInfoStep(
        key: const ValueKey('signup-step-3'),
        specializationController: _specializationController,
        licenseNumberController: _licenseNumberController,
        yearsController: _yearsController,
        bioController: _bioController,
        canContinue: _canContinueProfessional,
        onBack: _handleBack,
        onContinue: _handleProfessionalContinue,
      ),
      4 => SignupSecurityStep(
        key: const ValueKey('signup-step-4'),
        passwordController: _passwordController,
        confirmPasswordController: _confirmPasswordController,
        showPassword: _showPassword,
        showConfirmPassword: _showConfirmPassword,
        passwordState: _passwordState,
        confirmPasswordState: _confirmPasswordState,
        termsAccepted: _termsAccepted,
        canContinue: _canContinueSecurity,
        onTogglePassword: () => setState(() => _showPassword = !_showPassword),
        onToggleConfirmPassword: () =>
            setState(() => _showConfirmPassword = !_showConfirmPassword),
        onTermsChanged: (value) => setState(() => _termsAccepted = value),
        onBack: _handleBack,
        onContinue: _handleSecurityContinue,
      ),
      _ => SignupReviewStep(
        key: const ValueKey('signup-step-5'),
        selectedRole: _selectedRole,
        fullName: _fullNameController.text,
        email: _emailController.text,
        phone: _phoneController.text,
        specialistProfile: _specialistProfile,
        imageBytes: _profilePhotoBytes,
        isLoading: ref.watch(authProvider).isLoading,
        onEditStep: _goToStep,
        onBack: _handleBack,
        onCreateAccount: _register,
      ),
    };
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final authState = ref.watch(authProvider);
    final stepSubtitle = _stepSubtitle(l10n);

    return PopScope(
      canPop: _currentStep == 1,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && _currentStep > 1) {
          _handleBack();
        }
      },
      child: Scaffold(
        body: AuthBackground(
          showBackgroundVideo: true,
          bottomFade: false,
          child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
              child: Column(
                children: [
                  Row(
                    children: [
                      AuthBackButton(
                        onPressed: () {
                          if (_currentStep > 1) {
                            _handleBack();
                            return;
                          }
                          context.go(AppRoutes.splash);
                        },
                      ),
                      const SizedBox(width: 6),
                      const AuthTopLogo(
                        logoAsset: AuthTopLogo.brandingAsset,
                        logoSize: 26,
                        logoColor: Color(0xFF2AA4C9),
                      ),
                      const Spacer(),
                      const LanguageSelector(),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 420),
                      child: AuthGlassCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            AuthTabSwitcher(
                              activeIndex: 1,
                              onTap: (index) {
                                if (index == 0) {
                                  context.go(AppRoutes.login);
                                }
                              },
                            ),
                            const SizedBox(height: 16),
                            if (_currentStep == 1)
                              Text(
                                l10n.signupCreateYourAccount,
                                style: GoogleFonts.syne(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.white,
                                ),
                              )
                            else
                              Text(
                                l10n.authCommonCreateAccount,
                                style: GoogleFonts.syne(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.white,
                                ),
                              ),
                            if (stepSubtitle != null) ...[
                              const SizedBox(height: 4),
                              Text(
                                stepSubtitle,
                                style: GoogleFonts.inter(
                                  fontSize: 12.5,
                                  height: 1.5,
                                  color: AppColors.lightBlue.withValues(
                                    alpha: 0.7,
                                  ),
                                ),
                              ),
                            ],
                            const SizedBox(height: 14),
                            SignupStepIndicator(currentStep: _currentStep),
                            const SizedBox(height: 16),
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 225),
                              switchInCurve: Curves.easeOut,
                              switchOutCurve: Curves.easeIn,
                              transitionBuilder: (child, animation) {
                                final offsetAnimation = Tween<Offset>(
                                  begin: const Offset(0.03, 0),
                                  end: Offset.zero,
                                ).animate(animation);
                                return FadeTransition(
                                  opacity: animation,
                                  child: SlideTransition(
                                    position: offsetAnimation,
                                    child: child,
                                  ),
                                );
                              },
                              child: _buildStepContent(),
                            ),
                            const SizedBox(height: 18),
                            Text.rich(
                              TextSpan(
                                text: l10n.authAlreadyHaveAccount,
                                style: GoogleFonts.inter(
                                  fontSize: 11.5,
                                  color: AppColors.lightBlue,
                                ),
                                children: [
                                  WidgetSpan(
                                    alignment: PlaceholderAlignment.middle,
                                    child: GestureDetector(
                                      onTap: authState.isLoading
                                          ? null
                                          : () => context.go(AppRoutes.login),
                                      child: Text(
                                        l10n.commonSignIn,
                                        style: GoogleFonts.inter(
                                          fontSize: 11.5,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.cyan,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
