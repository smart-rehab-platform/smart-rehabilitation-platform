#!/usr/bin/env node
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const API = process.env.API_BASE || "http://localhost:5000/api/v1";
const email = "fatima.parent@test.com";
const password = "Test123456!";

/** 1×1 PNG for upload tests. */
const MINI_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

function basePayload(categoryId, overrides = {}) {
  return {
    child_name: `Web Test Child ${Date.now()}`,
    date_of_birth: "2019-06-01",
    gender: "female",
    category_id: categoryId,
    case_description: "Temporary validation case request with photo.",
    has_previous_diagnosis: false,
    is_currently_receiving_treatment: false,
    preferred_contact_period: "morning",
    ...overrides,
  };
}

async function main() {
  const login = await requestJson(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const token = login.body?.data?.accessToken;
  if (!token) {
    throw new Error(`Login failed: ${JSON.stringify(login.body)}`);
  }

  const auth = { Authorization: `Bearer ${token}` };
  const categories = await requestJson(`${API}/case-categories`, { headers: auth });
  const categoryId = categories.body?.data?.[0]?.id;

  if (!categoryId) {
    throw new Error("No active case category found.");
  }

  const badGender = await requestJson(`${API}/case-intake-requests`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify(basePayload(categoryId, {
      child_name: "Gender Test",
      gender: "other",
      case_description: "Should fail gender validation",
    })),
  });

  console.log("Reject other gender:", badGender.status, badGender.body?.message);

  const badEmptyGender = await requestJson(`${API}/case-intake-requests`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify(basePayload(categoryId, {
      child_name: "Gender Empty Test",
      gender: "",
      case_description: "Should fail empty gender",
    })),
  });

  console.log("Reject empty gender:", badEmptyGender.status, badEmptyGender.body?.message);

  const form = new FormData();
  form.append(
    "child_image",
    new Blob([MINI_PNG], { type: "image/png" }),
    "child.png",
  );

  const upload = await requestJson(`${API}/uploads/case-request-child-image`, {
    method: "POST",
    headers: auth,
    body: form,
  });

  console.log("Upload child image:", upload.status, upload.body?.data?.url || upload.body?.message);

  const badUpload = new FormData();
  badUpload.append(
    "child_image",
    new Blob(["not an image"], { type: "application/pdf" }),
    "bad.pdf",
  );

  const rejectPdf = await requestJson(`${API}/uploads/case-request-child-image`, {
    method: "POST",
    headers: auth,
    body: badUpload,
  });

  console.log("Reject PDF upload:", rejectPdf.status, rejectPdf.body?.message);

  if (!upload.body?.data?.url) {
    throw new Error("Upload did not return a URL.");
  }

  const childName = `Web Test Child ${Date.now()}`;
  const create = await requestJson(`${API}/case-intake-requests`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify(basePayload(categoryId, {
      child_name: childName,
      child_image_url: upload.body.data.url,
    })),
  });

  console.log(
    "Create with image:",
    create.status,
    create.body?.data?.id,
    create.body?.data?.child_image_url,
  );

  const requestId = create.body?.data?.id;
  if (requestId) {
    const detail = await requestJson(`${API}/case-intake-requests/${requestId}`, {
      headers: auth,
    });
    console.log("Detail child_image_url:", detail.body?.data?.child_image_url);

    const list = await requestJson(`${API}/case-intake-requests/mine`, { headers: auth });
    const listed = (list.body?.data || []).find((row) => row.id === requestId);
    console.log("List child_image_url:", listed?.child_image_url);

    const updateNoImage = await requestJson(`${API}/case-intake-requests/${requestId}`, {
      method: "PATCH",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ case_description: "Updated without new image." }),
    });
    console.log(
      "Update without image preserves URL:",
      updateNoImage.status,
      updateNoImage.body?.data?.child_image_url,
    );

    const replaceForm = new FormData();
    replaceForm.append(
      "child_image",
      new Blob([MINI_PNG], { type: "image/png" }),
      "replacement.png",
    );
    const replaceUpload = await requestJson(`${API}/uploads/case-request-child-image`, {
      method: "POST",
      headers: auth,
      body: replaceForm,
    });

    if (replaceUpload.body?.data?.url) {
      const updateWithImage = await requestJson(`${API}/case-intake-requests/${requestId}`, {
        method: "PATCH",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ child_image_url: replaceUpload.body.data.url }),
      });
      console.log(
        "Replace image:",
        updateWithImage.status,
        updateWithImage.body?.data?.child_image_url,
      );
    }

    console.log("TEMP_REQUEST_ID", requestId);
    console.log("TEMP_CHILD_NAME", childName);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
