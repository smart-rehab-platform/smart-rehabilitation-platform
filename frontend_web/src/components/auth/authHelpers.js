export const strongPasswordMessage =
  "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";

export function getPasswordRules(password) {
  return [
    {
      label: "At least 8 characters",
      satisfied: password.length >= 8,
    },
    {
      label: "Contains uppercase letter",
      satisfied: /[A-Z]/.test(password),
    },
    {
      label: "Contains lowercase letter",
      satisfied: /[a-z]/.test(password),
    },
    {
      label: "Contains number",
      satisfied: /\d/.test(password),
    },
    {
      label: "Contains special character",
      satisfied: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

export function getPasswordStrength(password) {
  const rules = getPasswordRules(password);
  const satisfiedCount = rules.filter((rule) => rule.satisfied).length;

  const level =
    satisfiedCount >= 5 ? "strong" : satisfiedCount >= 3 ? "medium" : "weak";

  return {
    level,
    satisfiedCount,
    rules,
    isStrong: satisfiedCount === rules.length,
  };
}

export function readAuthApiMessage(error, fallbackMessage) {
  const message = error?.response?.data?.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  return fallbackMessage;
}
