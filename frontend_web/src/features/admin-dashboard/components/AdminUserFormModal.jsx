import { useMemo, useState } from "react";
import { getPasswordStrength } from "../../../components/auth/authHelpers";
import { useLocale } from "../../../context/useLocale.js";
import { AdminPasswordRequirements } from "./AdminPasswordRequirements";
import {
  getAdminUserRoleOptions,
  getAdminUsersLabels,
  validateAddUserFormLocalized,
  validateEditUserFormLocalized,
} from "../utils/adminUsersLocalization.js";

const EMPTY_ADD_FORM = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: "parent",
  specialization: "",
  licenseNumber: "",
};

function buildInitialForm(mode, user) {
  if (mode === "edit" && user) {
    return {
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      password: "",
      phone: user.phone ?? "",
      role: user.role ?? "parent",
      specialization: user.specialization ?? "",
      licenseNumber: user.licenseNumber ?? "",
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
  const { t } = useLocale();
  const labels = useMemo(() => getAdminUsersLabels(t), [t]);
  const roleOptions = useMemo(() => getAdminUserRoleOptions(t), [t]);
  const isEdit = mode === "edit";
  const [form, setForm] = useState(() => buildInitialForm(mode, user));
  const [error, setError] = useState(null);
  const mapperContext = useMemo(() => ({ t }), [t]);
  const showSpecialistFields = form.role === "specialist";

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = isEdit
      ? validateEditUserFormLocalized(form, mapperContext)
      : validateAddUserFormLocalized(form, {
        isPasswordValid: (password) => getPasswordStrength(password).isStrong,
      }, mapperContext);

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
          {isEdit ? labels.form.editTitle : labels.form.addTitle}
        </h2>

        <form className="pd-admin-form" onSubmit={handleSubmit}>
          <label className="pd-admin-field">
            <span className="pd-admin-field-label">{labels.form.fullName}</span>
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
            <span className="pd-admin-field-label">{labels.form.email}</span>
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
                <span className="pd-admin-field-label">{labels.form.password}</span>
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
            <span className="pd-admin-field-label">{labels.form.phoneOptional}</span>
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
            <span className="pd-admin-field-label">{labels.form.role}</span>
            <select
              className="pd-admin-select"
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
              disabled={isSubmitting || isEdit}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {showSpecialistFields ? (
            <>
              <label className="pd-admin-field">
                <span className="pd-admin-field-label">{labels.form.specialization}</span>
                <input
                  type="text"
                  className="pd-admin-input"
                  value={form.specialization}
                  onChange={(event) => updateField("specialization", event.target.value)}
                  disabled={isSubmitting || isEdit}
                  autoComplete="organization-title"
                />
              </label>

              <label className="pd-admin-field">
                <span className="pd-admin-field-label">{labels.form.licenseNumber}</span>
                <input
                  type="text"
                  className="pd-admin-input"
                  value={form.licenseNumber}
                  onChange={(event) => updateField("licenseNumber", event.target.value)}
                  disabled={isSubmitting || isEdit}
                />
              </label>
            </>
          ) : null}

          {error ? <p className="pd-inline-error">{error}</p> : null}

          <div className="pd-admin-modal-actions">
            <button
              type="button"
              className="pd-btn pd-btn-soft"
              onClick={() => onClose?.()}
              disabled={isSubmitting}
            >
              {labels.form.cancel}
            </button>
            <button type="submit" className="pd-btn pd-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? labels.form.saving : isEdit ? labels.form.save : labels.form.create}
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
