"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  allFlashcards,
  interviewDecks,
  type DeckId,
  type Flashcard,
  type Topic
} from "@/data/cards";
import { readingModules, type ReadingModule } from "@/data/content";
import {
  createReviewRecord,
  getDueCards,
  getKnownCardProgress,
  getReviewedCount,
  mergeProgress,
  parseStoredProgress,
  type ProgressMap,
  type Rating
} from "@/lib/srs";
import {
  allLearningTypes,
  filterCardsByLearningType,
  getLearningPlan,
  learningTypes,
  type LearningTypeFilter
} from "@/lib/learning";
import { buildAssessmentExport } from "@/lib/assessment-export";

const storageKey = "fullstack-interview-prep-progress-v1";
const allTopics = "All";
const mockDurationSeconds = 60;
const readingFactCount = readingModules.reduce(
  (total, module) => total + module.coreFacts.length,
  0
);
const readingExampleCount = readingModules.reduce(
  (total, module) => total + module.guidedExamples.length,
  0
);

type TopicFilter = Topic | typeof allTopics;
type AppMode = "study" | "read" | "mock";

const ratingStyles: Record<Rating, string> = {
  Again: "border-[var(--danger-soft)] bg-[var(--danger-soft)] text-[var(--danger-ink)]",
  Hard: "border-[var(--warning-soft)] bg-[var(--warning-soft)] text-[var(--warning-ink)]",
  Good: "border-[var(--blue-soft)] bg-[var(--blue-soft)] text-[var(--blue-ink)]",
  Easy: "border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--accent)]"
};

function getCardsForSelection(
  cards: Flashcard[],
  topic: TopicFilter,
  learningType: LearningTypeFilter
): Flashcard[] {
  const topicCards =
    topic === allTopics ? cards : cards.filter((card) => card.topic === topic);

  return filterCardsByLearningType(topicCards, learningType);
}

