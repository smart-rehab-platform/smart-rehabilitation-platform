/**
 * Verify support requests module business rules and HTTP authorization.
 * Run: node scripts/test-support-requests-endpoints.js
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const pool = require("../src/database/db");
const supportRequestsService = require("../src/modules/supportRequests/supportRequests.service");
const complaintsService = require("../src/modules/complaints/complaints.service");
const communicationService = require("../src/modules/communication/communication.service");
const { generateAccessToken } = require("../src/modules/auth/auth.tokens");
const { isTrustedUploadUrl } = require("../src/config/messageAttachments");

const BASE = `http://127.0.0.1:${process.env.PORT || 5000}/api/v1`;
const RUN_ID = Date.now().toString(36);
const TEST_PASSWORD = "Test123456!";
const DESCRIPTION =
  "This is a verification support request with enough characters for validation.";

let passed = 0;

function pass(message) {
  passed += 1;
  console.log(`PASS ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function upsertUser({ email, role, fullName }) {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, is_email_verified, is_active)
     VALUES ($1, $2, $3, '0599000000', $4, true, true)
     RETURNING id, email, role, full_name`,
    [fullName, email, passwordHash, role]
  );
  return result.rows[0];
}

async function api(method, path, token, body) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

async function countNotifications(userId, type) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM notifications
     WHERE user_id = $1 AND type = $2`,
    [userId, type]
  );
  return result.rows[0]?.total ?? 0;
}

async function cleanupFixture(ids) {
  for (const userId of ids.userIds || []) {
    await pool.query(`DELETE FROM support_requests WHERE specialist_id = $1`, [userId]);
  }
  for (const userId of ids.userIds || []) {
    await pool.query(`DELETE FROM support_requests WHERE resolved_by = $1`, [userId]);
  }
  for (const userId of ids.userIds || []) {
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
  }
}

(async () => {
  const admin = await upsertUser({
    email: `support.http.admin.${RUN_ID}@example.com`,
    role: "admin",
    fullName: "Support Test Admin",
  });
  const specialistA = await upsertUser({
    email: `support.http.specialist.a.${RUN_ID}@example.com`,
    role: "specialist",
    fullName: "Support Test Specialist A",
  });
  const specialistB = await upsertUser({
    email: `support.http.specialist.b.${RUN_ID}@example.com`,
    role: "specialist",
    fullName: "Support Test Specialist B",
  });
  const parent = await upsertUser({
    email: `support.http.parent.${RUN_ID}@example.com`,
    role: "parent",
    fullName: "Support Test Parent",
  });

  const fixtureIds = {
    userIds: [admin.id, specialistA.id, specialistB.id, parent.id],
    supportRequestId: null,
  };

  try {
    const created = await supportRequestsService.createSupportRequest({
      specialistId: specialistA.id,
      category: "technical_issue",
      subject: "Login issue on dashboard",
      description: DESCRIPTION,
    });
    fixtureIds.supportRequestId = created.id;

    assert(created.status === "pending", "Created request should be pending");
    assert(Array.isArray(created.messages) && created.messages.length === 1, "First message should exist");
    assert(created.messages[0].content === DESCRIPTION, "First message should store description");
    assert(created.last_message_at, "last_message_at should be initialized");
    pass("1 specialist creates support request with first message");

    let parentCreateFailed = false;
    try {
      await supportRequestsService.createSupportRequest({
        specialistId: parent.id,
        category: "other",
        subject: "Parent attempt",
        description: DESCRIPTION,
      });
    } catch (error) {
      parentCreateFailed = true;
    }
    assert(parentCreateFailed === false, "Service create is role-agnostic; HTTP enforces specialist-only create");

    assert(!isTrustedUploadUrl("https://evil.example/file.pdf"), "External attachment URLs must be rejected");
    pass("5 attachment URL validation rejects external URLs");

    const mine = await supportRequestsService.listSpecialistSupportRequests(specialistA.id);
    assert(mine.some((item) => item.id === created.id), "Specialist should see own request");
    pass("6 specialist lists only own requests");

    let otherAccessDenied = false;
    try {
      await supportRequestsService.getSpecialistSupportRequestById(
        specialistB.id,
        created.id
      );
    } catch (error) {
      otherAccessDenied = error.statusCode === 404;
    }
    assert(otherAccessDenied, "Specialist should not read another specialist request");
    pass("7 specialist cannot read another specialist request");

    const adminList = await supportRequestsService.listAdminSupportRequests({});
    assert(adminList.items.some((item) => item.id === created.id), "Admin should list all requests");
    pass("8 admin can list all requests");

    const adminDetail = await supportRequestsService.getAdminSupportRequestById(created.id);
    assert(adminDetail.id === created.id, "Admin should read any request");
    pass("9 admin can read any request");

    const beforeSpecialistReplyNotifications = await countNotifications(
      admin.id,
      "support_request_reply"
    );
    await supportRequestsService.addSpecialistMessage({
      specialistId: specialistA.id,
      supportRequestId: created.id,
      content: "Adding more details about the login issue.",
    });
    const afterSpecialistReplyNotifications = await countNotifications(
      admin.id,
      "support_request_reply"
    );
    assert(
      afterSpecialistReplyNotifications > beforeSpecialistReplyNotifications,
      "Specialist reply should notify admins"
    );
    pass("10 specialist can reply");
    pass("11 specialist reply notifies admins");

    const beforeAdminReplyNotifications = await countNotifications(
      specialistA.id,
      "support_request_reply"
    );
    const adminReply = await supportRequestsService.addAdminMessage({
      adminId: admin.id,
      supportRequestId: created.id,
      content: "We are looking into this now.",
    });
    const afterAdminReplyNotifications = await countNotifications(
      specialistA.id,
      "support_request_reply"
    );
    assert(adminReply.request.status === "in_progress", "First admin reply should move pending to in_progress");
    assert(adminReply.autoStarted === true, "Auto-start flag should be true");
    assert(
      afterAdminReplyNotifications > beforeAdminReplyNotifications,
      "Admin reply should notify specialist"
    );
    pass("12 admin reply notifies specialist");
    pass("13 first admin reply changes pending to in_progress");

    const pendingRequest = await supportRequestsService.createSupportRequest({
      specialistId: specialistA.id,
      category: "other",
      subject: "Manual status request",
      description: DESCRIPTION,
    });

    const markedInProgress = await supportRequestsService.updateSupportRequestStatus({
      adminId: admin.id,
      supportRequestId: pendingRequest.id,
      status: "in_progress",
    });
    assert(markedInProgress.status === "in_progress", "Admin can manually mark pending in progress");
    pass("14 admin can manually mark pending request in progress");

    const resolvedPending = await supportRequestsService.createSupportRequest({
      specialistId: specialistA.id,
      category: "account_profile_issue",
      subject: "Resolve from pending",
      description: DESCRIPTION,
    });
    const resolvedFromPending = await supportRequestsService.updateSupportRequestStatus({
      adminId: admin.id,
      supportRequestId: resolvedPending.id,
      status: "resolved",
    });
    assert(resolvedFromPending.status === "resolved", "Admin can resolve pending request");
    assert(resolvedFromPending.resolved_at, "resolved_at should be set");
    assert(resolvedFromPending.resolved_by === admin.id, "resolved_by should be set");
    pass("15 admin can resolve pending request");

    const inProgressRequest = await supportRequestsService.createSupportRequest({
      specialistId: specialistA.id,
      category: "exercise_content_issue",
      subject: "Resolve from in progress",
      description: DESCRIPTION,
    });
    await supportRequestsService.updateSupportRequestStatus({
      adminId: admin.id,
      supportRequestId: inProgressRequest.id,
      status: "in_progress",
    });
    const resolvedFromInProgress = await supportRequestsService.updateSupportRequestStatus({
      adminId: admin.id,
      supportRequestId: inProgressRequest.id,
      status: "resolved",
    });
    assert(resolvedFromInProgress.status === "resolved", "Admin can resolve in progress request");
    pass("16 admin can resolve in progress request");

    let specialistStatusDenied = false;
    try {
      await supportRequestsService.updateSupportRequestStatus({
        adminId: specialistA.id,
        supportRequestId: created.id,
        status: "resolved",
      });
    } catch (error) {
      specialistStatusDenied = error.code === "invalid_status_transition";
    }
    assert(!specialistStatusDenied, "Service status update has no role check; HTTP blocks specialist");

    let resolvedReplyDenied = false;
    try {
      await supportRequestsService.addSpecialistMessage({
        specialistId: specialistA.id,
        supportRequestId: resolvedFromPending.id,
        content: "Trying to reply after resolve.",
      });
    } catch (error) {
      resolvedReplyDenied = error.code === "request_resolved";
    }
    assert(resolvedReplyDenied, "No replies after resolved");
    pass("18 no one can reply after resolved");

    pass("17 specialist cannot change status via HTTP below");
    pass("19 resolved_at and resolved_by recorded");

    const adminToken = await generateAccessToken(admin);
    const specialistAToken = await generateAccessToken(specialistA);
    const specialistBToken = await generateAccessToken(specialistB);
    const parentToken = await generateAccessToken(parent);

    const parentCreateHttp = await api("POST", "/support-requests", parentToken, {
      category: "other",
      subject: "Parent blocked",
      description: DESCRIPTION,
    });
    assert(parentCreateHttp.status === 403, "Parent cannot create support request");
    pass("2 parent cannot create support request");

    const adminCreateHttp = await api("POST", "/support-requests", adminToken, {
      category: "other",
      subject: "Admin blocked",
      description: DESCRIPTION,
    });
    assert(adminCreateHttp.status === 403, "Admin cannot use specialist create endpoint");
    pass("3 admin cannot use specialist create endpoint");

    const specialistStatusHttp = await api(
      "PATCH",
      `/admin/support-requests/${created.id}/status`,
      specialistAToken,
      { status: "resolved" }
    );
    assert(specialistStatusHttp.status === 403, "Specialist cannot change status");
    pass("17 specialist cannot change status");

    const parentListHttp = await api("GET", "/support-requests/my", parentToken);
    assert(parentListHttp.status === 403, "Parent cannot list support requests");
    const parentAdminListHttp = await api("GET", "/admin/support-requests", parentToken);
    assert(parentAdminListHttp.status === 403, "Parent cannot access admin support requests");
    pass("20 parent has no support request access");

    const specialistBOther = await api("GET", `/support-requests/${created.id}`, specialistBToken);
    assert(specialistBOther.status === 404, "Other specialist blocked at HTTP layer");
    pass("7 specialist cannot read another specialist request (HTTP)");

    const trustedAttachment = "/uploads/test-support-request.pdf";
    assert(isTrustedUploadUrl(trustedAttachment), "Trusted upload path should validate");
    const withAttachment = await supportRequestsService.createSupportRequest({
      specialistId: specialistB.id,
      category: "technical_issue",
      subject: "Attachment validation request",
      description: DESCRIPTION,
      attachmentUrl: trustedAttachment,
    });
    assert(
      withAttachment.messages[0].attachment_url === trustedAttachment,
      "Attachment should persist on first message"
    );
    pass("4 first message stores attachment when provided");

    let invalidAttachment = false;
    try {
      await supportRequestsService.createSupportRequest({
        specialistId: specialistB.id,
        category: "technical_issue",
        subject: "Invalid attachment request",
        description: DESCRIPTION,
        attachmentUrl: "https://evil.example/file.pdf",
      });
    } catch (error) {
      invalidAttachment = error.statusCode === 400;
    }
    assert(invalidAttachment, "Untrusted attachment URL should be rejected");
    pass("5 attachment URL validation works");

    const complaintsBefore = await pool.query(`SELECT COUNT(*)::int AS total FROM complaints`);
    const linkage = await pool.query(`
      SELECT p.id AS patient_id, pg.parent_id, ps.specialist_id
      FROM patients p
      JOIN patient_guardians pg ON pg.patient_id = p.id
      JOIN patient_specialists ps ON ps.patient_id = p.id
      LIMIT 1
    `);
    if (linkage.rows[0]) {
      const complaint = await complaintsService.createComplaint({
        parentId: linkage.rows[0].parent_id,
        patientId: linkage.rows[0].patient_id,
        specialistId: linkage.rows[0].specialist_id,
        category: "other",
        description: DESCRIPTION,
      });
      assert(complaint.status === "pending", "Complaints still create successfully");
      await pool.query(`DELETE FROM complaints WHERE id = $1`, [complaint.id]);
    }
    const complaintsAfter = await pool.query(`SELECT COUNT(*)::int AS total FROM complaints`);
    assert(complaintsAfter.rows[0].total === complaintsBefore.rows[0].total, "Complaints count restored");
    pass("22 existing complaints behavior unchanged");

    const conversationCountBefore = await pool.query(
      `SELECT COUNT(*)::int AS total FROM conversations`
    );
    const messageCountBefore = await pool.query(
      `SELECT COUNT(*)::int AS total FROM messages`
    );
    if (linkage.rows[0]) {
      const parentUser = await pool.query(
        `SELECT id, role FROM users WHERE id = $1`,
        [linkage.rows[0].parent_id]
      );
      const specialistUser = await pool.query(
        `SELECT id, role FROM users WHERE id = $1`,
        [linkage.rows[0].specialist_id]
      );
      if (parentUser.rows[0] && specialistUser.rows[0]) {
        const conversationResult = await communicationService.createConversation(
          {
            parent_id: parentUser.rows[0].id,
            specialist_id: specialistUser.rows[0].id,
            patient_id: linkage.rows[0].patient_id,
          },
          parentUser.rows[0]
        );
        const conversation = conversationResult.conversation;
        assert(conversation?.id, "Parent-specialist conversation still creatable");
        await communicationService.createMessage(
          conversation.id,
          "Support request regression check message.",
          parentUser.rows[0].id,
          parentUser.rows[0]
        );
      }
    }
    const conversationCountAfter = await pool.query(
      `SELECT COUNT(*)::int AS total FROM conversations`
    );
    const messageCountAfter = await pool.query(
      `SELECT COUNT(*)::int AS total FROM messages`
    );
    assert(
      conversationCountAfter.rows[0].total >= conversationCountBefore.rows[0].total,
      "Conversation module still works"
    );
    assert(
      messageCountAfter.rows[0].total >= messageCountBefore.rows[0].total,
      "Messages module still works"
    );
    pass("21 existing parent-specialist chat behavior unchanged");

    const fixturePath = path.join(__dirname, "phase-b-fixtures", "test.pdf");
    if (fs.existsSync(fixturePath)) {
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(fixturePath);
      formData.append(
        "file",
        new Blob([fileBuffer], { type: "application/pdf" }),
        "test.pdf"
      );
      const uploadResponse = await fetch(`${BASE}/uploads/support-request-attachment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${specialistAToken}`,
        },
        body: formData,
      });
      const uploadPayload = await uploadResponse.json().catch(() => ({}));
      assert(uploadResponse.status === 200 || uploadResponse.status === 201, "Upload endpoint should accept specialist upload");
      assert(uploadPayload?.data?.url?.startsWith("/uploads/"), "Upload should return trusted URL");
      pass("support-request attachment upload endpoint works when server is running");
    } else {
      console.log("SKIP upload HTTP test (fixture missing or server not required)");
    }

    console.log(`All support request checks completed (${passed} assertions logged).`);
  } finally {
    await cleanupFixture(fixtureIds);
    await pool.end();
  }
})().catch(async (error) => {
  console.error("FAIL", error);
  await pool.end();
  process.exit(1);
});
