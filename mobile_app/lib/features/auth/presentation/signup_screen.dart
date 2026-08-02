import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../utils/password_strength.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../shared/widgets/auth_ui.dart';

enum SignupRole { parent, specialist }

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
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  SignupRole? _selectedRole;
  bool _showPassword = false;
  bool _showConfirmPassword = false;
  Uint8List? _profilePhotoBytes;

  bool get _isFullNameValid => _fullNameController.text.trim().length >= 2;

  bool get _isPhoneValid {
    final digitsOnly = _phoneController.text.replaceAll(RegExp(r'\D'), '');
    return digitsOnly.length >= 7;
  }

  AuthFieldState get _emailState {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      return AuthFieldState.idle;
    }

    return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)
        ? AuthFieldState.success
        : AuthFieldState.error;
  }

  AuthFieldState get _passwordState {
    final password = _passwordController.text;
    if (password.isEmpty) {
      return AuthFieldState.idle;
    }

    return evaluateAuthPasswordStrength(password).isStrong
        ? AuthFieldState.success
        : AuthFieldState.error;
  }

  AuthFieldState get _confirmPasswordState {
    final confirmPassword = _confirmPasswordController.text;
    if (confirmPassword.isEmpty) {
      return AuthFieldState.idle;
    }

    return confirmPassword == _passwordController.text
        ? AuthFieldState.success
        : AuthFieldState.error;
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _pickProfilePhoto() async {
    try {
      final pickedImage = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );

      if (pickedImage == null) {
        return;
      }

      final imageBytes = await pickedImage.readAsBytes();
      if (!mounted) {
        return;
      }

      setState(() => _profilePhotoBytes = imageBytes);
    } catch (error) {
      if (!mounted) {
        return;
      }

      showAuthSnackBar(
        context,
        'Unable to select your profile photo right now.',
        type: AuthSnackBarType.error,
      );
    }
  }

  Future<void> _register() async {
    final fullName = _fullNameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (fullName.isEmpty ||
        email.isEmpty ||
        phone.isEmpty ||
        password.isEmpty ||
        confirmPassword.isEmpty) {
      showAuthSnackBar(
        context,
        'Please complete all required fields',
        type: AuthSnackBarType.error,
      );
      return;
    }

    if (!_isFullNameValid) {
      showAuthSnackBar(
        context,
        'Please enter a valid full name',
        type: AuthSnackBarType.error,
      );
      return;
    }

    if (_emailState == AuthFieldState.error) {
      showAuthSnackBar(
        context,
        'Please enter a valid email address',
        type: AuthSnackBarType.error,
      );
      return;
    }

    if (!_isPhoneValid) {
      showAuthSnackBar(
        context,
        'Please enter a valid phone number',
        type: AuthSnackBarType.error,
      );
      return;
    }

    if (_passwordState == AuthFieldState.error) {
      showAuthSnackBar(
        context,
        authStrongPasswordMessage,
        type: AuthSnackBarType.error,
      );
      return;
    }

    if (_confirmPasswordState == AuthFieldState.error) {
      showAuthSnackBar(
        context,
        'Passwords do not match.',
        type: AuthSnackBarType.error,
      );
      return;
    }

    if (_selectedRole == null) {
      showAuthSnackBar(
        context,
        'Please select your role',
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
        );

    if (!mounted) {
      return;
    }

    if (success) {
      context.go(
        '${AppRoutes.verifyEmail}?email=${Uri.encodeComponent(email)}',
      );
      return;
    }

    final errorMessage =
        ref.read(authProvider).errorMessage ??
        'Registration failed. Please try again.';
    showAuthSnackBar(context, errorMessage, type: AuthSnackBarType.error);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
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
                      onPressed: () => context.go(AppRoutes.splash),
                    ),
                    const SizedBox(width: 6),
                    const AuthTopLogo(
                      logoAsset: AuthTopLogo.brandingAsset,
                      logoSize: 26,
                      logoColor: Color(0xFF2AA4C9),
                    ),
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
                          const SizedBox(height: 22),
                          Text(
                            'Create Account',
                            style: GoogleFonts.syne(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                              color: AppColors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Join the Smart Rehabilitation Platform',
                            style: GoogleFonts.inter(
                              fontSize: 12.5,
                              height: 1.5,
                              color: AppColors.lightBlue.withValues(alpha: 0.7),
                            ),
                          ),
                          const SizedBox(height: 18),
                          _ProfilePhotoPlaceholder(
                            imageBytes: _profilePhotoBytes,
                            onTap: _pickProfilePhoto,
                          ),
                          const SizedBox(height: 18),
                          AuthInputField(
                            controller: _fullNameController,
                            label: 'Full Name',
                            hintText: 'Dr. Sarah Johnson',
                            icon: Icons.person_outline_rounded,
                            textInputAction: TextInputAction.next,
                            autofillHints: const [AutofillHints.name],
                            textCapitalization: TextCapitalization.words,
                            onChanged: (_) => setState(() {}),
                          ),
                          const SizedBox(height: 12),
                          AuthInputField(
                            controller: _emailController,
                            label: 'Email Address',
                            hintText: 'name@example.com',
                            icon: Icons.mail_outline_rounded,
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            autofillHints: const [AutofillHints.email],
                            onChanged: (_) => setState(() {}),
                            state: _emailState,
                            message: _emailState == AuthFieldState.error
                                ? 'Invalid email address'
                                : null,
                          ),
                          const SizedBox(height: 12),
                          AuthInputField(
                            controller: _phoneController,
                            label: 'Phone Number',
                            hintText: '+970 59 000 0000',
                            icon: Icons.phone_outlined,
                            keyboardType: TextInputType.phone,
                            textInputAction: TextInputAction.next,
                            autofillHints: const [
                              AutofillHints.telephoneNumber,
                            ],
                            onChanged: (_) => setState(() {}),
                          ),
                          const SizedBox(height: 12),
                          AuthInputField(
                            controller: _passwordController,
                            label: 'Password',
                            hintText: 'Min. 8 characters',
                            icon: Icons.lock_outline_rounded,
                            textInputAction: TextInputAction.next,
                            obscureText: !_showPassword,
                            autofillHints: const [AutofillHints.newPassword],
                            onChanged: (_) => setState(() {}),
                            state: _passwordState,
                            message: _passwordState == AuthFieldState.error
                                ? authStrongPasswordMessage
                                : null,
                            suffix: IconButton(
                              onPressed: () {
                                setState(() => _showPassword = !_showPassword);
                              },
                              icon: Icon(
                                _showPassword
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                size: 17,
                                color: AppColors.lightBlue.withValues(
                                  alpha: 0.58,
                                ),
                              ),
                            ),
                          ),
                          AuthPasswordStrengthIndicator(
                            password: _passwordController.text,
                          ),
                          const SizedBox(height: 12),
                          AuthInputField(
                            controller: _confirmPasswordController,
                            label: 'Confirm Password',
                            hintText: 'Re-enter password',
                            icon: Icons.lock_outline_rounded,
                            textInputAction: TextInputAction.done,
                            obscureText: !_showConfirmPassword,
                            onChanged: (_) => setState(() {}),
                            state: _confirmPasswordState,
                            message:
                                _confirmPasswordState == AuthFieldState.error
                                ? 'Passwords do not match.'
                                : null,
                            suffix: IconButton(
                              onPressed: () {
                                setState(
                                  () => _showConfirmPassword =
                                      !_showConfirmPassword,
                                );
                              },
                              icon: Icon(
                                _showConfirmPassword
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                size: 17,
                                color: AppColors.lightBlue.withValues(
                                  alpha: 0.58,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'I am a...',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.lightBlue,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              AuthRoleCard(
                                title: 'Parent',
                                icon: Icons.groups_2_outlined,
                                bullets: const [
                                  'Track child progress',
                                  'Upload exercises',
                                  'View reports',
                                ],
                                isSelected: _selectedRole == SignupRole.parent,
                                onTap: () {
                                  setState(
                                    () => _selectedRole = SignupRole.parent,
                                  );
                                },
                              ),
                              const SizedBox(width: 10),
                              AuthRoleCard(
                                title: 'Specialist',
                                icon: Icons.medical_services_outlined,
                                bullets: const [
                                  'Manage patients',
                                  'Create treatment plans',
                                  'Generate reports',
                                ],
                                isSelected:
                                    _selectedRole == SignupRole.specialist,
                                onTap: () {
                                  setState(
                                    () => _selectedRole = SignupRole.specialist,
                                  );
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 18),
                          AuthGradientButton(
                            label: authState.isLoading
                                ? 'Creating Account...'
                                : 'Create My Account',
                            trailingIcon: Icons.chevron_right_rounded,
                            isLoading: authState.isLoading,
                            onPressed: authState.isLoading ? null : _register,
                          ),
                          const SizedBox(height: 18),
                          Text.rich(
                            TextSpan(
                              text: 'Already have an account? ',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                color: AppColors.lightBlue,
                              ),
                              children: [
                                WidgetSpan(
                                  alignment: PlaceholderAlignment.middle,
                                  child: GestureDetector(
                                    onTap: () => context.go(AppRoutes.login),
                                    child: Text(
                                      'Sign In',
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
    );
  }
}

class _ProfilePhotoPlaceholder extends StatelessWidget {
  const _ProfilePhotoPlaceholder({required this.onTap, this.imageBytes});

  final VoidCallback onTap;
  final Uint8List? imageBytes;

  @override
  Widget build(BuildContext context) {
    final hasImage = imageBytes != null;

    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(40),
          child: Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.cyan.withValues(alpha: 0.05),
              border: Border.all(color: AppColors.cyan, width: 2),
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (hasImage)
                  ClipOval(child: Image.memory(imageBytes!, fit: BoxFit.cover))
                else
                  const Icon(
                    Icons.camera_alt_outlined,
                    size: 18,
                    color: AppColors.cyan,
                  ),
                Align(
                  alignment: AlignmentDirectional.bottomEnd,
                  child: Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: AppColors.darkBlue,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.cyan, width: 1.2),
                    ),
                    child: Icon(
                      hasImage ? Icons.edit_rounded : Icons.add_rounded,
                      size: 12,
                      color: AppColors.cyan,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          hasImage ? 'Tap to change photo' : 'Profile photo optional',
          style: GoogleFonts.inter(
            fontSize: 10,
            color: AppColors.lightBlue.withValues(alpha: 0.6),
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
