import { describe, expect, it } from "vitest";

import {
  activeDrills,
  allLearningTypes,
  buildMatchRound,
  filterCardsByLearningType,
  getActiveDrill,
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

  it("offers active learning drills beyond basic flashcard reveal", () => {
    expect(activeDrills.map((drill) => drill.id)).toEqual([
      "match",
      "blind-rebuild",
      "example-non-example",
      "prediction",
      "question-inversion",
      "compression",
      "transfer",
      "teach-back"
    ]);

    expect(getActiveDrill("transfer").steps.join(" ")).toContain("new context");
  });

  it("builds deterministic flashcard matching rounds from the selected card pool", () => {
    const cards = allFlashcards.slice(0, 5);
    const round = buildMatchRound(cards, 1, 4);

    expect(round.prompts).toHaveLength(4);
    expect(round.answers).toHaveLength(4);
    expect(round.prompts.map((prompt) => prompt.cardId)).toEqual(
      cards.slice(1, 5).map((card) => card.id)
    );
    expect(round.answers.map((answer) => answer.cardId)).toEqual([
      cards[2].id,
      cards[3].id,
      cards[4].id,
      cards[1].id
    ]);
  });

  it("caps matching rounds to unique available cards", () => {
    const cards = allFlashcards.slice(0, 2);
    const round = buildMatchRound(cards, 0, 4);

    expect(round.prompts).toHaveLength(2);
    expect(round.answers).toHaveLength(2);
    expect(new Set(round.prompts.map((prompt) => prompt.cardId)).size).toBe(2);
  });
});
