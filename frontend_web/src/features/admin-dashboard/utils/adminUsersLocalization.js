import { formatAppDate } from "../../../i18n/formatters.js";
import { getPasswordRules } from "../../../components/auth/authLocalization.js";
import { resolveAdminMapperContext } from "./adminDashboardLocalization.js";

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated && translated !== key) {
      return translated;
    }
  }

  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }

  return fallback;
}

function getAdminRoleDisplayLabel(role, t) {
  const normalized = typeof role === "string" ? role.trim().toLowerCase() : "";

  if (normalized === "admin") {
    return translateKey(t, "roles.admin", "Admin");
  }

  if (normalized === "specialist") {
    return translateKey(t, "roles.specialist", "Specialist");
  }

  if (normalized === "parent") {
    return translateKey(t, "roles.parent", "Parent");
  }

  if (typeof role === "string" && role.trim()) {
    return role.trim();
  }

  return translateKey(t, "roles.user", "User");
}

export function getAdminUsersLabels(t = null) {
  return {
    title: translateKey(t, "admin.users.title", "Users"),
    subtitle: translateKey(t, "admin.users.subtitle", "Manage platform user accounts"),
    toolbarAriaLabel: translateKey(t, "admin.users.toolbarAriaLabel", "Users toolbar"),
    addUser: translateKey(t, "admin.users.addUser", "Add User"),
    searchAriaLabel: translateKey(t, "admin.users.searchAriaLabel", "Search users"),
    searchPlaceholder: translateKey(t, "admin.users.searchPlaceholder", "Search by name, email, or role"),
    roleFiltersAriaLabel: translateKey(t, "admin.users.roleFiltersAriaLabel", "Role filters"),
    filterAll: translateKey(t, "admin.users.filterAll", "All"),
    tableAriaLabel: translateKey(t, "admin.users.tableAriaLabel", "Users list"),
    columns: {
      user: translateKey(t, "admin.users.columns.user", "User"),
      email: translateKey(t, "admin.users.columns.email", "Email"),
      role: translateKey(t, "admin.users.columns.role", "Role"),
      specialization: translateKey(t, "admin.users.columns.specialization", "Specialization"),
      license: translateKey(t, "admin.users.columns.license", "License"),
      verification: translateKey(t, "admin.users.columns.verification", "Verification"),
      status: translateKey(t, "admin.users.columns.status", "Account Status"),
      lastSeen: translateKey(t, "admin.users.columns.lastSeen", "Last Seen"),
      actions: translateKey(t, "admin.users.columns.actions", "Actions"),
    },
    statusActive: translateKey(t, "admin.users.status.active", "Active"),
    statusInactive: translateKey(t, "admin.users.status.inactive", "Inactive"),
    verification: {
      pending: translateKey(t, "admin.users.verification.pending", "Pending"),
      approved: translateKey(t, "admin.users.verification.approved", "Approved"),
      rejected: translateKey(t, "admin.users.verification.rejected", "Rejected"),
      notApplicable: translateKey(t, "admin.users.verification.notApplicable", "—"),
    },
    manage: translateKey(t, "admin.users.manage", "Manage"),
    menu: {
      editUser: translateKey(t, "admin.users.menu.editUser", "Edit User"),
      activateUser: translateKey(t, "admin.users.menu.activateUser", "Activate User"),
      deactivateUser: translateKey(t, "admin.users.menu.deactivateUser", "Deactivate User"),
      approveSpecialist: translateKey(t, "admin.users.menu.approveSpecialist", "Approve Specialist"),
      rejectSpecialist: translateKey(t, "admin.users.menu.rejectSpecialist", "Reject Specialist"),
      deleteUser: translateKey(t, "admin.users.menu.deleteUser", "Delete User"),
    },
    actionAria: {
      manage: (name) => translateKey(
        t,
        "admin.users.actionAria.manage",
        "Manage user {name}",
        { name },
      ),
      menuTrigger: (name) => translateKey(
        t,
        "admin.users.actionAria.menuTrigger",
        "More actions for {name}",
        { name },
      ),
    },
    emptyDisplay: translateKey(t, "admin.users.emptyDisplay", "User"),
    actions: {
      edit: translateKey(t, "admin.users.actions.edit", "Edit"),
      activate: translateKey(t, "admin.users.actions.activate", "Activate"),
      deactivate: translateKey(t, "admin.users.actions.deactivate", "Deactivate"),
      delete: translateKey(t, "admin.users.actions.delete", "Delete"),
    },
    loading: translateKey(t, "admin.users.loading", "Loading users..."),
    empty: translateKey(t, "admin.users.empty", "No users have been created yet."),
    emptyFiltered: translateKey(t, "admin.users.emptyFiltered", "No users match your search or filter."),
    retry: translateKey(t, "common.retry", "Retry"),
    loadFailed: translateKey(t, "admin.users.loadFailed", "Failed to load users."),
    createFailed: translateKey(t, "admin.users.createFailed", "Failed to create user."),
    updateFailed: translateKey(t, "admin.users.updateFailed", "Failed to update user."),
    updateStatusFailed: translateKey(t, "admin.users.updateStatusFailed", "Failed to update user status."),
    verificationFailed: translateKey(
      t,
      "admin.users.verificationFailed",
      "Failed to update specialist verification.",
    ),
    deleteFailed: translateKey(t, "admin.users.deleteFailed", "Failed to delete user."),
    createdSuccess: translateKey(t, "admin.users.createdSuccess", "User created successfully."),
    updatedSuccess: translateKey(t, "admin.users.updatedSuccess", "User updated successfully."),
    activatedSuccess: translateKey(t, "admin.users.activatedSuccess", "User activated."),
    deactivatedSuccess: translateKey(t, "admin.users.deactivatedSuccess", "User deactivated."),
    approvedSuccess: translateKey(t, "admin.users.approvedSuccess", "Specialist approved."),
    rejectedSuccess: translateKey(t, "admin.users.rejectedSuccess", "Specialist rejected."),
    deletedSuccess: translateKey(t, "admin.users.deletedSuccess", "User deleted successfully."),
    form: {
      addTitle: translateKey(t, "admin.users.form.addTitle", "Add User"),
      editTitle: translateKey(t, "admin.users.form.editTitle", "Edit User"),
      fullName: translateKey(t, "admin.users.form.fullName", "Full Name"),
      email: translateKey(t, "admin.users.form.email", "Email"),
      password: translateKey(t, "admin.users.form.password", "Password"),
      phoneOptional: translateKey(t, "admin.users.form.phoneOptional", "Phone (optional)"),
      role: translateKey(t, "admin.users.form.role", "Role"),
      specialization: translateKey(t, "admin.users.form.specialization", "Specialization"),
      licenseNumber: translateKey(t, "admin.users.form.licenseNumber", "License Number"),
      cancel: translateKey(t, "common.cancel", "Cancel"),
      save: translateKey(t, "common.save", "Save"),
      create: translateKey(t, "admin.users.form.create", "Create"),
      saving: translateKey(t, "admin.users.form.saving", "Saving..."),
      passwordRequirementsAriaLabel: translateKey(
        t,
        "admin.users.form.passwordRequirementsAriaLabel",
        "Password requirements",
      ),
    },
    dialogs: {
      activateTitle: translateKey(t, "admin.users.dialogs.activateTitle", "Activate User"),
      deactivateTitle: translateKey(t, "admin.users.dialogs.deactivateTitle", "Deactivate User"),
      activateBody: translateKey(
        t,
        "admin.users.dialogs.activateBody",
        "This user will regain access to the platform.",
      ),
      deactivateBody: translateKey(
        t,
        "admin.users.dialogs.deactivateBody",
        "This user will lose access to the platform until reactivated.",
      ),
      deleteTitle: translateKey(t, "admin.users.dialogs.deleteTitle", "Delete user?"),
      deleteSelfTitle: translateKey(t, "admin.users.dialogs.deleteSelfTitle", "Delete your account?"),
      deleteBody: translateKey(
        t,
        "admin.users.dialogs.deleteBody",
        "Are you sure you want to delete {name}? This action cannot be undone.",
      ),
      deleteSelfBody: translateKey(
        t,
        "admin.users.dialogs.deleteSelfBody",
        "You are about to delete your own admin account. This action cannot be undone.",
      ),
      deleting: translateKey(t, "admin.users.dialogs.deleting", "Deleting..."),
    },
  };
}

