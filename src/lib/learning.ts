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

export type ActiveDrillId =
  | "match"
  | "blind-rebuild"
  | "example-non-example"
  | "prediction"
  | "question-inversion"
  | "compression"
  | "transfer"
  | "teach-back";

export type ActiveDrill = {
  id: ActiveDrillId;
  label: string;
  shortLabel: string;
  description: string;
  steps: string[];
};

export type MatchItem = {
  cardId: string;
  topic: Flashcard["topic"];
  text: string;
};

export type MatchRound = {
  prompts: MatchItem[];
  answers: MatchItem[];
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

export const activeDrills: ActiveDrill[] = [
  {
    id: "match",
    label: "Match cards",
    shortLabel: "Match",
    description:
      "Pair prompts with the correct answer shape so recognition turns into discrimination.",
    steps: [
      "Pick a prompt on the left.",
      "Pick the matching answer on the right.",
      "Use misses to name the exact clue you overlooked."
    ]
  },
  {
    id: "blind-rebuild",
    label: "Blind rebuild",
    shortLabel: "Rebuild",
    description:
      "Close the answer and reconstruct the definition, example, pitfall, and trade-off from memory.",
    steps: [
      "Write or say the full answer without looking.",
      "Reveal the card and mark missing claims, examples, and caveats.",
      "Repeat once using only the corrected outline."
    ]
  },
  {
    id: "example-non-example",
    label: "Examples and non-examples",
    shortLabel: "Examples",
    description:
      "Generate qualifying and almost-qualifying cases so subtle boundaries become obvious.",
    steps: [
      "Create two examples that clearly fit the concept.",
      "Create two tempting non-examples that do not fit.",
      "State the rule that separates them."
    ]
  },
  {
    id: "prediction",
    label: "Prediction before reveal",
    shortLabel: "Predict",
    description:
      "Predict the next step, failure mode, or trade-off before checking the prepared answer.",
    steps: [
      "Read only the question and predict the likely answer shape.",
      "Reveal the answer and compare your prediction to the actual key points.",
      "Turn the biggest miss into one follow-up question."
    ]
  },
  {
    id: "question-inversion",
    label: "Question inversion",
    shortLabel: "Invert",
    description:
      "Flip the prompt into why, when, failure, and trade-off questions to expose shallow understanding.",
    steps: [
      "Ask why this concept exists.",
      "Ask when it fails or should not be used.",
      "Ask what changes when one assumption is removed."
    ]
  },
  {
    id: "compression",
    label: "Compression ladder",
    shortLabel: "Compress",
    description:
      "Shrink the answer from full explanation to interview-ready sentence without losing the core idea.",
    steps: [
      "Explain the answer in one minute.",
      "Compress it to three bullets.",
      "Compress it again to one sentence you could say under pressure."
    ]
  },
  {
    id: "transfer",
    label: "Transfer problem",
    shortLabel: "Transfer",
    description:
      "Apply the same concept in a new context so understanding survives changed surface details.",
    steps: [
      "Move the idea into a new context with different data, traffic, or user constraints.",
      "Name which parts of the original answer still apply.",
      "Name what changes and why."
    ]
  },
  {
    id: "teach-back",
    label: "Teach-back prompt",
    shortLabel: "Teach",
    description:
      "Explain the concept to a smart teammate who is new to the stack and needs practical judgment.",
    steps: [
      "Teach the concept in plain language.",
      "Use the card example as the practical anchor.",
      "End with one decision rule the teammate could reuse."
    ]
  }
];

export function getLearningPlan(typeOrCard: LearningType | Pick<Flashcard, "topic" | "question">) {
  const type = typeof typeOrCard === "string" ? typeOrCard : getLearningType(typeOrCard);

  return learningPlans[type];
}

export function getActiveDrill(drillId: ActiveDrillId): ActiveDrill {
  return activeDrills.find((drill) => drill.id === drillId) ?? activeDrills[0];
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

export function buildMatchRound<TCard extends Pick<Flashcard, "id" | "topic" | "question" | "answer">>(
  cards: TCard[],
  startIndex = 0,
  size = 4
): MatchRound {
  const safeSize = Math.max(0, Math.min(size, cards.length));
  const selectedCards = Array.from({ length: safeSize }, (_, offset) => {
    return cards[(startIndex + offset) % cards.length];
  }).filter((card): card is TCard => Boolean(card));
  const rotatedAnswerCards =
    selectedCards.length > 1 ? [...selectedCards.slice(1), selectedCards[0]] : selectedCards;

  return {
    prompts: selectedCards.map((card) => ({
      cardId: card.id,
      topic: card.topic,
      text: card.question
    })),
    answers: rotatedAnswerCards.map((card) => ({
      cardId: card.id,
      topic: card.topic,
      text: card.answer
    }))
  };
}
