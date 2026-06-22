import { describe, expect, it } from "vitest";

import { interviewDecks } from "@/data/cards";
import { readingModules } from "@/data/content";
import { buildAssessmentExport } from "@/lib/assessment-export";
import { createReviewRecord, type ProgressMap } from "@/lib/srs";

describe("assessment export", () => {
  const now = new Date("2026-06-22T12:00:00.000Z");
  const deck = interviewDecks.find((candidate) => candidate.id === "booking-platform")!;

  it("builds an LLM-ingestible readiness report from local progress", () => {
    const hardCard = deck.cards.find((card) => card.topic === "Postgres")!;
    const goodCard = deck.cards.find((card) => card.topic === "Django")!;
    const againCard = deck.cards.find((card) => card.topic === "System Design")!;
    const progress: ProgressMap = {
      [hardCard.id]: createReviewRecord(hardCard.id, "Hard", now),
      [goodCard.id]: createReviewRecord(goodCard.id, "Good", now),
      [againCard.id]: createReviewRecord(againCard.id, "Again", now)
    };

    const report = buildAssessmentExport({
      deck,
      now,
      progress,
      readingModules
    });

    expect(report).toContain("# Mid-level full-stack SWE readiness export");
    expect(report).toContain("Target level: Mid-level full-stack SWE");
    expect(report).toContain("Deck: Booking platform full-stack");
    expect(report).toContain("Reviewed cards: 3 / 50");
    expect(report).toContain("Due cards:");
    expect(report).toContain("Postgres");
    expect(report).toContain("System Design");
    expect(report).toContain("Trade-off readiness");
    expect(report).toContain("Rate me as one of: Junior, Junior-plus, Early mid-level, Solid mid-level");
    expect(report).toContain("Best next study reps");
    expect(report).toContain("Weakest gap signals");
  });

  it("does not include unrelated localStorage payloads or private data", () => {
    const report = buildAssessmentExport({
      deck,
      now,
      progress: {
        "unknown-card": {
          cardId: "unknown-card",
          lastRating: "Easy",
          lastReviewedAt: now.toISOString(),
          nextDue: now.toISOString(),
          reviewedCount: 99
        }
      },
      readingModules
    });

    expect(report).not.toContain("unknown-card");
    expect(report).not.toContain("localStorage");
    expect(report).not.toContain("API key");
  });
});