export function getAdminUsersRoleFilterOptions(t = null) {
  const labels = getAdminUsersLabels(t);
  return [
    { id: "all", label: labels.filterAll, value: null },
    { id: "admin", label: getAdminRoleDisplayLabel("admin", t), value: "admin" },
    { id: "specialist", label: getAdminRoleDisplayLabel("specialist", t), value: "specialist" },
    { id: "parent", label: getAdminRoleDisplayLabel("parent", t), value: "parent" },
  ];
}

export function getAdminUserRoleOptions(t = null) {
  return [
    { value: "admin", label: getAdminRoleDisplayLabel("admin", t) },
    { value: "specialist", label: getAdminRoleDisplayLabel("specialist", t) },
    { value: "parent", label: getAdminRoleDisplayLabel("parent", t) },
  ];
}

export function formatAdminPresenceLabel(status, now = new Date(), context = {}) {
  const { t, locale } = resolveAdminMapperContext(context);

  if (!status) {
    return translateKey(t, "admin.users.status.offline", "Offline");
  }

  if (status.isOnline) {
    return translateKey(t, "admin.users.status.online", "Online");
  }

  const lastSeen = status.lastSeen;
  if (!lastSeen) {
    return translateKey(t, "admin.users.status.offline", "Offline");
  }

  const localLastSeen = new Date(lastSeen);
  const diffMs = now.getTime() - localLastSeen.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return translateKey(t, "admin.users.status.lastSeenJustNow", "Last seen just now");
  }

  if (diffMinutes < 60) {
    return translateKey(
      t,
      "admin.users.status.lastSeenMinutesAgo",
      "Last seen {count}m ago",
      { count: diffMinutes },
    );
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) {
    return translateKey(
      t,
      "admin.users.status.lastSeenHoursAgo",
      "Last seen {count}h ago",
      { count: diffHours },
    );
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const seenDay = new Date(
    localLastSeen.getFullYear(),
    localLastSeen.getMonth(),
    localLastSeen.getDate(),
  );
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (seenDay.getTime() === yesterday.getTime()) {
    return translateKey(t, "admin.users.status.lastSeenYesterday", "Last seen yesterday");
  }

  const formattedDate = formatAppDate(localLastSeen, locale);
  return translateKey(
    t,
    "admin.users.status.lastSeenDate",
    "Last seen {date}",
    { date: formattedDate ?? "" },
  );
}

