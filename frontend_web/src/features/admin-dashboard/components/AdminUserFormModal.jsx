import { useState } from "react";
import { getPasswordStrength } from "../../../components/auth/authHelpers";
import { AdminPasswordRequirements } from "./AdminPasswordRequirements";
import {
  validateAddUserForm,
  validateEditUserForm,
} from "../utils/adminUsersMappers";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "specialist", label: "Specialist" },
  { value: "parent", label: "Parent" },
];

const EMPTY_ADD_FORM = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: "parent",
};

function buildInitialForm(mode, user) {
  if (mode === "edit" && user) {
    return {
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      password: "",
      phone: user.phone ?? "",
      role: user.role ?? "parent",
    };
  }

  return EMPTY_ADD_FORM;
}

function AdminUserFormModalInner({
  mode = "add",
  user = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(() => buildInitialForm(mode, user));
  const [error, setError] = useState(null);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = isEdit
      ? validateEditUserForm(form)
      : validateAddUserForm(form, {
          isPasswordValid: (password) => getPasswordStrength(password).isStrong,
        });

    if (validationError) {
      setError(validationError);
      return;
    }

    const submitError = await onSubmit?.(form);
    if (submitError) {
      setError(submitError);
      return;
    }

    onClose?.();
  };

  return (
    <div className="pd-admin-modal-backdrop" role="presentation" onClick={() => !isSubmitting && onClose?.()}>
      <div
        className="pd-admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-user-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-user-form-title" className="pd-admin-modal-title">
          {isEdit ? "Edit User" : "Add User"}
        </h2>

        <form className="pd-admin-form" onSubmit={handleSubmit}>
          <label className="pd-admin-field">
            <span className="pd-admin-field-label">Full Name</span>
            <input
              type="text"
              className="pd-admin-input"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              disabled={isSubmitting}
              autoComplete="name"
            />
          </label>

          <label className="pd-admin-field">
            <span className="pd-admin-field-label">Email</span>
            <input
              type="email"
              className="pd-admin-input"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              disabled={isSubmitting || isEdit}
              autoComplete="email"
            />
          </label>

          {!isEdit ? (
            <>
              <label className="pd-admin-field">
                <span className="pd-admin-field-label">Password</span>
                <input
                  type="password"
                  className="pd-admin-input"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </label>
              {form.password ? (
                <AdminPasswordRequirements password={form.password} />
              ) : null}
            </>
          ) : null}

          <label className="pd-admin-field">
            <span className="pd-admin-field-label">Phone (optional)</span>
            <input
              type="tel"
              className="pd-admin-input"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              disabled={isSubmitting}
              autoComplete="tel"
            />
          </label>

          <label className="pd-admin-field">
            <span className="pd-admin-field-label">Role</span>
            <select
              className="pd-admin-select"
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
              disabled={isSubmitting}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="pd-inline-error">{error}</p> : null}

          <div className="pd-admin-modal-actions">
            <button
              type="button"
              className="pd-btn pd-btn-soft"
              onClick={() => onClose?.()}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="pd-btn pd-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminUserFormModal({
  open,
  mode = "add",
  user = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}) {
  if (!open) {
    return null;
  }

  return (
    <AdminUserFormModalInner
      key={`${mode}-${user?.id ?? "new"}`}
      mode={mode}
      user={user}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
