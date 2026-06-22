import { describe, expect, it } from "vitest";

import { readingModules } from "@/data/content";

describe("reading modules", () => {
  it("ships a factual reading path for the booking-platform interview material", () => {
    expect(readingModules.length).toBeGreaterThanOrEqual(11);

    const moduleIds = readingModules.map((readingModule) => readingModule.id);
    expect(new Set(moduleIds).size).toBe(moduleIds.length);
    expect(moduleIds).toEqual(
      expect.arrayContaining([
        "angular-frontend-basics",
        "booking-system-walkthrough",
        "django-request-lifecycle",
        "keys-and-relationships",
        "testing-strategy",
        "transactions-and-locking"
      ])
    );
  });

  it("keeps each module useful for reading-based learning", () => {
    for (const readingModule of readingModules) {
      expect(readingModule.title.length).toBeGreaterThan(4);
      expect(readingModule.title).not.toMatch(/\bAnd\b/);
      expect(readingModule.category.length).toBeGreaterThan(4);
      expect(readingModule.summary.length).toBeGreaterThan(50);
      expect(readingModule.coreFacts.length).toBeGreaterThanOrEqual(3);
      expect(readingModule.interviewLine.length).toBeGreaterThan(60);
      expect(readingModule.guidedExamples.length).toBeGreaterThan(0);
      expect(readingModule.commonPitfalls.length).toBeGreaterThan(0);
      expect(readingModule.tradeoffLens.prompt.length).toBeGreaterThan(20);
      expect(readingModule.tradeoffLens.juniorAnswer.length).toBeGreaterThan(20);
      expect(readingModule.tradeoffLens.midLevelAnswer.length).toBeGreaterThan(
        readingModule.tradeoffLens.juniorAnswer.length + 30
      );
      expect(readingModule.tradeoffLens.considerations.length).toBeGreaterThanOrEqual(3);

      for (const fact of readingModule.coreFacts) {
        expect(fact.label.length).toBeGreaterThan(2);
        expect(fact.body.length).toBeGreaterThan(40);
      }

      for (const example of readingModule.guidedExamples) {
        expect(example.scenario.length).toBeGreaterThan(40);
        expect(example.steps.length).toBeGreaterThanOrEqual(4);
        expect(example.takeaway.length).toBeGreaterThan(40);
      }
    }
  });

  it("includes a guided booking example with concurrency defenses", () => {
    const bookingModule = readingModules.find(
      (readingModule) => readingModule.id === "booking-system-walkthrough"
    );

    expect(bookingModule).toBeDefined();
    expect(bookingModule?.coreFacts.map((fact) => fact.label)).toEqual(
      expect.arrayContaining(["Data model", "Double-booking defense", "API shape"])
    );
    expect(bookingModule?.interviewLine).toContain("SELECT FOR UPDATE");
    expect(bookingModule?.guidedExamples.some((example) => example.steps.length >= 4)).toBe(
      true
    );
  });

  it("coaches mid-level trade-off answers instead of tool-name answers", () => {
    const redisModule = readingModules.find(
      (readingModule) => readingModule.id === "redis-caching-rate-limits"
    );

    expect(redisModule).toBeDefined();
    expect(redisModule?.tradeoffLens.juniorAnswer).toContain("fast");
    expect(redisModule?.tradeoffLens.midLevelAnswer).toContain("staleness");
    expect(redisModule?.tradeoffLens.midLevelAnswer).toContain("TTL");
    expect(redisModule?.tradeoffLens.midLevelAnswer).toContain("source of truth");
    expect(redisModule?.tradeoffLens.considerations).toEqual(
      expect.arrayContaining([
        "Read-heavy access pattern",
        "Staleness tolerance",
        "Invalidation strategy"
      ])
    );
  });

  it("covers the mid-level full-stack gaps beyond the original booking material", () => {
    const moduleIds = readingModules.map((readingModule) => readingModule.id);

    expect(moduleIds).toEqual(
      expect.arrayContaining([
        "auth-security-permissions",
        "api-endpoint-design",
        "observability-debugging",
        "frontend-state-forms",
        "sql-live-coding-drills"
      ])
    );

    const combinedContent = readingModules
      .map((readingModule) => {
        return [
          readingModule.title,
          readingModule.summary,
          readingModule.interviewLine,
          ...readingModule.coreFacts.map((fact) => `${fact.label} ${fact.body}`),
          ...readingModule.guidedExamples.flatMap((example) => [
            example.title,
            example.scenario,
            ...example.steps,
            example.takeaway
          ]),
          ...readingModule.commonPitfalls
        ].join(" ");
      })
      .join(" ");

    expect(combinedContent).toContain("object-level authorization");
    expect(combinedContent).toContain("status codes");
    expect(combinedContent).toContain("logs, metrics, and traces");
    expect(combinedContent).toContain("loading, empty, error, and success states");
    expect(combinedContent).toContain("SQL");
  });
});
