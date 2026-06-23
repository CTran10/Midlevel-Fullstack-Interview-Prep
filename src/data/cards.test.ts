import { describe, expect, it } from "vitest";

import {
  deliveryPlatformFlashcards,
  deliveryPlatformTopics,
  bookingPlatformExtendedFlashcards,
  bookingPlatformExtendedTopics,
  flashcards,
  interviewDecks,
  interviewTracks,
  topics
} from "@/data/cards";

describe("seed flashcards", () => {
  it("ships exactly 50 booking-platform-relevant cards", () => {
    expect(flashcards).toHaveLength(50);
  });

  it("covers every requested topic", () => {
    expect(topics).toEqual([
      "Django",
      "Postgres",
      "Performance",
      "Testing",
      "System Design",
      "AWS/Infra",
      "Behavioral"
    ]);

    for (const topic of topics) {
      expect(flashcards.some((card) => card.topic === topic)).toBe(true);
    }
  });

  it("includes the active recall fields every card needs", () => {
    for (const card of [...flashcards, ...deliveryPlatformFlashcards]) {
      expect(card.id).toMatch(/^[a-z0-9-]+$/);
      expect(card.question.length).toBeGreaterThan(20);
      expect(card.answer.length).toBeGreaterThan(40);
      expect(card.example.length).toBeGreaterThan(30);
      expect(card.prompt.length).toBeGreaterThan(20);
    }
  });

  it("ships a separate backend-specific interview deck", () => {
    expect(deliveryPlatformFlashcards).toHaveLength(50);
    expect(deliveryPlatformTopics).toEqual([
      "HTTP/REST",
      "Databases",
      "Redis/Caching",
      "Queues",
      "Distributed Systems",
      "Microservices",
      "Reliability",
      "Search",
      "System Design",
      "Behavioral/AI"
    ]);

    for (const topic of deliveryPlatformTopics) {
      expect(deliveryPlatformFlashcards.some((card) => card.topic === topic)).toBe(true);
    }
  });

  it("ships an extended booking-platform drill bank from the markdown source", () => {
    expect(bookingPlatformExtendedFlashcards).toHaveLength(80);
    expect(bookingPlatformExtendedTopics).toHaveLength(18);

    for (const topic of bookingPlatformExtendedTopics) {
      expect(bookingPlatformExtendedFlashcards.some((card) => card.topic === topic)).toBe(true);
    }

    expect(bookingPlatformExtendedFlashcards[0]).toMatchObject({
      id: "booking-platform-extended-django-orm-when-are-django-querysets-evaluated",
      topic: "Django ORM",
      prompt: "How would you avoid accidentally running extra ORM queries in a view?"
    });
  });

  it("exposes every interview section with unique cards", () => {
    expect(interviewDecks.map((deck) => deck.id)).toEqual([
      "booking-platform",
      "booking-platform-extended",
      "delivery-platform"
    ]);

    const allCardIds = interviewDecks.flatMap((deck) => deck.cards.map((card) => card.id));
    expect(new Set(allCardIds).size).toBe(allCardIds.length);

    for (const deck of interviewDecks) {
      for (const card of deck.cards) {
        expect(deck.topics).toContain(card.topic);
      }
    }

    expect(interviewDecks.find((deck) => deck.id === "delivery-platform")?.positioning).toContain(
      "backend lean"
    );
  });

  it("groups decks into neutral full-stack and backend track tabs", () => {
    expect(interviewTracks).toEqual([
      {
        id: "full-stack",
        label: "Full-stack focus",
        description:
          "Django, frontend state, Postgres, testing, product judgment, and user-facing feature work.",
        deckIds: ["booking-platform", "booking-platform-extended"]
      },
      {
        id: "backend-systems",
        label: "Backend systems",
        description:
          "HTTP APIs, databases, caching, queues, distributed systems, reliability, search, and service boundaries.",
        deckIds: ["delivery-platform"]
      }
    ]);

    expect(interviewDecks.map((deck) => deck.name)).toEqual([
      "Full-stack product fundamentals",
      "Full-stack product extended",
      "Backend systems fundamentals"
    ]);
    expect(interviewDecks.map((deck) => deck.shortName)).toEqual([
      "Core",
      "Extended",
      "Systems"
    ]);
  });
});
