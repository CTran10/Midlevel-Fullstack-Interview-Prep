import { describe, expect, it } from "vitest";

import {
  allLearningTypes,
  filterCardsByLearningType,
  getLearningPlan,
  getLearningType,
  learningTypes,
  type LearningType
} from "@/lib/learning";
import { allFlashcards, interviewDecks } from "@/data/cards";

describe("learning card classification", () => {
  it.each([
    ["django-querysets-lazy", "Fact"],
    ["django-orm-select-related", "Contrast"],
    ["system-design-idempotency", "Scenario"],
    ["behavioral-incident", "Story"]
  ] as [string, LearningType][])("classifies %s as %s practice", (cardId, expectedType) => {
    const card = allFlashcards.find((candidate) => candidate.id === cardId);

    expect(card).toBeDefined();
    expect(getLearningType(card!)).toBe(expectedType);
  });

  it("gives every learning type a concrete recall plan", () => {
    for (const type of learningTypes) {
      const plan = getLearningPlan(type);

      expect(plan.label).toContain(type);
      expect(plan.recallTarget.length).toBeGreaterThan(30);
      expect(plan.answerShape).toContain("->");
      expect(plan.ratingQuestion.length).toBeGreaterThan(20);
    }
  });

  it("filters cards by learning type without hiding all cards by default", () => {
    expect(filterCardsByLearningType(allFlashcards, allLearningTypes)).toHaveLength(
      allFlashcards.length
    );

    for (const type of learningTypes) {
      const cards = filterCardsByLearningType(allFlashcards, type);

      expect(cards.length).toBeGreaterThan(0);
      expect(cards.every((card) => getLearningType(card) === type)).toBe(true);
    }
  });

  it("keeps each interview deck useful across recall and interview rehearsal modes", () => {
    for (const deck of interviewDecks) {
      const deckTypes = new Set(deck.cards.map((card) => getLearningType(card)));

      expect(deckTypes.has("Fact")).toBe(true);
      expect(deckTypes.has("Scenario") || deckTypes.has("Story")).toBe(true);
    }
  });
});
