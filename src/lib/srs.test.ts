import { describe, expect, it } from "vitest";

import {
  createReviewRecord,
  getDueCards,
  getNextDueDate,
  mergeProgress,
  parseStoredProgress,
  type Rating
} from "@/lib/srs";
import { flashcards } from "@/data/cards";

describe("spaced repetition scheduling", () => {
  const now = new Date("2026-06-22T10:00:00.000Z");

  it.each<Rating>(["Again", "Hard", "Good", "Easy"])(
    "computes the next due date for %s",
    (rating) => {
      const due = getNextDueDate(rating, now);
      const expectedTimes: Record<Rating, string> = {
        Again: "2026-06-22T10:00:00.000Z",
        Hard: "2026-06-22T10:10:00.000Z",
        Good: "2026-06-23T10:00:00.000Z",
        Easy: "2026-06-24T10:00:00.000Z"
      };

      expect(due.toISOString()).toBe(expectedTimes[rating]);
    }
  );

  it("creates a review record without mutating the previous record", () => {
    const previous = {
      cardId: "django-orm-select-related",
      nextDue: "2026-06-22T10:00:00.000Z",
      lastRating: "Hard" as const,
      reviewedCount: 2,
      lastReviewedAt: "2026-06-21T10:00:00.000Z"
    };

    const next = createReviewRecord(previous.cardId, "Good", now, previous);

    expect(previous.reviewedCount).toBe(2);
    expect(next).toEqual({
      cardId: previous.cardId,
      nextDue: "2026-06-23T10:00:00.000Z",
      lastRating: "Good",
      reviewedCount: 3,
      lastReviewedAt: "2026-06-22T10:00:00.000Z"
    });
  });

  it("keeps due cards ordered by topic deck order and filters future cards", () => {
    const progress = mergeProgress(flashcards, {
      [flashcards[0].id]: {
        cardId: flashcards[0].id,
        nextDue: "2026-06-24T10:00:00.000Z",
        lastRating: "Easy",
        reviewedCount: 1,
        lastReviewedAt: "2026-06-22T10:00:00.000Z"
      }
    });

    const due = getDueCards(flashcards.slice(0, 3), progress, now);

    expect(due.map((card) => card.id)).toEqual([
      flashcards[1].id,
      flashcards[2].id
    ]);
  });

  it("returns empty progress for invalid localStorage payloads", () => {
    expect(parseStoredProgress("not json")).toEqual({});
    expect(parseStoredProgress("{\"x\":{\"nextDue\":42}}")).toEqual({});
    expect(parseStoredProgress(null)).toEqual({});
  });
});
