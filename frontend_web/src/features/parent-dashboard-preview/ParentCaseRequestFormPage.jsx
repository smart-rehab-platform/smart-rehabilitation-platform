import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  buildParentCaseRequestDetailPath,
  buildParentCaseRequestsPath,
} from "../../routes/parentDashboardRoutes";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import {
  useParentCaseCategories,
  useParentCaseRequestDetail,
  useParentCaseRequestForm,
} from "./hooks/useParentCaseRequests";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import {
  buildCaseRequestGenderOptions,
  buildPreferredContactPeriodOptions,
} from "./utils/parentCaseRequestsUtils";
import { CaseRequestChildPhoto } from "./components/case-requests/CaseRequestChildPhoto";
import { useCaseRequestChildPhotoState } from "./hooks/useCaseRequestChildPhotoState";
import "./styles/parentDashboardTokens.css";

const EMPTY_FORM = {
  childName: "",
  dateOfBirth: "",
  gender: "",
  categoryId: "",
  caseDescription: "",
  observedDifficulties: "",
  hasPreviousDiagnosis: false,
  previousDiagnosisDetails: "",
  isCurrentlyReceivingTreatment: false,
  currentTreatmentDetails: "",
  preferredContactPeriod: "flexible",
};

function mapRequestToForm(request) {
  if (!request) {
    return EMPTY_FORM;
  }

  return {
    childName: request.childName || "",
    dateOfBirth: request.dateOfBirth || "",
    gender: request.gender === "male" || request.gender === "female"
      ? request.gender
      : "",
    categoryId: request.categoryId || "",
    caseDescription: request.caseDescription || "",
    observedDifficulties: request.observedDifficulties || "",
    hasPreviousDiagnosis: Boolean(request.hasPreviousDiagnosis),
    previousDiagnosisDetails: request.previousDiagnosisDetails || "",
    isCurrentlyReceivingTreatment: Boolean(request.isCurrentlyReceivingTreatment),
    currentTreatmentDetails: request.currentTreatmentDetails || "",
    preferredContactPeriod: request.preferredContactPeriod || "flexible",
  };
}

function CaseRequestFormFields({
  form,
  categories,
  isEditMode,
  isSubmitting,
  submitError,
  onFieldChange,
  onSubmit,
  photoState,
  t,
  genderOptions,
  contactPeriodOptions,
}) {
  return (
    <form className="pd-case-form pd-card pd-card-pad" onSubmit={onSubmit}>
      <CaseRequestChildPhoto
        childName={form.childName}
        persistedImageUrl={photoState.persistedImageUrl}
        previewUrl={photoState.previewUrl}
        onSelectFile={photoState.handleSelectFile}
        onClearPreview={photoState.handleClearPreview}
        disabled={isSubmitting}
        error={photoState.imageError}
      />

      <label className="pd-form-field">
        <span>{t("parent.caseRequests.childName")}</span>
        <input
          type="text"
          required
          maxLength={150}
          value={form.childName}
          onChange={(event) => onFieldChange("childName", event.target.value)}
        />
      </label>

      <label className="pd-form-field">
        <span>{t("parent.caseRequests.dateOfBirth")}</span>
        <input
          type="date"
          required
          value={form.dateOfBirth}
          onChange={(event) => onFieldChange("dateOfBirth", event.target.value)}
        />
      </label>

      <label className="pd-form-field">
        <span>{t("parent.caseRequests.genderField")}</span>
        <select
          required
          value={form.gender}
          onChange={(event) => onFieldChange("gender", event.target.value)}
        >
          <option value="" disabled>{t("parent.caseRequests.selectGender")}</option>
          {genderOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="pd-form-field">
        <span>{t("parent.caseRequests.categoryField")}</span>
        <select
          required
          value={form.categoryId}
          onChange={(event) => onFieldChange("categoryId", event.target.value)}
        >
          <option value="">{t("parent.caseRequests.selectCategory")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>

      <label className="pd-form-field">
        <span>{t("parent.caseRequests.caseDescriptionField")}</span>
        <textarea
          required
          rows={4}
          maxLength={5000}
          value={form.caseDescription}
          onChange={(event) => onFieldChange("caseDescription", event.target.value)}
        />
      </label>

      <label className="pd-form-field">
        <span>{t("parent.caseRequests.observedDifficultiesField")}</span>
        <textarea
          rows={3}
          maxLength={5000}
          value={form.observedDifficulties}
          onChange={(event) => onFieldChange("observedDifficulties", event.target.value)}
        />
      </label>

      <label className="pd-form-checkbox">
        <input
          type="checkbox"
          checked={form.hasPreviousDiagnosis}
          onChange={(event) => onFieldChange("hasPreviousDiagnosis", event.target.checked)}
        />
        <span>{t("parent.caseRequests.hasPreviousDiagnosis")}</span>
      </label>

      {form.hasPreviousDiagnosis ? (
        <label className="pd-form-field">
          <span>{t("parent.caseRequests.previousDiagnosisDetails")}</span>
          <textarea
            rows={2}
            value={form.previousDiagnosisDetails}
            onChange={(event) => onFieldChange(
              "previousDiagnosisDetails",
              event.target.value,
            )}
          />
        </label>
      ) : null}

      <label className="pd-form-checkbox">
        <input
          type="checkbox"
          checked={form.isCurrentlyReceivingTreatment}
          onChange={(event) => onFieldChange(
            "isCurrentlyReceivingTreatment",
            event.target.checked,
          )}
        />
        <span>{t("parent.caseRequests.currentlyReceivingTreatment")}</span>
      </label>

      {form.isCurrentlyReceivingTreatment ? (
        <label className="pd-form-field">
          <span>{t("parent.caseRequests.currentTreatmentDetails")}</span>
          <textarea
            rows={2}
            value={form.currentTreatmentDetails}
            onChange={(event) => onFieldChange(
              "currentTreatmentDetails",
              event.target.value,
            )}
          />
        </label>
      ) : null}

      <label className="pd-form-field">
        <span>{t("parent.caseRequests.preferredContactPeriod")}</span>
        <select
          required
          value={form.preferredContactPeriod}
          onChange={(event) => onFieldChange(
            "preferredContactPeriod",
            event.target.value,
          )}
        >
          {contactPeriodOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      {submitError ? <p className="pd-inline-error">{submitError}</p> : null}

      <button
        type="submit"
        className="pd-btn pd-btn-primary"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? t("parent.caseRequests.saving")
          : isEditMode
            ? t("parent.caseRequests.updateRequest")
            : t("parent.caseRequests.submitRequest")}
      </button>
    </form>
  );
}

function CaseRequestFormEditor({
  request,
  categories,
  isEditMode,
  requestId,
  onSuccess,
}) {
  const { t } = useLocale();
  const [form, setForm] = useState(() => mapRequestToForm(request));
  const photoState = useCaseRequestChildPhotoState({
    persistedImageUrl: request?.childImageUrl ?? null,
  });
  const { isSubmitting, submitError, submit } = useParentCaseRequestForm({
    requestId: isEditMode ? requestId : null,
    onSuccess,
  });

  const genderOptions = useMemo(() => buildCaseRequestGenderOptions(t), [t]);
  const contactPeriodOptions = useMemo(() => buildPreferredContactPeriodOptions(t), [t]);

  const updateField = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    await submit(form, { pendingChildImageFile: photoState.pendingFile });
  }, [form, photoState.pendingFile, submit]);

  return (
    <CaseRequestFormFields
      form={form}
      categories={categories}
      isEditMode={isEditMode}
      isSubmitting={isSubmitting}
      submitError={submitError}
      onFieldChange={updateField}
      onSubmit={handleSubmit}
      photoState={photoState}
      t={t}
      genderOptions={genderOptions}
      contactPeriodOptions={contactPeriodOptions}
    />
  );
}

