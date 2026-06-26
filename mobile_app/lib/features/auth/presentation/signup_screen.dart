import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
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

    return password.length >= 8 ? AuthFieldState.success : AuthFieldState.error;
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

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to pick image: $error')),
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
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all required fields')),
      );
      return;
    }

    if (_emailState == AuthFieldState.error) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid email address')),
      );
      return;
    }

    if (_passwordState == AuthFieldState.error) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password must be at least 8 characters')),
      );
      return;
    }

    if (_confirmPasswordState == AuthFieldState.error) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match')),
      );
      return;
    }

    if (_selectedRole == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select your role')),
      );
      return;
    }

    final success = await ref.read(authProvider.notifier).register(
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
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Account created successfully')),
      );
      context.go(AppRoutes.dashboard);
      return;
    }

    final errorMessage = ref.read(authProvider).errorMessage ??
        'Registration failed. Please try again.';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(errorMessage)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: AuthBackground(
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
                    const SizedBox(width: 10),
                    const AuthTopLogo(),
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
                            autofillHints: const [AutofillHints.telephoneNumber],
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
                                ? 'Min. 8 characters required'
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
                                color: AppColors.lightBlue.withValues(alpha: 0.58),
                              ),
                            ),
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
                            message: _confirmPasswordState == AuthFieldState.error
                                ? 'Passwords do not match'
                                : null,
                            suffix: IconButton(
                              onPressed: () {
                                setState(
                                  () => _showConfirmPassword = !_showConfirmPassword,
                                );
                              },
                              icon: Icon(
                                _showConfirmPassword
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                size: 17,
                                color: AppColors.lightBlue.withValues(alpha: 0.58),
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
                                  setState(() => _selectedRole = SignupRole.parent);
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
  const _ProfilePhotoPlaceholder({
    required this.onTap,
    this.imageBytes,
  });

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
              border: Border.all(
                color: AppColors.cyan,
                width: 2,
              ),
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (hasImage)
                  ClipOval(
                    child: Image.memory(
                      imageBytes!,
                      fit: BoxFit.cover,
                    ),
                  )
                else
                  const Icon(
                    Icons.camera_alt_outlined,
                    size: 18,
                    color: AppColors.cyan,
                  ),
                Align(
                  alignment: Alignment.bottomRight,
                  child: Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: AppColors.darkBlue,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppColors.cyan,
                        width: 1.2,
                      ),
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
