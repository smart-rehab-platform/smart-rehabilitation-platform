import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { fetchAdminPatients } from "../../../services/adminPatientsService";
import {
  assignPatientSpecialist,
  fetchPatientGuardians,
  fetchPatientSpecialists,
  linkPatientGuardian,
  unlinkPatientGuardian,
  unlinkPatientSpecialist,
} from "../../../services/adminPatientAssignmentsService";
import { fetchAdminUsers } from "../../../services/adminUsersService";
import { mapAdminPatientRecord } from "../utils/adminPatientsMappers";
import { applyAdminPatientsLocalization } from "../utils/adminPatientsLocalization.js";
import {
  friendlyAssignmentErrorLocalized,
  getAdminAssignmentsLabels,
  applyAdminGuardianLinksLocalization,
} from "../utils/adminPatientAssignmentsLocalization.js";
import {
  mapParentUserOption,
  mapPatientGuardianLink,
  mapPatientSpecialistLink,
  mapSpecialistUserOption,
  sortByName,
} from "../utils/adminPatientAssignmentsMappers";

function resolveErrorMessage(error, fallback, context = {}) {
  if (error instanceof Error && error.message) {
    return friendlyAssignmentErrorLocalized(error.message, context);
  }

  return fallback;
}

function resolveInitialPatientId(patients, preferredPatientId) {
  if (preferredPatientId && patients.some((patient) => patient.id === preferredPatientId)) {
    return preferredPatientId;
  }

  return patients[0]?.id ?? null;
}

function resolveDefaultUserId(users) {
  return users[0]?.userId ?? null;
}

