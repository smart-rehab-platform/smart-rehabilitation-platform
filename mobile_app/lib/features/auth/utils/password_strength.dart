enum AuthPasswordStrengthLevel { weak, medium, strong }

class AuthPasswordRule {
  const AuthPasswordRule({required this.label, required this.isSatisfied});

  final String label;
  final bool isSatisfied;
}

class AuthPasswordStrengthResult {
  const AuthPasswordStrengthResult({
    required this.level,
    required this.satisfiedCount,
    required this.rules,
  });

  final AuthPasswordStrengthLevel level;
  final int satisfiedCount;
  final List<AuthPasswordRule> rules;

  bool get isStrong =>
      satisfiedCount == rules.length &&
      level == AuthPasswordStrengthLevel.strong;
}

const String authStrongPasswordMessage =
    'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.';

AuthPasswordStrengthResult evaluateAuthPasswordStrength(String password) {
  final rules = [
    AuthPasswordRule(
      label: 'At least 8 characters',
      isSatisfied: password.length >= 8,
    ),
    AuthPasswordRule(
      label: 'Contains uppercase letter',
      isSatisfied: RegExp(r'[A-Z]').hasMatch(password),
    ),
    AuthPasswordRule(
      label: 'Contains lowercase letter',
      isSatisfied: RegExp(r'[a-z]').hasMatch(password),
    ),
    AuthPasswordRule(
      label: 'Contains number',
      isSatisfied: RegExp(r'\d').hasMatch(password),
    ),
    AuthPasswordRule(
      label: 'Contains special character',
      isSatisfied: RegExp(r'[^A-Za-z0-9]').hasMatch(password),
    ),
  ];

  final satisfiedCount = rules.where((rule) => rule.isSatisfied).length;
  final level = switch (satisfiedCount) {
    >= 5 => AuthPasswordStrengthLevel.strong,
    >= 3 => AuthPasswordStrengthLevel.medium,
    _ => AuthPasswordStrengthLevel.weak,
  };

  return AuthPasswordStrengthResult(
    level: level,
    satisfiedCount: satisfiedCount,
    rules: rules,
  );
}
