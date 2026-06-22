import type { Flashcard } from "@/data/cards";

export const allLearningTypes = "All types";

export const learningTypes = ["Fact", "Contrast", "Scenario", "Story"] as const;

export type LearningType = (typeof learningTypes)[number];
export type LearningTypeFilter = LearningType | typeof allLearningTypes;

export type LearningPlan = {
  type: LearningType;
  label: string;
  shortLabel: string;
  recallTarget: string;
  answerShape: string;
  ratingQuestion: string;
};

const learningPlans: Record<LearningType, LearningPlan> = {
  Fact: {
    type: "Fact",
    label: "Fact recall",
    shortLabel: "Fact",
    recallTarget:
      "Give the shortest correct definition first, then one concrete example and one common pitfall.",
    answerShape: "Definition -> use -> example -> pitfall",
    ratingQuestion: "Could you state the definition cleanly without reading?"
  },
  Contrast: {
    type: "Contrast",
    label: "Contrast drill",
    shortLabel: "Contrast",
    recallTarget:
      "Name both sides, separate when each applies, then anchor the difference with one example.",
    answerShape: "A vs B -> when to use each -> example -> tradeoff",
    ratingQuestion: "Could you choose between the options under interview pressure?"
  },
  Scenario: {
    type: "Scenario",
    label: "Scenario rehearsal",
    shortLabel: "Scenario",
    recallTarget:
      "Open with the approach, walk through the steps, then name the failure mode or tradeoff.",
    answerShape: "Approach -> steps -> failure mode -> tradeoff",
    ratingQuestion: "Could you explain the design decision and its tradeoff out loud?"
  },
  Story: {
    type: "Story",
    label: "Story practice",
    shortLabel: "Story",
    recallTarget:
      "Answer with a compact STAR story: situation, task, action, result, and what you learned.",
    answerShape: "Situation -> task -> action -> result -> lesson",
    ratingQuestion: "Could you tell the story with a specific impact and a calm ending?"
  }
};

export function getLearningPlan(typeOrCard: LearningType | Pick<Flashcard, "topic" | "question">) {
  const type = typeof typeOrCard === "string" ? typeOrCard : getLearningType(typeOrCard);

  return learningPlans[type];
}

export function getLearningType(card: Pick<Flashcard, "topic" | "question">): LearningType {
  const topic = card.topic.toLowerCase();
  const question = card.question.toLowerCase();

  if (
    topic.includes("behavioral") ||
    question.startsWith("tell me about") ||
    question.includes("positioning") ||
    question.includes("story")
  ) {
    return "Story";
  }

  if (
    topic.includes(" vs ") ||
    question.includes(" versus ") ||
    question.includes(" vs ") ||
    question.includes("difference between") ||
    question.includes("different from") ||
    question.includes("compare ") ||
    question.includes("choose between") ||
    question.includes("synchronous versus asynchronous")
  ) {
    return "Contrast";
  }

  if (
    question.startsWith("what is ") ||
    question.startsWith("what are ") ||
    question.startsWith("what does ") ||
    question.startsWith("what makes ") ||
    question.startsWith("when are ") ||
    question.startsWith("when can ") ||
    question.startsWith("why use ") ||
    question.startsWith("why does ")
  ) {
    return "Fact";
  }

  return "Scenario";
}

export function filterCardsByLearningType<TCard extends Pick<Flashcard, "topic" | "question">>(
  cards: TCard[],
  learningType: LearningTypeFilter
): TCard[] {
  if (learningType === allLearningTypes) {
    return cards;
  }

  return cards.filter((card) => getLearningType(card) === learningType);
}