export function InterviewPrepApp() {
  const [selectedDeckId, setSelectedDeckId] = useState<DeckId>("booking-platform");
  const [selectedTopic, setSelectedTopic] = useState<TopicFilter>(allTopics);
  const [selectedLearningType, setSelectedLearningType] =
    useState<LearningTypeFilter>(allLearningTypes);
  const [mode, setMode] = useState<AppMode>("study");
  const [selectedReadingModuleId, setSelectedReadingModuleId] = useState(
    readingModules[0].id
  );
  const [progress, setProgress] = useState<ProgressMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [studyIndex, setStudyIndex] = useState(0);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [mockCard, setMockCard] = useState<Flashcard | null>(allFlashcards[0]);
  const [mockSeconds, setMockSeconds] = useState(mockDurationSeconds);
  const [mockRunning, setMockRunning] = useState(false);
  const [mockFinished, setMockFinished] = useState(false);
  const [assessmentMessage, setAssessmentMessage] = useState<string | null>(null);

  const activeDeck = useMemo(() => {
    return interviewDecks.find((deck) => deck.id === selectedDeckId) ?? interviewDecks[0];
  }, [selectedDeckId]);

  const activeReadingModule = useMemo(() => {
    return (
      readingModules.find((module) => module.id === selectedReadingModuleId) ??
      readingModules[0]
    );
  }, [selectedReadingModuleId]);

  useEffect(() => {
    const hydrationId = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        setProgress(mergeProgress(allFlashcards, parseStoredProgress(saved)));
      } catch {
        setStorageMessage("Progress is available for this session, but browser storage is blocked.");
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(hydrationId);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      const messageId = window.setTimeout(() => {
        setStorageMessage("Progress is available for this session, but browser storage is blocked.");
      }, 0);

      return () => window.clearTimeout(messageId);
    }
  }, [hydrated, progress]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const topicFilteredCards = useMemo(() => {
    return getCardsForSelection(activeDeck.cards, selectedTopic, allLearningTypes);
  }, [activeDeck.cards, selectedTopic]);

  const filteredCards = useMemo(() => {
    return getCardsForSelection(activeDeck.cards, selectedTopic, selectedLearningType);
  }, [activeDeck.cards, selectedLearningType, selectedTopic]);

  const knownProgress = useMemo(() => {
    return getKnownCardProgress(filteredCards, progress);
  }, [filteredCards, progress]);

  const dueCards = useMemo(() => {
    return getDueCards(filteredCards, progress, now);
  }, [filteredCards, now, progress]);
  const assessmentReport = useMemo(() => {
    return buildAssessmentExport({
      deck: activeDeck,
      progress,
      readingModules,
      now
    });
  }, [activeDeck, now, progress]);

  const studyPool = dueCards.length > 0 ? dueCards : filteredCards;
  const currentCard = studyPool.length > 0 ? studyPool[studyIndex % studyPool.length] : null;
  const reviewedCount = getReviewedCount(mergeProgress(filteredCards, progress));
  const completionCount = knownProgress.length;
  const headerStats =
    mode === "read"
      ? [
          { label: "Modules", value: readingModules.length.toString() },
          { label: "Facts", value: readingFactCount.toString() },
          { label: "Examples", value: readingExampleCount.toString() },
          { label: "Minutes", value: `${activeReadingModule.estimatedMinutes}` }
        ]
      : [
          { label: "Due", value: dueCards.length.toString() },
          { label: "Cards", value: filteredCards.length.toString() },
          { label: "Seen", value: completionCount.toString() },
          { label: "Reviews", value: reviewedCount.toString() }
        ];

  const pickRandomCard = useCallback(
    (excludeId?: string, cards: Flashcard[] = filteredCards) => {
      if (cards.length === 0) {
        return null;
      }

      const candidates =
        excludeId && cards.length > 1
          ? cards.filter((card) => card.id !== excludeId)
          : cards;
      const index = Math.floor(Math.random() * candidates.length);

      return candidates[index] ?? null;
    },
    [filteredCards]
  );

  function chooseDeck(deckId: DeckId) {
    const nextDeck = interviewDecks.find((deck) => deck.id === deckId) ?? interviewDecks[0];
    const nextCards = getCardsForSelection(nextDeck.cards, allTopics, allLearningTypes);

    setSelectedDeckId(nextDeck.id);
    setSelectedTopic(allTopics);
    setSelectedLearningType(allLearningTypes);
    setStudyIndex(0);
    setAnswerVisible(false);
    setMockCard(pickRandomCard(undefined, nextCards));
    setMockSeconds(mockDurationSeconds);
    setMockRunning(false);
    setMockFinished(false);
  }

  function chooseTopic(topic: TopicFilter) {
    const nextCards = getCardsForSelection(activeDeck.cards, topic, selectedLearningType);

    setSelectedTopic(topic);
    setStudyIndex(0);
    setAnswerVisible(false);
    setMockCard(pickRandomCard(undefined, nextCards));
    setMockSeconds(mockDurationSeconds);
    setMockRunning(false);
    setMockFinished(false);
  }

  function chooseLearningType(learningType: LearningTypeFilter) {
    const nextCards = getCardsForSelection(activeDeck.cards, selectedTopic, learningType);

    setSelectedLearningType(learningType);
    setStudyIndex(0);
    setAnswerVisible(false);
    setMockCard(pickRandomCard(undefined, nextCards));
    setMockSeconds(mockDurationSeconds);
    setMockRunning(false);
    setMockFinished(false);
  }

  function chooseReadingModule(moduleId: string) {
    setSelectedReadingModuleId(moduleId);
  }

  useEffect(() => {
    if (mode !== "mock" || !mockRunning || mockFinished) {
      return;
    }

    const timerId = window.setInterval(() => {
      setMockSeconds((seconds) => {
        if (seconds <= 1) {
          setMockRunning(false);
          setMockFinished(true);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [mockFinished, mockRunning, mode]);

  function rateCurrentCard(rating: Rating) {
    if (!currentCard) {
      return;
    }

    const reviewedAt = new Date();

    setProgress((previousProgress) => {
      const previousRecord = previousProgress[currentCard.id];
      return {
        ...previousProgress,
        [currentCard.id]: createReviewRecord(
          currentCard.id,
          rating,
          reviewedAt,
          previousRecord
        )
      };
    });
    setNow(reviewedAt);
    setAnswerVisible(false);
    setStudyIndex(0);
  }

  function skipCard() {
    setAnswerVisible(false);
    setStudyIndex((index) => {
      if (studyPool.length <= 1) {
        return 0;
      }

      return (index + 1) % studyPool.length;
    });
  }

  function startMockAnswer() {
    setMockSeconds(mockDurationSeconds);
    setMockRunning(true);
    setMockFinished(false);
  }

  function finishMockAnswer() {
    setMockRunning(false);
    setMockFinished(true);
  }

  function nextMockQuestion() {
    setMockCard((card) => pickRandomCard(card?.id));
    setMockSeconds(mockDurationSeconds);
    setMockRunning(false);
    setMockFinished(false);
  }

  function resetProgress() {
    const deckCardIds = new Set(activeDeck.cards.map((card) => card.id));
    setProgress((previousProgress) => {
      return Object.fromEntries(
        Object.entries(previousProgress).filter(([cardId]) => {
          return !deckCardIds.has(cardId);
        })
      );
    });
    setStudyIndex(0);
    setAnswerVisible(false);
    setNow(new Date());
  }

  function copyAssessmentReport() {
    if (!navigator.clipboard) {
      setAssessmentMessage("Clipboard is unavailable. Select the report text below.");
      return;
    }

    navigator.clipboard
      .writeText(assessmentReport)
      .then(() => {
        setAssessmentMessage("Report copied.");
      })
      .catch(() => {
        setAssessmentMessage("Copy failed. Select the report text below.");
      });
  }

  return (
    <main className="min-h-[100dvh] overflow-x-hidden px-4 py-5 text-[var(--ink)] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="study-surface soft-enter flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              {mode === "read" ? "Reading guide" : `${activeDeck.name} prep`}
            </p>
            <h1 className="text-3xl font-semibold tracking-[0] text-balance sm:text-4xl">
              {mode === "read"
                ? "Read the concepts, then rehearse the answer."
                : "Active recall flashcards for your next interview."}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              {mode === "read"
                ? "Factual notes for Django, Postgres, concurrency, booking system design, infra, Angular, and behavioral stories."
                : activeDeck.description}
            </p>
            <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
              {mode === "read"
                ? `Current section: ${activeReadingModule.title}`
                : `Focus: ${selectedLearningType}${selectedTopic === allTopics ? "" : ` / ${selectedTopic}`}`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[440px]">
            {headerStats.map((stat) => (
              <StatTile key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </header>

        {storageMessage ? (
          <div className="study-surface border-[var(--warning-soft)] bg-[var(--warning-soft)] px-4 py-3 text-sm text-[var(--warning-ink)]">
            {storageMessage}
          </div>
        ) : null}

        <nav className="study-surface soft-enter grid grid-cols-3 gap-2 p-2 sm:flex sm:w-fit">
          <ModeButton
            active={mode === "study"}
            label="Flashcards"
            onClick={() => setMode("study")}
          />
          <ModeButton
            active={mode === "read"}
            label="Reading guide"
            onClick={() => setMode("read")}
          />
          <ModeButton
            active={mode === "mock"}
            label="Mock interview"
            onClick={() => setMode("mock")}
          />
        </nav>

        <section className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="study-surface soft-enter h-fit p-4">
            {mode === "read" ? (
              <ReadingPathNav
                activeModuleId={activeReadingModule.id}
                modules={readingModules}
                onSelect={chooseReadingModule}
              />
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Deck</h2>
                  <button
                    className="focus-ring rounded-md border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--ink)] hover:text-[var(--ink)] active:scale-[0.98]"
                    type="button"
                    onClick={resetProgress}
                  >
                    Reset deck
                  </button>
                </div>

                <div className="mb-5 grid gap-2">
                  {interviewDecks.map((deck) => (
                    <TopicButton
                      key={deck.id}
                      active={selectedDeckId === deck.id}
                      label={deck.shortName}
                      meta={`${deck.cards.length} cards`}
                      onClick={() => chooseDeck(deck.id)}
                    />
                  ))}
                </div>

                <div className="mb-5 grid gap-2 border-t border-[var(--line)] pt-5">
                  <h3 className="text-sm font-semibold">Practice</h3>
                  <TopicButton
                    active={selectedLearningType === allLearningTypes}
                    label="All types"
                    meta={`${topicFilteredCards.length} cards`}
                    onClick={() => chooseLearningType(allLearningTypes)}
                  />
                  {learningTypes.map((learningType) => {
                    const cardsForType = filterCardsByLearningType(
                      topicFilteredCards,
                      learningType
                    );
                    const plan = getLearningPlan(learningType);

                    return (
                      <TopicButton
                        key={learningType}
                        active={selectedLearningType === learningType}
                        label={plan.shortLabel}
                        meta={`${cardsForType.length} cards`}
                        onClick={() => chooseLearningType(learningType)}
                      />
                    );
                  })}
                </div>

                <div className="grid gap-2 border-t border-[var(--line)] pt-5">
                  <TopicButton
                    active={selectedTopic === allTopics}
                    label="All topics"
                    meta={`${getCardsForSelection(activeDeck.cards, allTopics, selectedLearningType).length} cards`}
                    onClick={() => chooseTopic(allTopics)}
                  />
                  {activeDeck.topics.map((topic) => {
                    const cardsForTopic = getCardsForSelection(
                      activeDeck.cards,
                      topic,
                      selectedLearningType
                    );
                    const dueForTopic = getDueCards(cardsForTopic, progress, now).length;

                    return (
                      <TopicButton
                        key={topic}
                        active={selectedTopic === topic}
                        label={topic}
                        meta={`${dueForTopic} due of ${cardsForTopic.length}`}
                        onClick={() => chooseTopic(topic)}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </aside>

          <div className="flex min-w-0 flex-col gap-5">
            {mode === "read" ? (
              <>
                <AssessmentExportPanel
                  message={assessmentMessage}
                  onCopy={copyAssessmentReport}
                  report={assessmentReport}
                />
                <ReadMode readingModule={activeReadingModule} />
              </>
            ) : mode === "study" ? (
              <StudyMode
                answerVisible={answerVisible}
                card={currentCard}
                dueCount={dueCards.length}
                isReviewingDue={dueCards.length > 0}
                onRate={rateCurrentCard}
                onReveal={() => setAnswerVisible(true)}
                onSkip={skipCard}
                poolCount={studyPool.length}
                topic={selectedTopic}
              />
            ) : (
              <MockMode
                card={mockCard}
                finished={mockFinished}
                onFinish={finishMockAnswer}
                onNext={nextMockQuestion}
                onStart={startMockAnswer}
                running={mockRunning}
                seconds={mockSeconds}
                topic={selectedTopic}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3">
      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function TopicButton({
  active,
  label,
  meta,
  onClick
}: {
  active: boolean;
  label: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`focus-ring rounded-lg border px-3 py-3 text-left transition active:scale-[0.99] ${
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--accent)]"
      }`}
      type="button"
      onClick={onClick}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className="mt-1 block text-xs text-[var(--muted)]">{meta}</span>
    </button>
  );
}

function ModeButton({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`focus-ring rounded-md px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
        active
          ? "bg-[var(--ink)] text-white"
          : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
      }`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function ReadingPathNav({
  activeModuleId,
  modules,
  onSelect
}: {
  activeModuleId: string;
  modules: ReadingModule[];
  onSelect: (moduleId: string) => void;
}) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Reading path</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
          Factual sequence from fundamentals to booking system design.
        </p>
      </div>

      <div className="grid gap-2">
        {modules.map((readingModule) => (
          <TopicButton
            key={readingModule.id}
            active={activeModuleId === readingModule.id}
            label={readingModule.title}
            meta={`${readingModule.category} / ${readingModule.estimatedMinutes} min`}
            onClick={() => onSelect(readingModule.id)}
          />
        ))}
      </div>
    </div>
  );
}

function AssessmentExportPanel({
  message,
  onCopy,
  report
}: {
  message: string | null;
  onCopy: () => void;
  report: string;
}) {
  return (
    <section className="study-surface soft-enter overflow-hidden">
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
            Assessment export
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-tight tracking-[0]">
            Copy a leveling report for an LLM.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            The report uses local progress only: reviewed cards, weak topics, trade-off
            readiness, and a rubric for junior-to-mid-level assessment.
          </p>
        </div>

        <div className="grid gap-2">
          <button
            className="focus-ring rounded-md bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#303030] active:scale-[0.98]"
            type="button"
            onClick={onCopy}
          >
            Copy report
          </button>
          {message ? (
            <p className="text-xs font-semibold leading-5 text-[var(--muted)]">{message}</p>
          ) : null}
        </div>

        <textarea
          aria-label="LLM assessment export"
          className="min-h-40 resize-y rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3 font-mono text-xs leading-5 text-[var(--muted)] outline-none focus:border-[var(--accent)] lg:col-span-2"
          readOnly
          value={report}
        />
      </div>
    </section>
  );
}

function ReadMode({ readingModule }: { readingModule: ReadingModule }) {
  return (
    <section className="study-surface soft-enter overflow-hidden">
      <div className="border-b border-[var(--line)] bg-[var(--surface-muted)] px-4 py-4 sm:px-6">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
          {readingModule.category} / {readingModule.estimatedMinutes} minute read
        </p>
        <h2 className="mt-2 max-w-4xl text-2xl font-semibold leading-tight tracking-[0] sm:text-3xl">
          {readingModule.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {readingModule.summary}
        </p>
      </div>

      <article className="grid gap-7 p-4 sm:p-6">
        <section>
          <h3 className="text-base font-semibold">Core facts</h3>
          <dl className="mt-3 grid gap-0 border-y border-[var(--line)]">
            {readingModule.coreFacts.map((fact) => (
              <div
                key={fact.label}
                className="grid gap-2 border-t border-[var(--line)] py-4 first:border-t-0 sm:grid-cols-[180px_minmax(0,1fr)]"
              >
                <dt className="text-sm font-semibold text-[var(--ink)]">{fact.label}</dt>
                <dd className="text-sm leading-6 text-[var(--muted)]">{fact.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-y border-[var(--line)] bg-[var(--surface-muted)] px-4 py-5 sm:px-5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
            Interview line
          </p>
          <blockquote className="mt-2 max-w-4xl text-base font-semibold leading-7 text-[var(--ink)]">
            {readingModule.interviewLine}
          </blockquote>
        </section>

        <TradeoffLensSection readingModule={readingModule} />

        <section>
          <h3 className="text-base font-semibold">Guided examples</h3>
          <div className="mt-3 grid gap-6">
            {readingModule.guidedExamples.map((example) => (
              <section
                key={example.title}
                className="border-t border-[var(--line)] pt-5 first:border-t-0 first:pt-0"
              >
                <h4 className="text-lg font-semibold">{example.title}</h4>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                  {example.scenario}
                </p>
                <ol className="mt-4 grid gap-3">
                  {example.steps.map((step, index) => (
                    <li
                      key={step}
                      className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 text-sm leading-6 text-[var(--muted)]"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent-soft)] font-mono text-xs font-semibold text-[var(--accent)]">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                {example.code ? (
                  <pre className="mt-4 overflow-x-auto rounded-lg border border-[var(--line)] bg-[#171717] p-4 text-xs leading-5 text-white">
                    <code>{example.code}</code>
                  </pre>
                ) : null}
                <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-[var(--ink)]">
                  Takeaway: {example.takeaway}
                </p>
              </section>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold">Watch-outs</h3>
          <ul className="mt-3 grid gap-2 border-y border-[var(--line)] py-4">
            {readingModule.commonPitfalls.map((pitfall) => (
              <li key={pitfall} className="text-sm leading-6 text-[var(--muted)]">
                {pitfall}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </section>
  );
}

function TradeoffLensSection({ readingModule }: { readingModule: ReadingModule }) {
  const tradeoffLens = readingModule.tradeoffLens;

  return (
    <section className="border-y border-[var(--line)] px-4 py-5 sm:px-5">
      <div className="max-w-4xl">
        <h3 className="text-base font-semibold">Trade-off lens</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {tradeoffLens.prompt}
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <section className="rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-4">
          <h4 className="text-sm font-semibold text-[var(--ink)]">Junior answer</h4>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {tradeoffLens.juniorAnswer}
          </p>
        </section>

        <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <h4 className="text-sm font-semibold text-[var(--ink)]">Mid-level answer</h4>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {tradeoffLens.midLevelAnswer}
          </p>
        </section>
      </div>

      <div className="mt-4 border-t border-[var(--line)] pt-4">
        <h4 className="text-sm font-semibold text-[var(--ink)]">Name these criteria</h4>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {tradeoffLens.considerations.map((consideration) => (
            <li
              key={consideration}
              className="rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm leading-6 text-[var(--muted)]"
            >
              {consideration}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function StudyMode({
  answerVisible,
  card,
  dueCount,
  isReviewingDue,
  onRate,
  onReveal,
  onSkip,
  poolCount,
  topic
}: {
  answerVisible: boolean;
  card: Flashcard | null;
  dueCount: number;
  isReviewingDue: boolean;
  onRate: (rating: Rating) => void;
  onReveal: () => void;
  onSkip: () => void;
  poolCount: number;
  topic: TopicFilter;
}) {
  if (!card) {
    return <EmptyFocusState />;
  }

  const learningPlan = getLearningPlan(card);

  return (
    <section className="study-surface soft-enter overflow-hidden">
      <div className="border-b border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[var(--accent)]">{card.topic}</p>
              <span className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-xs font-semibold text-[var(--muted)]">
                {learningPlan.shortLabel}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              {isReviewingDue
                ? `${dueCount} due in ${topic === allTopics ? "all topics" : topic}`
                : `No due cards. Browsing ${poolCount} cards.`}
            </p>
          </div>
          <button
            className="focus-ring rounded-md border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--ink)] hover:text-[var(--ink)] active:scale-[0.98]"
            type="button"
            onClick={onSkip}
          >
            Skip
          </button>
        </div>
      </div>

      <article className="grid gap-5 p-4 sm:p-6">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            {learningPlan.label}
          </p>
          <h2 className="max-w-4xl text-2xl font-semibold leading-tight tracking-[0] sm:text-3xl">
            {card.question}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            {learningPlan.recallTarget}
          </p>
        </div>

        {answerVisible ? (
          <div className="grid gap-4">
            <AnswerBlock title="Answer shape" body={learningPlan.answerShape} />
            <AnswerBlock title="Answer" body={card.answer} />
            <AnswerBlock title="Example" body={card.example} />
            <AnswerBlock title="Say it in 60 seconds" body={card.prompt} />
            <AnswerBlock title="Rate yourself on this" body={learningPlan.ratingQuestion} />

            <div className="grid gap-2 border-t border-[var(--line)] pt-4 sm:grid-cols-4">
              {(["Again", "Hard", "Good", "Easy"] as Rating[]).map((rating) => (
                <button
                  key={rating}
                  className={`focus-ring rounded-md border px-3 py-3 text-sm font-semibold transition hover:brightness-[0.98] active:scale-[0.98] ${ratingStyles[rating]}`}
                  type="button"
                  onClick={() => onRate(rating)}
                >
                  <span className="block">{rating}</span>
                  <span className="mt-1 block text-xs font-medium opacity-80">
                    {ratingHint(rating)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-4 sm:p-5">
            <p className="mb-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Build the answer from memory using this shape: {learningPlan.answerShape}.
            </p>
            <button
              className="focus-ring rounded-md bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#303030] active:scale-[0.98]"
              type="button"
              onClick={onReveal}
            >
              Reveal answer
            </button>
          </div>
        )}
      </article>
    </section>
  );
}

function MockMode({
  card,
  finished,
  onFinish,
  onNext,
  onStart,
  running,
  seconds,
  topic
}: {
  card: Flashcard | null;
  finished: boolean;
  onFinish: () => void;
  onNext: () => void;
  onStart: () => void;
  running: boolean;
  seconds: number;
  topic: TopicFilter;
}) {
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, "0");

  if (!card) {
    return <EmptyFocusState />;
  }

  const learningPlan = getLearningPlan(card);

  return (
    <section className="study-surface soft-enter overflow-hidden">
      <div className="border-b border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[var(--accent)]">
                {topic === allTopics ? "Random prompt" : topic}
              </p>
              <span className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-xs font-semibold text-[var(--muted)]">
                {learningPlan.shortLabel}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              {learningPlan.recallTarget}
            </p>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-4 py-2 font-mono text-2xl font-semibold tabular-nums">
            {minutes}:{remainder}
          </div>
        </div>
      </div>

      <article className="grid gap-5 p-4 sm:p-6">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            {learningPlan.label}
          </p>
          <h2 className="max-w-4xl text-2xl font-semibold leading-tight tracking-[0] sm:text-3xl">
            {card.question}
          </h2>
        </div>

        <div className="grid gap-2 sm:flex">
          {!running && !finished ? (
            <button
              className="focus-ring rounded-md bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#303030] active:scale-[0.98]"
              type="button"
              onClick={onStart}
            >
              Start timer
            </button>
          ) : null}
          {running ? (
            <button
              className="focus-ring rounded-md bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#303030] active:scale-[0.98]"
              type="button"
              onClick={onFinish}
            >
              Finish answer
            </button>
          ) : null}
          <button
            className="focus-ring rounded-md border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--ink)] hover:text-[var(--ink)] active:scale-[0.98]"
            type="button"
            onClick={onNext}
          >
            Next random
          </button>
        </div>

        {finished ? (
          <div className="grid gap-4">
            <AnswerBlock title="Answer shape" body={learningPlan.answerShape} />
            <AnswerBlock title="Answer" body={card.answer} />
            <AnswerBlock title="Example" body={card.example} />
            <AnswerBlock title="60 second shape" body={card.prompt} />
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-4 text-sm leading-6 text-[var(--muted)]">
            Talk through this shape before revealing anything: {learningPlan.answerShape}.
          </div>
        )}
      </article>
    </section>
  );
}

function EmptyFocusState() {
  return (
    <section className="study-surface soft-enter p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
        No matching cards
      </p>
      <h2 className="mt-2 text-2xl font-semibold">Try a broader practice filter.</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Some topics are mostly facts, while others are mostly scenarios or stories.
      </p>
    </section>
  );
}

function AnswerBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      <h3 className="mb-2 text-sm font-semibold text-[var(--ink)]">{title}</h3>
      <p className="text-sm leading-6 text-[var(--muted)]">{body}</p>
    </section>
  );
}

function ratingHint(rating: Rating): string {
  switch (rating) {
    case "Again":
      return "due now";
    case "Hard":
      return "10 minutes";
    case "Good":
      return "tomorrow";
    case "Easy":
      return "2 days";
  }
}
