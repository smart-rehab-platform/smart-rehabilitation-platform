import { useEffect, useId, useRef, useState } from "react";
import { Image, Mic, Paperclip, Square, Video } from "lucide-react";
import { PlatformMaterialIcon } from "../../../../components/platform/PlatformMaterialIcon";
import {
  formatAttachmentFileSize,
  getMessageAttachmentKind,
} from "../../utils/parentMessageAttachmentUtils";

export function MessagesComposer({
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
              alt="Selected image preview"
              className="pd-messages-attachment-preview-image"
            />
          ) : null}

          {draftKind === "audio" && draft.previewUrl ? (
            <audio controls src={draft.previewUrl} className="pd-messages-attachment-preview-audio" />
          ) : null}

          <div className="pd-messages-attachment-preview-copy">
            <strong>{draft.file.name}</strong>
            <span>{formatAttachmentFileSize(draft.sizeBytes)}</span>
          </div>

          <button
            type="button"
            className="pd-btn pd-btn-soft pd-messages-attachment-remove"
            disabled={isSending}
            onClick={onClearDraft}
          >
            Remove
          </button>
        </div>
      ) : null}

      <div className="pd-messages-composer-input-row">
        <div className="pd-messages-attach-menu" ref={menuRef}>
          {isRecording ? (
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-messages-attach-trigger is-recording"
              title="Stop recording"
              aria-label="Stop recording"
              onClick={onStopRecording}
            >
              <Square size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-messages-attach-trigger"
              title="Add attachment"
              aria-label="Add attachment"
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
                Image
              </button>
              <button
                type="button"
                className="pd-messages-attach-option"
                role="menuitem"
                onClick={() => runMenuAction(() => videoInputRef.current?.click())}
              >
                <Video size={16} aria-hidden="true" />
                Video
              </button>
              <button
                type="button"
                className="pd-messages-attach-option"
                role="menuitem"
                onClick={() => runMenuAction(() => onStartRecording())}
              >
                <Mic size={16} aria-hidden="true" />
                Record Voice
              </button>
              <button
                type="button"
                className="pd-messages-attach-option"
                role="menuitem"
                onClick={() => runMenuAction(() => fileInputRef.current?.click())}
              >
                <PlatformMaterialIcon icon="report" size={16} />
                File
              </button>
            </div>
          ) : null}
        </div>

        <textarea
          rows={1}
          className="pd-messages-composer-textarea"
          value={composerValue}
          placeholder="Write a message..."
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
          Uploading… {Math.round(uploadProgress * 100)}%
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
        {isSending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
