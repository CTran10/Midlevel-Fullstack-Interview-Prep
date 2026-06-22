import type { InterviewDeck, Topic } from "@/data/cards";
import type { ReadingModule } from "@/data/content";
import { getLearningType, learningTypes } from "@/lib/learning";
import { getDueCards, mergeProgress, type ProgressMap, type Rating } from "@/lib/srs";

type AssessmentExportInput = {
  deck: InterviewDeck;
  progress: ProgressMap;
  readingModules: ReadingModule[];
  now?: Date;
};

type TopicBreakdown = {
  topic: Topic;
  totalCards: number;
  reviewedCards: number;
  dueCards: number;
  weakReviews: number;
  weakScore: number;
};

const ratingScores: Record<Rating, number> = {
  Again: 0,
  Hard: 1,
  Good: 2,
  Easy: 3
};

const targetStack = [
  "Django",
  "Postgres",
  "Redis",
  "AWS",
  "Angular/frontend",
  "system design",
  "testing",
  "production debugging"
];

export function buildAssessmentExport({
  deck,
  progress,
  readingModules,
  now = new Date()
}: AssessmentExportInput): string {
  const deckProgress = mergeProgress(deck.cards, progress);
  const reviewedCardIds = new Set(Object.keys(deckProgress));
  const dueCards = getDueCards(deck.cards, deckProgress, now);
  const reviewedCount = reviewedCardIds.size;
  const totalReviews = Object.values(deckProgress).reduce((total, record) => {
    return total + record.reviewedCount;
  }, 0);
  const topicBreakdown = buildTopicBreakdown(deck, deckProgress, dueCards);
  const weakestTopics = [...topicBreakdown]
    .sort((first, second) => second.weakScore - first.weakScore)
    .slice(0, 5);
  const nextReps = buildNextReps(deck, deckProgress, dueCards);
  const weakLearningTypes = learningTypes
    .map((type) => {
      const cards = deck.cards.filter((card) => getLearningType(card) === type);
      const reviewedCards = cards.filter((card) => reviewedCardIds.has(card.id));
      const weakCards = reviewedCards.filter((card) => {
        const rating = deckProgress[card.id]?.lastRating;
        return rating === "Again" || rating === "Hard";
      });

      return {
        type,
        reviewedCards: reviewedCards.length,
        totalCards: cards.length,
        weakCards: weakCards.length
      };
    })
    .filter((typeSummary) => typeSummary.totalCards > 0);

  return [
    "# Mid-level full-stack SWE readiness export",
    "",
    `Generated: ${now.toISOString()}`,
    "Target level: Mid-level full-stack SWE",
    `Target stack: ${targetStack.join(", ")}`,
    `Deck: ${deck.name}`,
    deck.positioning ? `Positioning: ${deck.positioning}` : undefined,
    "",
    "## Progress snapshot",
    `- Cards in deck: ${deck.cards.length}`,
    `- Reviewed cards: ${reviewedCount} / ${deck.cards.length}`,
    `- Total review reps: ${totalReviews}`,
    `- Due cards: ${dueCards.length}`,
    `- Reading modules available: ${readingModules.length}`,
    `- Trade-off readiness: ${readingModules.length} modules include junior versus mid-level trade-off coaching.`,
    "",
    "## Topic breakdown",
    "| Topic | Reviewed | Due | Weak signals |",
    "| --- | ---: | ---: | ---: |",
    ...topicBreakdown.map((topic) => {
      return `| ${topic.topic} | ${topic.reviewedCards}/${topic.totalCards} | ${topic.dueCards} | ${topic.weakReviews} |`;
    }),
    "",
    "## Weakest gap signals",
    ...weakestTopics.map((topic) => {
      return `- ${topic.topic}: ${topic.reviewedCards}/${topic.totalCards} reviewed, ${topic.dueCards} due, ${topic.weakReviews} Again/Hard reviews.`;
    }),
    "",
    "## Learning type signals",
    ...weakLearningTypes.map((typeSummary) => {
      return `- ${typeSummary.type}: ${typeSummary.reviewedCards}/${typeSummary.totalCards} reviewed, ${typeSummary.weakCards} weak reviews.`;
    }),
    "",
    "## Best next study reps",
    ...nextReps.map((card, index) => {
      return `${index + 1}. ${card.topic}: ${card.question}`;
    }),
    "",
    "## LLM leveling rubric",
    "Rate me as one of: Junior, Junior-plus, Early mid-level, Solid mid-level.",
    "Use these signals:",
    "- Can explain trade-offs instead of only naming tools.",
    "- Can protect correctness under concurrency.",
    "- Can design APIs with validation, authorization, status codes, and idempotency.",
    "- Can debug production issues using logs, metrics, and traces.",
    "- Can explain frontend state, forms, async states, and backend authority.",
    "- Can identify security and object-level authorization risks.",
    "- Can turn vague system design into concrete data models, flows, and tests.",
    "",
    "Return:",
    "1. Leveling assessment",
    "2. Strongest signals",
    "3. Weakest gaps",
    "4. Best next 5 study reps",
    "5. What I should practice saying out loud"
  ]
    .filter((line): line is string => typeof line === "string")
    .join("\n");
}

function buildTopicBreakdown(
  deck: InterviewDeck,
  progress: ProgressMap,
  dueCards: InterviewDeck["cards"]
): TopicBreakdown[] {
  const dueCardIds = new Set(dueCards.map((card) => card.id));

  return deck.topics.map((topic) => {
    const cards = deck.cards.filter((card) => card.topic === topic);
    const reviewedCards = cards.filter((card) => progress[card.id]);
    const weakReviews = reviewedCards.filter((card) => {
      const rating = progress[card.id]?.lastRating;
      return rating === "Again" || rating === "Hard";
    }).length;
    const ratingPenalty = reviewedCards.reduce((total, card) => {
      const rating = progress[card.id]?.lastRating;
      return total + (rating ? 3 - ratingScores[rating] : 3);
    }, 0);
    const unreviewedCount = cards.length - reviewedCards.length;

    return {
      topic,
      totalCards: cards.length,
      reviewedCards: reviewedCards.length,
      dueCards: cards.filter((card) => dueCardIds.has(card.id)).length,
      weakReviews,
      weakScore: unreviewedCount * 2 + weakReviews * 3 + ratingPenalty
    };
  });
}

function buildNextReps(
  deck: InterviewDeck,
  progress: ProgressMap,
  dueCards: InterviewDeck["cards"]
): InterviewDeck["cards"] {
  const dueCardIds = new Set(dueCards.map((card) => card.id));
  const scoredCards = deck.cards.map((card, index) => {
    const record = progress[card.id];
    const rating = record?.lastRating;
    const weakness =
      (dueCardIds.has(card.id) ? 4 : 0) +
      (!record ? 3 : 0) +
      (rating === "Again" ? 5 : 0) +
      (rating === "Hard" ? 4 : 0) +
      (getLearningType(card) === "Scenario" ? 1 : 0);

    return { card, index, weakness };
  });

  return scoredCards
    .sort((first, second) => {
      if (second.weakness !== first.weakness) {
        return second.weakness - first.weakness;
      }

      return first.index - second.index;
    })
    .slice(0, 5)
    .map((scoredCard) => scoredCard.card);
}