export default function ParentCaseRequestFormPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const isEditMode = Boolean(requestId);
  const { t } = useLocale();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);
  const { categories, isLoading: isLoadingCategories } = useParentCaseCategories();
  const { request, isLoading: isLoadingRequest } = useParentCaseRequestDetail(
    isEditMode ? requestId : null,
  );
  const {
    notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    markNotificationRead,
  } = useParentNotifications(parentUserId);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const navigation = useParentDashboardNavigation({
    selectedChildId: null,
    exercises: [],
    upcomingSession: null,
    latestReport: null,
    markNotificationRead,
    showToast,
    closeMobileNav,
  });

  const handleSuccess = useCallback((savedRequest) => {
    navigate(buildParentCaseRequestDetailPath(savedRequest.id), { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    document.body.classList.add("pd-preview-drawer-open");
    return () => document.body.classList.remove("pd-preview-drawer-open");
  }, [mobileNavOpen]);

  const badges = useMemo(() => ({
    notifications:
      !notificationsError && !isLoadingNotifications && unreadCount > 0
        ? unreadCount
        : null,
    messages: messageUnreadCount > 0 ? messageUnreadCount : null,
  }), [
    notificationsError,
    isLoadingNotifications,
    unreadCount,
    messageUnreadCount,
  ]);

  const handleBack = useCallback(() => {
    if (isEditMode && requestId) {
      navigate(buildParentCaseRequestDetailPath(requestId));
      return;
    }
    navigate(buildParentCaseRequestsPath());
  }, [isEditMode, navigate, requestId]);

  const isLoading = isLoadingCategories || (isEditMode && isLoadingRequest);
  const formKey = isEditMode ? request?.id || "loading" : "new";

  return (
    <div className="pd-preview">
      <ParentDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        badges={badges}
        parent={parent}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        notificationsLoading={isLoadingNotifications}
        notificationsError={notificationsError}
        onNotificationSelect={navigation.handleNotificationSelect}
        onViewAllNotifications={navigation.handleViewAllNotifications}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={navigation.handleSidebarNav}
        onSignOut={navigation.handleSignOut}
        onViewProfile={navigation.handleViewProfile}
        onMessages={navigation.handleMessages}
      >
        <div className="pd-task-hub-page">
          <div className="pd-task-hub-toolbar">
            <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t("parent.common.back")}
            </button>
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">
              {isEditMode
                ? t("parent.caseRequests.formTitleEdit")
                : t("parent.caseRequests.formTitleNew")}
            </h1>
            <p className="pd-task-hub-subtitle">
              {t("parent.caseRequests.formSubtitle")}
            </p>
          </header>

          {isLoading ? (
            <section className="pd-card pd-card-pad pd-task-hub-state">
              <p className="pd-inline-loading">{t("parent.caseRequests.loadingForm")}</p>
            </section>
          ) : (
            <CaseRequestFormEditor
              key={formKey}
              request={isEditMode ? request : null}
              categories={categories}
              isEditMode={isEditMode}
              requestId={requestId}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </ParentDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
