import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  createComplaint,
  getComplaintById,
  getMyComplaints,
  uploadComplaintAttachment,
} from "../../../services/parentComplaintsService";
import { getChildren, getPatientSpecialists } from "../../../services/parentDashboardService";
import { mergeChildren } from "../utils/parentDashboardMappers";
import {
  buildComplaintCreatePayload,
  buildParentComplaintCategoryOptions,
  mapParentComplaintDetails,
  mapParentComplaintSubmitError,
  mapParentComplaints,
  mapPatientSpecialistLinks,
  pickDefaultSpecialist,
  validateComplaintAttachmentFile,
  validateComplaintForm,
} from "../utils/parentComplaintsUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useParentComplaints() {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(() => ({ t, locale }), [t, locale]);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadComplaints() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await getMyComplaints();
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setComplaints(mapParentComplaints(rows, mapperOptions));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, t("parent.common.somethingWrong")));
          setComplaints([]);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadComplaints();

    return () => {
      cancelled = true;
    };
  }, [refreshToken, mapperOptions, t]);

  return { complaints, isLoading, error, refetch };
}

export function useParentComplaintDetails(complaintId) {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(() => ({ t, locale }), [t, locale]);
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(complaintId));
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const normalizedId = typeof complaintId === "string" ? complaintId.trim() : "";
    if (!normalizedId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadDetails() {
      setIsLoading(true);
      setError(null);

      try {
        const row = await getComplaintById(normalizedId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = mapParentComplaintDetails(row, mapperOptions);
        if (!mapped) {
          setComplaint(null);
          setError(t("parent.complaints.notFound"));
          return;
        }

        setComplaint(mapped);
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          const message = resolveErrorMessage(loadError, t("parent.common.somethingWrong"));
          setError(message);
          setComplaint(null);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [complaintId, refreshToken, mapperOptions, t]);

  if (!complaintId || (typeof complaintId === "string" && !complaintId.trim())) {
    return {
      complaint: null,
      isLoading: false,
      error: t("parent.complaints.notFound"),
      refetch,
    };
  }

  return { complaint, isLoading, error, refetch };
}

const EMPTY_FORM = {
  patientId: "",
  specialistId: "",
  category: "",
  description: "",
};

export function useParentComplaintForm(parentUserId) {
  const { t } = useLocale();
  const categoryOptions = useMemo(() => buildParentComplaintCategoryOptions(t), [t]);
  const [children, setChildren] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isLoadingChildren, setIsLoadingChildren] = useState(Boolean(parentUserId));
  const [isLoadingSpecialists, setIsLoadingSpecialists] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [childrenError, setChildrenError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const submittingRef = useRef(false);
  const specialistsTokenRef = useRef(0);

  const refetchChildren = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const updateField = useCallback((field, value) => {
    setForm((current) => {
      if (field === "patientId" && value !== current.patientId) {
        return { ...current, patientId: value, specialistId: "" };
      }
      return { ...current, [field]: value };
    });
    setFormErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitError(null);
  }, []);

  useEffect(() => {
    if (!parentUserId) {
      return undefined;
    }

    let cancelled = false;

    async function loadChildren() {
      setIsLoadingChildren(true);
      setChildrenError(null);

      try {
        const rows = await getChildren(parentUserId);
        if (cancelled) {
          return;
        }

        const mapped = mergeChildren(rows, []);
        setChildren(mapped);

        if (mapped.length === 1) {
          setForm((current) => (
            current.patientId ? current : { ...current, patientId: mapped[0].id }
          ));
        }
      } catch (loadError) {
        if (!cancelled) {
          setChildren([]);
          setChildrenError(resolveErrorMessage(loadError, t("parent.hooks.loadChildrenFailed")));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingChildren(false);
        }
      }
    }

    loadChildren();

    return () => {
      cancelled = true;
    };
  }, [parentUserId, refreshToken, t]);

  useEffect(() => {
    if (!form.patientId) {
      return undefined;
    }

    const loadToken = specialistsTokenRef.current + 1;
    specialistsTokenRef.current = loadToken;
    let cancelled = false;

    async function loadSpecialists() {
      setIsLoadingSpecialists(true);
      setForm((current) => ({ ...current, specialistId: "" }));

      try {
        const rows = await getPatientSpecialists(form.patientId);
        if (cancelled || specialistsTokenRef.current !== loadToken) {
          return;
        }

        const mapped = mapPatientSpecialistLinks(rows);
        setSpecialists(mapped);

        const selected = pickDefaultSpecialist(mapped);
        if (selected) {
          setForm((current) => ({
            ...current,
            specialistId: selected.specialistId,
          }));
        }
      } catch {
        if (!cancelled && specialistsTokenRef.current === loadToken) {
          setSpecialists([]);
        }
      } finally {
        if (!cancelled && specialistsTokenRef.current === loadToken) {
          setIsLoadingSpecialists(false);
        }
      }
    }

    loadSpecialists();

    return () => {
      cancelled = true;
    };
  }, [form.patientId]);

  const selectAttachment = useCallback((file) => {
    const validation = validateComplaintAttachmentFile(file, t);
    if (!validation.valid) {
      setFormErrors((current) => ({ ...current, attachment: validation.error }));
      return false;
    }

    setAttachmentFile(file);
    setFormErrors((current) => {
      if (!current.attachment) {
        return current;
      }
      const next = { ...current };
      delete next.attachment;
      return next;
    });
    setSubmitError(null);
    return true;
  }, [t]);

  const clearAttachment = useCallback(() => {
    setAttachmentFile(null);
    setFormErrors((current) => {
      if (!current.attachment) {
        return current;
      }
      const next = { ...current };
      delete next.attachment;
      return next;
    });
  }, []);

  const submitComplaint = useCallback(async () => {
    if (submittingRef.current || isSubmitting || isUploadingAttachment) {
      return { ok: false };
    }

    const validationErrors = validateComplaintForm({
      patientId: form.patientId,
      specialistId: form.specialistId,
      category: form.category,
      description: form.description,
      hasAssignedSpecialist: (form.patientId ? specialists : []).length > 0,
    }, t);

    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return { ok: false };
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let attachmentUrl = null;

      if (attachmentFile) {
        setIsUploadingAttachment(true);
        try {
          const uploaded = await uploadComplaintAttachment(attachmentFile);
          attachmentUrl = uploaded?.url ?? null;
          if (!attachmentUrl) {
            throw new Error("Attachment upload did not return a file URL.");
          }
        } finally {
          setIsUploadingAttachment(false);
        }
      }

      const payload = buildComplaintCreatePayload({
        patientId: form.patientId,
        specialistId: form.specialistId,
        category: form.category,
        description: form.description,
        attachmentUrl,
      });

      await createComplaint(payload);
      return { ok: true };
    } catch (submitErr) {
      setSubmitError(mapParentComplaintSubmitError(submitErr, t));
      return { ok: false };
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [
    attachmentFile,
    form,
    isSubmitting,
    isUploadingAttachment,
    specialists,
    t,
  ]);

  const visibleSpecialists = form.patientId ? specialists : [];

  const selectedSpecialist = visibleSpecialists.find(
    (item) => item.specialistId === form.specialistId,
  ) ?? null;

  if (!parentUserId) {
    return {
      children: [],
      specialists: [],
      selectedSpecialist: null,
      form: EMPTY_FORM,
      attachmentFile: null,
      formErrors: {},
      isLoadingChildren: false,
      isLoadingSpecialists: false,
      isUploadingAttachment: false,
      isSubmitting: false,
      submitError: null,
      childrenError: t("parent.complaints.notSignedIn"),
      categoryOptions,
      updateField,
      selectAttachment,
      clearAttachment,
      submitComplaint,
      refetchChildren,
    };
  }

  return {
    children,
    specialists: visibleSpecialists,
    selectedSpecialist,
    form,
    attachmentFile,
    formErrors,
    isLoadingChildren,
    isLoadingSpecialists,
    isUploadingAttachment,
    isSubmitting,
    submitError,
    childrenError,
    categoryOptions,
    updateField,
    selectAttachment,
    clearAttachment,
    submitComplaint,
    refetchChildren,
  };
}
