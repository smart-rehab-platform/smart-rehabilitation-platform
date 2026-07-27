const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/mpeg",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "application/pdf",
  "video/mp4",
  "video/quicktime",
]);

const MAX_BYTES_BY_KIND = {
  image: 10 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  pdf: 15 * 1024 * 1024,
  file: 50 * 1024 * 1024,
};

const EXTENSION_MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".aac": "audio/aac",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

export function inferMessageAttachmentMimeType(file) {
  if (!(file instanceof File)) {
    return null;
  }

  const normalized = String(file.type || "").toLowerCase().trim();
  if (normalized && ALLOWED_MIME_TYPES.has(normalized)) {
    return normalized;
  }

  const name = file.name.toLowerCase();
  const extension = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  return EXTENSION_MIME[extension] || null;
}

export function getMessageAttachmentKind(mimeType) {
  const normalized = String(mimeType || "").toLowerCase();
  if (normalized.startsWith("image/")) return "image";
  if (normalized.startsWith("audio/")) return "audio";
  if (normalized.startsWith("video/")) return "video";
  if (normalized === "application/pdf") return "pdf";
  return "file";
}

export function formatAttachmentFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateMessageAttachmentFile(file) {
  if (!(file instanceof File)) {
    return "Please select a file.";
  }

  const mimeType = inferMessageAttachmentMimeType(file);
  if (!mimeType) {
    return "This file type is not supported.";
  }

  const kind = getMessageAttachmentKind(mimeType);
  const maxBytes = MAX_BYTES_BY_KIND[kind] || MAX_BYTES_BY_KIND.file;
  if (file.size > maxBytes) {
    return `File is too large. Maximum allowed size is ${formatAttachmentFileSize(maxBytes)}.`;
  }

  return null;
}

export function getAttachmentDisplayName(fileUrl, fileType) {
  if (typeof fileUrl === "string" && fileUrl.includes("/")) {
    const segment = fileUrl.split("/").pop();
    if (segment) {
      return decodeURIComponent(segment);
    }
  }

  const kind = getMessageAttachmentKind(fileType);
  if (kind === "image") return "Image";
  if (kind === "audio") return "Audio recording";
  if (kind === "video") return "Video";
  if (kind === "pdf") return "PDF document";
  return "Attachment";
}

function writeString(view, offset, value) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

export function encodeAudioBufferToWav(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataLength = audioBuffer.length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  const channels = [];
  for (let channel = 0; channel < numChannels; channel += 1) {
    channels.push(audioBuffer.getChannelData(channel));
  }

  let offset = 44;
  for (let index = 0; index < audioBuffer.length; index += 1) {
    for (let channel = 0; channel < numChannels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][index]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return buffer;
}

export async function convertBlobToWavFile(blob, filename = "recording.wav") {
  const audioContext = new AudioContext();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const wavBuffer = encodeAudioBufferToWav(audioBuffer);
    return new File([wavBuffer], filename, { type: "audio/wav" });
  } finally {
    await audioContext.close();
  }
}

export function getSupportedRecorderMimeType() {
  const candidates = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"];
  return candidates.find((type) => {
    try {
      return typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type);
    } catch {
      return false;
    }
  }) || "";
}

export async function finalizeRecordedAudioBlob(blob, mimeType) {
  const normalized = String(mimeType || "").toLowerCase();
  if (normalized.includes("mp4")) {
    return new File([blob], `recording-${Date.now()}.m4a`, { type: "audio/mp4" });
  }

  if (normalized.includes("webm")) {
    return convertBlobToWavFile(blob, `recording-${Date.now()}.wav`);
  }

  return new File([blob], `recording-${Date.now()}.wav`, { type: "audio/wav" });
}
