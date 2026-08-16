import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getCarouselSwipeAction,
  getCarouselTrackOffset,
  getCarouselTrackOffsetsForRange,
  getCarouselVisualControls,
  isCarouselControlDisabled,
} from "./landingLocalization.js";

describe("PlatformModulesSection carousel geometry", () => {
  const cardWidth = 520;
  const cardCount = 7;
  const gap = 24;
  const stride = cardWidth + gap;

  it("uses identical LTR track offsets for every active index", () => {
    const offsets = getCarouselTrackOffsetsForRange({ cardWidth, cardCount, gap });

    assert.equal(offsets.length, cardCount);
    assert.equal(offsets[0], cardWidth / 2);
    assert.equal(offsets[cardCount - 1], (cardCount - 1) * stride + cardWidth / 2);

    for (let index = 1; index < offsets.length; index += 1) {
      assert.equal(offsets[index] - offsets[index - 1], stride);
    }
  });

  it("centers each index with the same formula regardless of locale", () => {
    for (let activeIndex = 0; activeIndex < cardCount; activeIndex += 1) {
      const offset = getCarouselTrackOffset({ activeIndex, cardWidth, gap });
      assert.equal(offset, activeIndex * stride + cardWidth / 2);
    }
  });
});

describe("PlatformModulesSection carousel navigation", () => {
  const lastIndex = 6;
  const threshold = 48;

  it("maps physical left/right controls to prev/next in LTR", () => {
    const controls = getCarouselVisualControls(false);

    assert.equal(controls.left.delta, -1);
    assert.equal(controls.right.delta, 1);
    assert.equal(isCarouselControlDisabled(0, lastIndex, "left", false), true);
    assert.equal(isCarouselControlDisabled(lastIndex, lastIndex, "right", false), true);
  });

  it("maps RTL left/right controls to match visual movement direction", () => {
    const controls = getCarouselVisualControls(true);

    assert.equal(controls.left.delta, -1);
    assert.equal(controls.right.delta, 1);
    assert.equal(isCarouselControlDisabled(0, lastIndex, "left", true), true);
    assert.equal(isCarouselControlDisabled(lastIndex, lastIndex, "right", true), true);
    assert.equal(isCarouselControlDisabled(3, lastIndex, "left", true), false);
    assert.equal(isCarouselControlDisabled(3, lastIndex, "right", true), false);
  });

  it("supports a full round trip through all modules in RTL", () => {
    let index = 0;
    const controls = getCarouselVisualControls(true);

    while (index < lastIndex) {
      index += controls.right.delta;
      assert.ok(index >= 0 && index <= lastIndex);
    }

    assert.equal(index, lastIndex);

    while (index > 0) {
      index += controls.left.delta;
      assert.ok(index >= 0 && index <= lastIndex);
    }

    assert.equal(index, 0);
  });

  it("uses one stable swipe mapping for all locales", () => {
    assert.equal(getCarouselSwipeAction(60, threshold), "prev");
    assert.equal(getCarouselSwipeAction(-60, threshold), "next");
    assert.equal(getCarouselSwipeAction(10, threshold), null);
  });
});