export function useAdminPatientAssignments(preferredPatientId = null) {
  const { t, locale } = useLocale();
  const labels = useMemo(() => getAdminAssignmentsLabels(t), [t]);
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const [patients, setPatients] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [parents, setParents] = useState([]);
  const [assignedSpecialists, setAssignedSpecialists] = useState([]);
  const [linkedParents, setLinkedParents] = useState([]);

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedRelationship, setSelectedRelationship] = useState("mother");
  const [isPrimarySpecialist, setIsPrimarySpecialist] = useState(true);
  const [isPrimaryContact, setIsPrimaryContact] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRelationships, setIsLoadingRelationships] = useState(false);
  const [isSubmittingSpecialist, setIsSubmittingSpecialist] = useState(false);
  const [isSubmittingParent, setIsSubmittingParent] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const [initError, setInitError] = useState(null);
  const [relationshipsError, setRelationshipsError] = useState(null);
  const [specialistFormError, setSpecialistFormError] = useState(null);
  const [parentFormError, setParentFormError] = useState(null);

  const [refreshToken, setRefreshToken] = useState(0);
  const initTokenRef = useRef(0);
  const relationshipsTokenRef = useRef(0);
  const preferredPatientIdRef = useRef(preferredPatientId);

  useEffect(() => {
    preferredPatientIdRef.current = preferredPatientId;
  }, [preferredPatientId]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const resetFormSelections = useCallback((nextSpecialists, nextParents) => {
    setSelectedSpecialistId(resolveDefaultUserId(nextSpecialists));
    setSelectedParentId(resolveDefaultUserId(nextParents));
    setSelectedRelationship("mother");
    setIsPrimarySpecialist(true);
    setIsPrimaryContact(true);
    setSpecialistFormError(null);
    setParentFormError(null);
  }, []);

  const loadRelationships = useCallback(async (patientId) => {
    const loadToken = relationshipsTokenRef.current + 1;
    relationshipsTokenRef.current = loadToken;

    if (!patientId) {
      setAssignedSpecialists([]);
      setLinkedParents([]);
      setRelationshipsError(null);
      setIsLoadingRelationships(false);
      return;
    }

    setIsLoadingRelationships(true);
    setRelationshipsError(null);

    try {
      const [specialistRows, guardianRows] = await Promise.all([
        fetchPatientSpecialists(patientId),
        fetchPatientGuardians(patientId),
      ]);

      if (relationshipsTokenRef.current !== loadToken) {
        return;
      }

      setAssignedSpecialists(
        specialistRows.map(mapPatientSpecialistLink).filter(Boolean),
      );
      setLinkedParents(
        applyAdminGuardianLinksLocalization(
          guardianRows.map(mapPatientGuardianLink).filter(Boolean),
          mapperContext,
        ),
      );
    } catch (loadError) {
      if (relationshipsTokenRef.current !== loadToken) {
        return;
      }

      setAssignedSpecialists([]);
      setLinkedParents([]);
      setRelationshipsError(resolveErrorMessage(loadError, labels.loadRelationshipsFailed, mapperContext));
    } finally {
      if (relationshipsTokenRef.current === loadToken) {
        setIsLoadingRelationships(false);
      }
    }
  }, [mapperContext, labels.loadRelationshipsFailed]);

  const selectPatient = useCallback((patientId) => {
    setSelectedPatientId(patientId || null);
    setAssignedSpecialists([]);
    setLinkedParents([]);
    setRelationshipsError(null);
    resetFormSelections(specialists, parents);

    if (patientId) {
      loadRelationships(patientId);
    }
  }, [loadRelationships, parents, resetFormSelections, specialists]);

  useEffect(() => {
    const loadToken = initTokenRef.current + 1;
    initTokenRef.current = loadToken;
    let cancelled = false;

    async function initialize() {
      setIsLoading(true);
      setInitError(null);

      try {
        const [patientRows, userRows] = await Promise.all([
          fetchAdminPatients(),
          fetchAdminUsers(),
        ]);

        if (cancelled || initTokenRef.current !== loadToken) {
          return;
        }

        const nextPatients = applyAdminPatientsLocalization(
          patientRows.map(mapAdminPatientRecord).filter(Boolean),
          mapperContext,
        );
        const nextSpecialists = sortByName(
          userRows.map(mapSpecialistUserOption).filter(Boolean),
        );
        const nextParents = sortByName(
          userRows.map(mapParentUserOption).filter(Boolean),
        );
        const nextPatientId = resolveInitialPatientId(
          nextPatients,
          preferredPatientIdRef.current,
        );

        setPatients(nextPatients);
        setSpecialists(nextSpecialists);
        setParents(nextParents);
        setSelectedPatientId(nextPatientId);
        setSelectedSpecialistId(resolveDefaultUserId(nextSpecialists));
        setSelectedParentId(resolveDefaultUserId(nextParents));
        setSelectedRelationship("mother");
        setIsPrimarySpecialist(true);
        setIsPrimaryContact(true);
        setSpecialistFormError(null);
        setParentFormError(null);

        if (nextPatientId) {
          await loadRelationships(nextPatientId);
        } else {
          setAssignedSpecialists([]);
          setLinkedParents([]);
        }
      } catch (loadError) {
        if (cancelled || initTokenRef.current !== loadToken) {
          return;
        }

        setPatients([]);
        setSpecialists([]);
        setParents([]);
        setSelectedPatientId(null);
        setAssignedSpecialists([]);
        setLinkedParents([]);
        setInitError(resolveErrorMessage(loadError, labels.loadFailed, mapperContext));
      } finally {
        if (!cancelled && initTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [refreshToken, loadRelationships, labels.loadFailed, mapperContext]);

  const assignSpecialist = useCallback(async () => {
    if (!selectedPatientId) {
      setSpecialistFormError(labels.selectPatientRequired);
      return { ok: false };
    }

    if (!selectedSpecialistId) {
      setSpecialistFormError(labels.selectSpecialistRequired);
      return { ok: false };
    }

    setIsSubmittingSpecialist(true);
    setSpecialistFormError(null);

    try {
      await assignPatientSpecialist(selectedPatientId, {
        specialist_id: selectedSpecialistId,
        is_primary: isPrimarySpecialist,
      });
      await loadRelationships(selectedPatientId);
      return { ok: true, message: labels.assignSpecialistSuccess };
    } catch (submitError) {
      const message = resolveErrorMessage(submitError, labels.assignSpecialistFailed, mapperContext);
      setSpecialistFormError(message);
      return { ok: false, message };
    } finally {
      setIsSubmittingSpecialist(false);
    }
  }, [
    isPrimarySpecialist,
    labels,
    loadRelationships,
    mapperContext,
    selectedPatientId,
    selectedSpecialistId,
  ]);

  const linkParent = useCallback(async () => {
    if (!selectedPatientId) {
      setParentFormError(labels.selectPatientRequired);
      return { ok: false };
    }

    if (!selectedParentId) {
      setParentFormError(labels.selectParentRequired);
      return { ok: false };
    }

    setIsSubmittingParent(true);
    setParentFormError(null);

    try {
      await linkPatientGuardian(selectedPatientId, {
        parent_id: selectedParentId,
        relationship: selectedRelationship,
        is_primary_contact: isPrimaryContact,
      });
      await loadRelationships(selectedPatientId);
      return { ok: true, message: labels.linkParentSuccess };
    } catch (submitError) {
      const message = resolveErrorMessage(submitError, labels.linkParentFailed, mapperContext);
      setParentFormError(message);
      return { ok: false, message };
    } finally {
      setIsSubmittingParent(false);
    }
  }, [
    isPrimaryContact,
    labels,
    loadRelationships,
    mapperContext,
    selectedParentId,
    selectedPatientId,
    selectedRelationship,
  ]);

  const unlinkSpecialist = useCallback(async (specialistId) => {
    if (!selectedPatientId) {
      return { ok: false, message: labels.selectPatientRequired };
    }

    if (!specialistId) {
      return { ok: false, message: labels.specialistIdMissing };
    }

    if (isUnlinking) {
      return { ok: false, message: labels.unlinkInProgress };
    }

    setIsUnlinking(true);

    try {
      await unlinkPatientSpecialist(selectedPatientId, specialistId);
      await loadRelationships(selectedPatientId);
      return { ok: true, message: labels.unlinkSpecialistSuccess };
    } catch (submitError) {
      return {
        ok: false,
        message: resolveErrorMessage(submitError, labels.unlinkSpecialistFailed, mapperContext),
      };
    } finally {
      setIsUnlinking(false);
    }
  }, [isUnlinking, labels, loadRelationships, mapperContext, selectedPatientId]);

  const unlinkParent = useCallback(async (parentId) => {
    if (!selectedPatientId) {
      return { ok: false, message: labels.selectPatientRequired };
    }

    if (!parentId) {
      return { ok: false, message: labels.parentIdMissing };
    }

    if (isUnlinking) {
      return { ok: false, message: labels.unlinkInProgress };
    }

    setIsUnlinking(true);

    try {
      await unlinkPatientGuardian(selectedPatientId, parentId);
      await loadRelationships(selectedPatientId);
      return { ok: true, message: labels.unlinkParentSuccess };
    } catch (submitError) {
      return {
        ok: false,
        message: resolveErrorMessage(submitError, labels.unlinkParentFailed, mapperContext),
      };
    } finally {
      setIsUnlinking(false);
    }
  }, [isUnlinking, labels, loadRelationships, mapperContext, selectedPatientId]);

  const canAssignSpecialist = Boolean(
    selectedPatientId
    && selectedSpecialistId
    && specialists.length > 0
    && !isSubmittingSpecialist,
  );

  const canLinkParent = Boolean(
    selectedPatientId
    && selectedParentId
    && parents.length > 0
    && !isSubmittingParent,
  );

  return {
    patients,
    specialists,
    parents,
    assignedSpecialists,
    linkedParents,
    selectedPatient,
    selectedPatientId,
    selectedSpecialistId,
    selectedParentId,
    selectedRelationship,
    isPrimarySpecialist,
    isPrimaryContact,
    isLoading,
    isLoadingRelationships,
    isSubmittingSpecialist,
    isSubmittingParent,
    isUnlinking,
    initError,
    relationshipsError,
    specialistFormError,
    parentFormError,
    canAssignSpecialist,
    canLinkParent,
    reload,
    selectPatient,
    setSelectedSpecialistId,
    setSelectedParentId,
    setSelectedRelationship,
    setIsPrimarySpecialist,
    setIsPrimaryContact,
    assignSpecialist,
    linkParent,
    unlinkSpecialist,
    unlinkParent,
    labels,
    retryRelationships: () => {
      if (selectedPatientId) {
        loadRelationships(selectedPatientId);
      }
    },
  };
}
