import api from "./api";

function extractData(response) {
  const payload = response?.data;
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload ?? null;
}

function extractList(response) {
  const data = extractData(response);
  return Array.isArray(data) ? data : [];
}

function extractMap(response) {
  const data = extractData(response);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data;
  }
  return null;
}

function requireId(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
}

function throwServiceError(error, fallbackMessage) {
  const apiMessage = error?.response?.data?.message;
  const status = error?.response?.status;
  const code = error?.response?.data?.code;

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    const wrapped = new Error(apiMessage.trim());
    wrapped.status = status;
    wrapped.code = code;
    throw wrapped;
  }

  if (error instanceof Error && error.message) {
    throw error;
  }

  throw new Error(fallbackMessage);
}

/**
 * POST /complaints
 * @param {{ patient_id: string, specialist_id: string, category: string, description: string, attachment_url?: string|null }} body
 */
export async function createComplaint(body) {
  try {
    const response = await api.post("/complaints", body);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to submit complaint.");
  }
}

/** GET /complaints/my */
export async function getMyComplaints() {
  try {
    const response = await api.get("/complaints/my");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load complaints.");
  }
}

/** GET /complaints/:id */
export async function getComplaintById(complaintId) {
  const id = requireId(complaintId, "Complaint id");
  try {
    const response = await api.get(`/complaints/${encodeURIComponent(id)}`);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load complaint details.");
  }
}

/**
 * POST /uploads/complaint-attachment
 * @param {File} file
 * @param {(progress: number) => void} [onProgress]
 */
export async function uploadComplaintAttachment(file, onProgress) {
  if (!(file instanceof File)) {
    throw new Error("A file is required for upload.");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/uploads/complaint-attachment", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) {
          return;
        }
        onProgress(event.loaded / event.total);
      },
    });
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to upload attachment.");
  }
}

export default {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  uploadComplaintAttachment,
};