export function validateAddUserFormLocalized(form, { isPasswordValid }, context = {}) {
  const { t } = resolveAdminMapperContext(context);
  const fullName = form.fullName?.trim() ?? "";
  const email = form.email?.trim() ?? "";
  const password = form.password ?? "";
  const role = form.role?.trim() ?? "";
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (fullName.length < 3) {
    return fullName.length === 0
      ? translateKey(t, "admin.users.validation.fullNameRequired", "Full name is required.")
      : translateKey(
        t,
        "admin.users.validation.fullNameMinLength",
        "Full name must be at least 3 characters long.",
      );
  }

  if (fullName.length > 150) {
    return translateKey(
      t,
      "admin.users.validation.fullNameMaxLength",
      "Full name must not exceed 150 characters.",
    );
  }

  if (!email) {
    return translateKey(t, "admin.users.validation.emailRequired", "Email is required.");
  }

  if (!EMAIL_PATTERN.test(email)) {
    return translateKey(t, "admin.users.validation.emailInvalid", "Please enter a valid email address.");
  }

  if (!password) {
    return translateKey(t, "admin.users.validation.passwordRequired", "Password is required.");
  }

  if (!isPasswordValid(password)) {
    return translateKey(t, "admin.users.validation.passwordInvalid", "Please create a valid password.");
  }

  if (!role) {
    return translateKey(t, "admin.users.validation.roleRequired", "Role is required.");
  }

  if (role === "specialist") {
    if (!form.specialization?.trim()) {
      return translateKey(
        t,
        "admin.users.validation.specializationRequired",
        "Specialization is required for specialists.",
      );
    }
    if (!form.licenseNumber?.trim()) {
      return translateKey(
        t,
        "admin.users.validation.licenseRequired",
        "License number is required for specialists.",
      );
    }
  }

  return null;
}

export function validateEditUserFormLocalized(form, context = {}) {
  const { t } = resolveAdminMapperContext(context);
  const fullName = form.fullName?.trim() ?? "";
  const role = form.role?.trim() ?? "";

  if (fullName.length < 3) {
    return fullName.length === 0
      ? translateKey(t, "admin.users.validation.fullNameRequired", "Full name is required.")
      : translateKey(
        t,
        "admin.users.validation.fullNameMinLength",
        "Full name must be at least 3 characters long.",
      );
  }

  if (fullName.length > 150) {
    return translateKey(
      t,
      "admin.users.validation.fullNameMaxLength",
      "Full name must not exceed 150 characters.",
    );
  }

  if (!role) {
    return translateKey(t, "admin.users.validation.roleRequired", "Role is required.");
  }

  return null;
}

export function getAdminPasswordRules(t = null) {
  return getPasswordRules(t).map((rule) => ({
    key: rule.key,
    label: rule.label,
    satisfied: rule.satisfied,
  }));
}

export function applyAdminUserLocalization(user, context = {}) {
  if (!user) {
    return user;
  }

  const { t } = resolveAdminMapperContext(context);
  const labels = getAdminUsersLabels(t);
  const verificationKey = user.verificationStatus;
  const verificationLabel = verificationKey && labels.verification[verificationKey]
    ? labels.verification[verificationKey]
    : labels.verification.notApplicable;

  return {
    ...user,
    roleLabel: getAdminRoleDisplayLabel(user.role, t),
    statusLabel: user.isActive ? labels.statusActive : labels.statusInactive,
    verificationLabel,
    specializationDisplay: user.role === "specialist"
      ? (user.specialization || labels.verification.notApplicable)
      : labels.verification.notApplicable,
    licenseDisplay: user.role === "specialist"
      ? (user.licenseNumber || labels.verification.notApplicable)
      : labels.verification.notApplicable,
  };
}

export function applyAdminUsersLocalization(users, context = {}) {
  if (!Array.isArray(users)) {
    return [];
  }

  return users.map((user) => applyAdminUserLocalization(user, context));
}
