import { useCallback, useEffect, useRef, useState } from "react";
import {
  finalizeRecordedAudioBlob,
  getSupportedRecorderMimeType,
  inferMessageAttachmentMimeType,
  validateMessageAttachmentFile,
} from "../utils/specialistMessageAttachmentUtils";

function buildDraftFromFile(file) {
  const mimeType = inferMessageAttachmentMimeType(file);
  const validationError = validateMessageAttachmentFile(file);
  if (validationError) {
    return { error: validationError };
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
    const result = buildDraftFromFile(file);
    if (result.error) {
      setDraftError(result.error);
      return false;
    }

    setDraft(result.draft);
    setDraftError(null);
    return true;
  }, [clearDraft]);

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
      setRecordingError("Audio recording is not supported in this browser.");
      return false;
    }

    const mimeType = getSupportedRecorderMimeType();
    if (!mimeType) {
      setRecordingError("Audio recording is not supported in this browser.");
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
        setRecordingError("Recording failed. Please try again.");
        cancelRecording();
      };

      recorder.start();
      setIsRecording(true);
      return true;
    } catch (error) {
      stopMediaTracks();
      const name = error instanceof Error ? error.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setRecordingError("Microphone permission is required to record audio.");
      } else {
        setRecordingError("Unable to access the microphone.");
      }
      return false;
    }
  }, [cancelRecording, clearDraft, stopMediaTracks]);

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
          setRecordingError("No audio was recorded.");
          resolve(false);
          return;
        }

        try {
          const blob = new Blob(chunks, { type: recorder.mimeType });
          const file = await finalizeRecordedAudioBlob(blob, recorder.mimeType);
          const result = buildDraftFromFile(file);
          if (result.error) {
            setDraftError(result.error);
            resolve(false);
            return;
          }

          setDraft(result.draft);
          setDraftError(null);
          resolve(true);
        } catch {
          setRecordingError("Unable to process the recording.");
          resolve(false);
        }
      };

      recorder.stop();
    });
  }, [stopMediaTracks]);

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
