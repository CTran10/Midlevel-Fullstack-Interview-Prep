import type { Flashcard } from "@/data/cards";

export const ratings = ["Again", "Hard", "Good", "Easy"] as const;

export type Rating = (typeof ratings)[number];

export type ReviewRecord = {
  cardId: string;
  nextDue: string;
  lastRating: Rating;
  reviewedCount: number;
  lastReviewedAt: string;
};

export type ProgressMap = Record<string, ReviewRecord>;

const ratingDelayMs: Record<Rating, number> = {
  Again: 0,
  Hard: 10 * 60 * 1000,
  Good: 24 * 60 * 60 * 1000,
  Easy: 2 * 24 * 60 * 60 * 1000
};

export function getNextDueDate(rating: Rating, now = new Date()): Date {
  return new Date(now.getTime() + ratingDelayMs[rating]);
}

export function createReviewRecord(
  cardId: string,
  rating: Rating,
  now = new Date(),
  previous?: ReviewRecord
): ReviewRecord {
  return {
    cardId,
    nextDue: getNextDueDate(rating, now).toISOString(),
    lastRating: rating,
    reviewedCount: (previous?.reviewedCount ?? 0) + 1,
    lastReviewedAt: now.toISOString()
  };
}

export function getDueCards<TCard extends Pick<Flashcard, "id">>(
  cards: TCard[],
  progress: ProgressMap,
  now = new Date()
): TCard[] {
  const nowTime = now.getTime();

  return cards.filter((card) => {
    const record = progress[card.id];
    if (!record) {
      return true;
    }

    return new Date(record.nextDue).getTime() <= nowTime;
  });
}

export function mergeProgress(
  cards: Pick<Flashcard, "id">[],
  progress: ProgressMap
): ProgressMap {
  const cardIds = new Set(cards.map((card) => card.id));

  return Object.fromEntries(
    Object.entries(progress).filter(([cardId, record]) => {
      return cardIds.has(cardId) && record.cardId === cardId;
    })
  );
}

export function parseStoredProgress(value: string | null): ProgressMap {
  if (!value) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) {
      return {};
    }

    const progress: ProgressMap = {};
    for (const [cardId, record] of Object.entries(parsed)) {
      if (isReviewRecord(record) && record.cardId === cardId) {
        progress[cardId] = record;
      }
    }

    return progress;
  } catch {
    return {};
  }
}

export function getReviewedCount(progress: ProgressMap): number {
  return Object.values(progress).reduce((total, record) => {
    return total + record.reviewedCount;
  }, 0);
}

export function getKnownCardProgress(
  cards: Pick<Flashcard, "id">[],
  progress: ProgressMap
): ReviewRecord[] {
  const cardIds = new Set(cards.map((card) => card.id));

  return Object.values(progress).filter((record) => cardIds.has(record.cardId));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRating(value: unknown): value is Rating {
  return ratings.some((rating) => rating === value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isReviewRecord(value: unknown): value is ReviewRecord {
  if (!isRecord(value)) {
    return false;
  }

  const reviewedCount = value.reviewedCount;

  return (
    typeof value.cardId === "string" &&
    isIsoDate(value.nextDue) &&
    isRating(value.lastRating) &&
    Number.isInteger(reviewedCount) &&
    typeof reviewedCount === "number" &&
    reviewedCount >= 0 &&
    isIsoDate(value.lastReviewedAt)
  );
}
