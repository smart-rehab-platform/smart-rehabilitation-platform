import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  finalizeRecordedAudioBlob,
  getSupportedRecorderMimeType,
  inferMessageAttachmentMimeType,
  validateMessageAttachmentFile,
} from "../utils/specialistMessageAttachmentUtils";
import {
  getSpecialistMessageAttachmentValidationMessages,
  localizeSpecialistAttachmentValidationError,
} from "../utils/specialistMessagesLocalization.js";

function buildDraftFromFile(file, t) {
  const mimeType = inferMessageAttachmentMimeType(file);
  const validationError = validateMessageAttachmentFile(file);
  if (validationError) {
    return { error: localizeSpecialistAttachmentValidationError(validationError, t) };
  }

  const previewUrl = mimeType?.startsWith("image/") || mimeType?.startsWith("audio/")
    ? URL.createObjectURL(file)
    : null;

  return {
    draft: {
      file,
      mimeType,
      previewUrl,
      sizeBytes: file.size,
    },
  };
}

export function useSpecialistMessageAttachmentDraft() {
  const { t } = useLocale();
  const validationMessages = getSpecialistMessageAttachmentValidationMessages(t);
  const [draft, setDraft] = useState(null);
  const [draftError, setDraftError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordingChunksRef = useRef([]);

  const clearDraft = useCallback(() => {
    setDraft((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
    setDraftError(null);
  }, []);

  const selectFile = useCallback((file) => {
    clearDraft();
    const result = buildDraftFromFile(file, t);
    if (result.error) {
      setDraftError(result.error);
      return false;
    }

    setDraft(result.draft);
    setDraftError(null);
    return true;
  }, [clearDraft, t]);

  const stopMediaTracks = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const cancelRecording = useCallback(() => {
    recordingChunksRef.current = [];
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    stopMediaTracks();
    setIsRecording(false);
    setRecordingError(null);
  }, [stopMediaTracks]);

  const startRecording = useCallback(async () => {
    setRecordingError(null);
    clearDraft();

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setRecordingError(validationMessages.recordingNotSupported);
      return false;
    }

    const mimeType = getSupportedRecorderMimeType();
    if (!mimeType) {
      setRecordingError(validationMessages.recordingNotSupported);
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      recordingChunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setRecordingError(validationMessages.recordingFailed);
        cancelRecording();
      };

      recorder.start();
      setIsRecording(true);
      return true;
    } catch (error) {
      stopMediaTracks();
      const name = error instanceof Error ? error.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setRecordingError(validationMessages.micPermission);
      } else {
        setRecordingError(validationMessages.micAccessFailed);
      }
      return false;
    }
  }, [cancelRecording, clearDraft, stopMediaTracks, validationMessages]);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return false;
    }

    return new Promise((resolve) => {
      recorder.onstop = async () => {
        stopMediaTracks();
        mediaRecorderRef.current = null;
        setIsRecording(false);

        const chunks = recordingChunksRef.current;
        recordingChunksRef.current = [];

        if (!chunks.length) {
          setRecordingError(validationMessages.noAudioRecorded);
          resolve(false);
          return;
        }

        try {
          const blob = new Blob(chunks, { type: recorder.mimeType });
          const file = await finalizeRecordedAudioBlob(blob, recorder.mimeType);
          const result = buildDraftFromFile(file, t);
          if (result.error) {
            setDraftError(result.error);
            resolve(false);
            return;
          }

          setDraft(result.draft);
          setDraftError(null);
          resolve(true);
        } catch {
          setRecordingError(validationMessages.processRecordingFailed);
          resolve(false);
        }
      };

      recorder.stop();
    });
  }, [stopMediaTracks, t, validationMessages]);

  useEffect(() => () => {
    cancelRecording();
    setDraft((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
  }, [cancelRecording]);

  return {
    draft,
    draftError,
    isRecording,
    recordingError,
    selectFile,
    clearDraft,
    startRecording,
    stopRecording,
    cancelRecording,
    clearDraftError: () => setDraftError(null),
    clearRecordingError: () => setRecordingError(null),
  };
}
