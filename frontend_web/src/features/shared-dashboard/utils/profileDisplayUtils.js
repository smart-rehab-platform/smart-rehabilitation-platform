export function getRoleDisplayLabel(role, t) {
  const normalized = typeof role === "string" ? role.trim().toLowerCase() : "";

  if (normalized === "admin") {
    return t("roles.admin");
  }

  if (normalized === "specialist") {
    return t("roles.specialist");
  }

  if (normalized === "parent") {
    return t("roles.parent");
  }

  if (typeof role === "string" && role.trim()) {
    return role.trim();
  }

  return t("roles.user");
}
