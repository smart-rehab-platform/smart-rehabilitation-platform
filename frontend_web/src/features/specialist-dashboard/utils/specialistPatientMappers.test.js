import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getVisibleFamilyPatternChildren,
  getVisibleFamilyPatternDetailGroups,
  mapFamilyPatternDetails,
} from "./specialistPatientMappers.js";

describe("specialistPatientMappers family pattern details", () => {
  it("preserves authorized children and detail metadata from backend payload", () => {
    const mapped = mapFamilyPatternDetails({
      patientId: "11111111-1111-4111-8111-111111111111",
      patternScore: 60,
      evidenceLevel: "HIGH",
      matchedChildren: 2,
      visibleMatchedChildren: 1,
      hiddenMatchedChildrenCount: 1,
      summaryReason: "Multiple children linked to the same parent account share a confirmed diagnosis.",
      disclaimer: "This feature identifies repeated characteristics among children linked to the same parent account.",
      groups: [
        {
          type: "shared_diagnosis",
          label: "Shared Diagnosis",
          reason: "Multiple linked children share the same or an equivalent confirmed diagnosis.",
          condition: "Speech and Language Delay",
          children: [
            {
              patientId: "22222222-2222-4222-8222-222222222222",
              patientName: "Ahmad Hassan",
              matchedValue: "Speech and Language Therapy",
              matchedKeywords: [],
            },
          ],
        },
        {
          type: "shared_diagnosis",
          label: "Shared Diagnosis",
          reason: "Multiple linked children share the same or an equivalent confirmed diagnosis.",
          condition: "Speech and Language Delay",
          children: [],
        },
      ],
    });

    assert.equal(mapped.visibleMatchedChildren, 1);
    assert.equal(mapped.hiddenMatchedChildrenCount, 1);
    assert.deepEqual(getVisibleFamilyPatternDetailGroups(mapped).map((group) => group.type), [
      "shared_diagnosis",
    ]);
    assert.deepEqual(getVisibleFamilyPatternChildren(mapped).map((child) => child.patientName), [
      "Ahmad Hassan",
    ]);
    assert.equal(getVisibleFamilyPatternChildren(mapped)[0].matchedValue, "Speech and Language Therapy");
  });
});
