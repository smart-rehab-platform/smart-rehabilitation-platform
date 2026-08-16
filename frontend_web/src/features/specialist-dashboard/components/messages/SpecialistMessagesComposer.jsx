import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Image, Mic, Paperclip, Square, Video } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";
import { PlatformMaterialIcon } from "../../../../components/platform/PlatformMaterialIcon";
import {
  formatAttachmentFileSize,
  getMessageAttachmentKind,
} from "../../utils/specialistMessageAttachmentUtils";
import { getSpecialistMessageComposerLabels } from "../../utils/specialistMessagesLocalization.js";

export function SpecialistMessagesComposer({
  composerValue,
  onComposerChange,
  onSend,
  isSending,
  sendError,
  uploadProgress,
  draft,
  draftError,
  isRecording,
  recordingError,
  onSelectImage,
  onSelectVideo,
  onSelectFile,
  onClearDraft,
  onStartRecording,
  onStopRecording,
  disabled = false,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getSpecialistMessageComposerLabels(t), [t]);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const canSend = Boolean(composerValue.trim() || draft?.file) && !isSending && !isRecording;
  const draftKind = draft ? getMessageAttachmentKind(draft.mimeType) : null;
  const attachDisabled = disabled || isSending;

  const closeMenu = () => setMenuOpen(false);

  const handleFileChange = (event, handler) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (file) {
      handler?.(file);
    }
  };

  const runMenuAction = (action) => {
    closeMenu();
    action();
  };

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        closeMenu();
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="pd-messages-composer">
      {draft ? (
        <div className="pd-messages-attachment-preview">
          {draftKind === "image" && draft.previewUrl ? (
            <img
              src={draft.previewUrl}
              alt={labels.selectedImageAlt}
              className="pd-messages-attachment-preview-image"
            />
          ) : null}

          {draftKind === "audio" && draft.previewUrl ? (
            <audio controls src={draft.previewUrl} className="pd-messages-attachment-preview-audio" />
          ) : null}

          <div className="pd-messages-attachment-preview-copy">
            <strong dir="auto">{draft.file.name}</strong>
            <span>{formatAttachmentFileSize(draft.sizeBytes)}</span>
          </div>

          <button
            type="button"
            className="pd-btn pd-btn-soft pd-messages-attachment-remove"
            disabled={isSending}
            onClick={onClearDraft}
          >
            {labels.removeAttachment}
          </button>
        </div>
      ) : null}

      <div className="pd-messages-composer-input-row">
        <div className="pd-messages-attach-menu" ref={menuRef}>
          {isRecording ? (
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-messages-attach-trigger is-recording"
              title={labels.stopRecording}
              aria-label={labels.stopRecording}
              onClick={onStopRecording}
            >
              <Square size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-messages-attach-trigger"
              title={labels.addAttachment}
              aria-label={labels.addAttachment}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              disabled={attachDisabled}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Paperclip size={18} aria-hidden="true" />
            </button>
          )}

          {menuOpen && !isRecording ? (
            <div id={menuId} className="pd-messages-attach-popover" role="menu">
              <button
                type="button"
                className="pd-messages-attach-option"
                role="menuitem"
                onClick={() => runMenuAction(() => imageInputRef.current?.click())}
              >
                <Image size={16} aria-hidden="true" />
                {labels.chooseImage}
              </button>
              <button
                type="button"
                className="pd-messages-attach-option"
                role="menuitem"
                onClick={() => runMenuAction(() => onStartRecording())}
              >
                <Mic size={16} aria-hidden="true" />
                {labels.recordAudio}
              </button>
              <button
                type="button"
                className="pd-messages-attach-option"
                role="menuitem"
                onClick={() => runMenuAction(() => fileInputRef.current?.click())}
              >
                <PlatformMaterialIcon icon="report" size={16} />
                {labels.chooseFile}
              </button>
              <button
                type="button"
                className="pd-messages-attach-option"
                role="menuitem"
                onClick={() => runMenuAction(() => videoInputRef.current?.click())}
              >
                <Video size={16} aria-hidden="true" />
                {labels.chooseVideo}
              </button>
            </div>
          ) : null}
        </div>

        <textarea
          rows={1}
          className="pd-messages-composer-textarea"
          value={composerValue}
          placeholder={labels.placeholder}
          disabled={disabled || isSending}
          onChange={(event) => onComposerChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (canSend) {
                onSend();
              }
            }
          }}
        />
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="pd-visually-hidden"
        onChange={(event) => handleFileChange(event, onSelectImage)}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime,.mp4,.mov"
        className="pd-visually-hidden"
        onChange={(event) => handleFileChange(event, onSelectVideo)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.mp3,.m4a,.wav,.aac,.pdf,.mp4,.mov,image/*,audio/*,video/*,application/pdf"
        className="pd-visually-hidden"
        onChange={(event) => handleFileChange(event, onSelectFile)}
      />

      {typeof uploadProgress === "number" ? (
        <p className="pd-messages-upload-progress" role="status">
          {labels.uploading(Math.round(uploadProgress * 100))}
        </p>
      ) : null}

      {draftError ? <p className="pd-inline-error" role="alert">{draftError}</p> : null}
      {recordingError ? <p className="pd-inline-error" role="alert">{recordingError}</p> : null}
      {sendError ? <p className="pd-inline-error" role="alert">{sendError}</p> : null}

      <button
        type="button"
        className="pd-btn pd-btn-primary"
        disabled={!canSend}
        onClick={onSend}
      >
        {isSending ? labels.sending : labels.send}
      </button>
    </div>
  );
}
