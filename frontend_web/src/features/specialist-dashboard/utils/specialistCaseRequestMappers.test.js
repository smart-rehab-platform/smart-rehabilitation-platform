import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCaseRequestTimelineSteps,
  getCaseRequestStatusChipLabel,
  mapSpecialistCaseRequestDetail,
  mapSpecialistCaseRequestListItem,
} from "./specialistCaseRequestMappers.js";

describe("specialistCaseRequestMappers", () => {
  it("maps list item fields and conversation availability", () => {
    const item = mapSpecialistCaseRequestListItem({
      id: "req-1",
      child_name: "bana",
      status: "converted_to_patient",
      assigned_at: "2026-07-26T14:22:00.000Z",
      attachment_count: 0,
      conversation_id: "conv-1",
      category: { id: "cat-1", name: "Behavioral Therapy" },
      parent: { id: "p-1", full_name: "Alaa" },
    });

    assert.equal(item.childName, "bana");
    assert.equal(item.statusLabel, "Profile Created");
    assert.equal(item.conversationAvailable, true);
    assert.equal(item.attachmentCountLabel, "0 attachments");
  });

  it("builds converted timeline steps", () => {
    const detail = mapSpecialistCaseRequestDetail({
      id: "req-2",
      child_name: "bana",
      status: "converted_to_patient",
      assigned_at: "2026-07-26T14:22:00.000Z",
      accepted_at: "2026-07-27T10:00:00.000Z",
      converted_at: "2026-07-27T10:01:00.000Z",
      gender: "male",
      date_of_birth: "2012-09-13",
      parent: { id: "p-1", full_name: "Alaa", email: "a@b.com", phone: "123" },
      category: { id: "c1", name: "Behavioral Therapy" },
      attachments: [],
    });

    assert.equal(getCaseRequestStatusChipLabel("converted_to_patient"), "Profile Created");
    const steps = buildCaseRequestTimelineSteps(detail);
    assert.equal(steps.length, 4);
    assert.equal(steps.every((step) => step.state === "completed"), true);
    assert.equal(steps[3].title, "Converted");
  });
});
