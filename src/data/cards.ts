import bookingPlatformExtendedSource from "./booking-platform-extended-source.json";

export const topics = [
  "Django",
  "Postgres",
  "Performance",
  "Testing",
  "System Design",
  "AWS/Infra",
  "Behavioral"
] as const;

export const bookingPlatformExtendedTopics = [
  "Django ORM",
  "select_related vs prefetch_related",
  "N+1 Queries",
  "Postgres Indexes",
  "Transactions",
  "Race Conditions",
  "Row Locking",
  "Booking System Design",
  "Testing Strategy",
  "Angular Basics",
  "AWS EC2",
  "AWS ECS",
  "AWS Lambda",
  "AWS S3",
  "AWS RDS",
  "AWS Basics",
  "Terraform",
  "Behavioral Stories"
] as const;

export const deliveryPlatformTopics = [
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
] as const;

export type BookingPlatformTopic = (typeof topics)[number];
export type BookingPlatformExtendedTopic = (typeof bookingPlatformExtendedTopics)[number];
export type DeliveryPlatformTopic = (typeof deliveryPlatformTopics)[number];
export type Topic = BookingPlatformTopic | BookingPlatformExtendedTopic | DeliveryPlatformTopic;

export type Flashcard = {
  id: string;
  topic: Topic;
  question: string;
  answer: string;
  example: string;
  prompt: string;
};

type BookingPlatformExtendedSourceCard = {
  topic: BookingPlatformExtendedTopic;
  question: string;
  answer: string;
  example: string;
  interviewPrompt: string;
};

export const flashcards: Flashcard[] = [
  {
    id: "django-request-lifecycle",
    topic: "Django",
    question: "Walk through what happens when a Django request hits a view.",
    answer:
      "A request flows through URL routing, middleware, the view, template or serializer rendering, and response middleware before it returns to the client.",
    example:
      "For a booking details page, auth middleware verifies the user, the URL resolver picks the view, the view loads the booking, then returns HTML or JSON.",
    prompt:
      "Explain the lifecycle in 60 seconds and name where you would add auth, logging, and error handling."
  },
  {
    id: "django-orm-select-related",
    topic: "Django",
    question: "When would you use select_related versus prefetch_related in Django?",
    answer:
      "Use select_related for single-valued foreign keys and one-to-one joins. Use prefetch_related for many-to-many or reverse relations that need separate queries.",
    example:
      "A tour booking can select_related the customer profile, but prefetch_related purchased add-ons or attendees.",
    prompt:
      "Give a crisp N+1 example and show how each method changes query count."
  },
  {
    id: "django-transactions-atomic",
    topic: "Django",
    question: "How does transaction.atomic help protect booking workflows?",
    answer:
      "transaction.atomic wraps related writes so they commit together or roll back together when an exception occurs.",
    example:
      "Creating a reservation, decrementing remaining capacity, and writing a payment intent should not partially succeed.",
    prompt:
      "Explain what can go wrong without atomic writes and how you would test rollback behavior."
  },
  {
    id: "django-querysets-lazy",
    topic: "Django",
    question: "What does it mean that Django QuerySets are lazy?",
    answer:
      "A QuerySet builds SQL but usually does not hit the database until it is evaluated by iteration, slicing, len, list, bool, or similar operations.",
    example:
      "You can keep chaining filters for upcoming tours, but rendering the results in a template triggers the query.",
    prompt:
      "Describe laziness, why it helps composition, and one common surprise in production."
  },
  {
    id: "django-migrations",
    topic: "Django",
    question: "What makes a Django migration safe for a production database?",
    answer:
      "A safe migration accounts for existing rows, avoids long locks when possible, separates schema and data changes, and has a rollback plan.",
    example:
      "Add a nullable booking_source column, backfill in batches, then enforce non-null after the app writes the value.",
    prompt:
      "Outline a safe rollout for adding a required column to a large table."
  },
  {
    id: "django-validation-forms-serializers",
    topic: "Django",
    question: "Where should validation live in a Django full-stack feature?",
    answer:
      "Validation belongs at boundaries first, such as forms, serializers, or view input parsing, with domain invariants enforced close to the model or service layer.",
    example:
      "Validate requested guest count in the API payload, then enforce capacity inside the booking service before writing.",
    prompt:
      "Explain the difference between request validation and business invariant checks."
  },
  {
    id: "django-auth-permissions",
    topic: "Django",
    question: "How would you check authorization for an operator editing a tour?",
    answer:
      "Authenticate the user, load the target resource, then verify ownership, role, or permission before returning or mutating data.",
    example:
      "A vendor employee can edit tours for their company but not for another supplier in the marketplace.",
    prompt:
      "Say where the check belongs and how you would avoid object-level auth bugs."
  },
  {
    id: "django-celery-background-jobs",
    topic: "Django",
    question: "When should work move from a Django request to a background job?",
    answer:
      "Move slow, retryable, or external side-effect work out of the request path when the user does not need the result synchronously.",
    example:
      "Send confirmation emails, sync channel manager inventory, or generate reports after the booking response returns.",
    prompt:
      "Explain the tradeoff between user latency, retry safety, and idempotency for background jobs."
  },
  {
    id: "postgres-index-selectivity",
    topic: "Postgres",
    question: "What makes a Postgres index useful for a query?",
    answer:
      "An index helps when it matches the query predicate or sort and filters enough rows to beat a sequential scan plus overhead.",
    example:
      "An index on tour_id and starts_at can speed up loading future availabilities for one tour.",
    prompt:
      "Define selectivity and describe how you would choose a composite index."
  },
  {
    id: "postgres-explain-analyze",
    topic: "Postgres",
    question: "How do you use EXPLAIN ANALYZE to debug a slow query?",
    answer:
      "EXPLAIN ANALYZE runs the query and reports the actual plan, timing, row counts, loops, and where estimates differ from reality.",
    example:
      "If estimated rows are 10 but actual rows are 100000, stale stats or a weak predicate may explain a bad plan.",
    prompt:
      "Walk through plan nodes, actual versus estimated rows, and one fix you might try."
  },
  {
    id: "postgres-transactions-isolation",
    topic: "Postgres",
    question: "What transaction isolation issue matters for limited inventory bookings?",
    answer:
      "Concurrent transactions can read the same remaining capacity unless the design uses constraints, locks, or serializable logic to prevent oversell.",
    example:
      "Two users both see one seat left and both submit payment unless the capacity update is guarded atomically.",
    prompt:
      "Explain read committed, row locks, and a safe capacity decrement pattern."
  },
  {
    id: "postgres-jsonb-tradeoffs",
    topic: "Postgres",
    question: "When is JSONB a good fit, and when is it a bad fit?",
    answer:
      "JSONB is useful for flexible attributes, but relational columns are better for strongly typed, frequently queried, constrained data.",
    example:
      "Store supplier-specific metadata in JSONB, but keep booking status, price, and starts_at as typed columns.",
    prompt:
      "Give one JSONB use case, one drawback, and how indexing changes the decision."
  },
  {
    id: "postgres-locking-deadlocks",
    topic: "Postgres",
    question: "How can deadlocks happen in Postgres, and how do you reduce them?",
    answer:
      "Deadlocks happen when transactions acquire locks in conflicting orders. Reduce them with consistent lock ordering, short transactions, and targeted retries.",
    example:
      "If one job locks booking then availability while another locks availability then booking, each can wait on the other.",
    prompt:
      "Explain a deadlock simply and name two practical prevention techniques."
  },
  {
    id: "postgres-normalization",
    topic: "Postgres",
    question: "Why normalize booking data instead of storing everything in one table?",
    answer:
      "Normalization reduces duplication, protects consistency, and makes constraints clearer, while denormalization can be added for read performance when justified.",
    example:
      "Customers, bookings, payments, and availabilities should have separate lifecycles and constraints.",
    prompt:
      "Explain normalized design first, then when you would denormalize for speed."
  },
  {
    id: "postgres-migrations-zero-downtime",
    topic: "Postgres",
    question: "What is the expand and contract pattern for database changes?",
    answer:
      "Expand by adding backward-compatible schema, deploy code that reads and writes both shapes, backfill, then contract by removing old schema later.",
    example:
      "Add booking_total_cents while still reading legacy amount, backfill, switch reads, then drop amount.",
    prompt:
      "Describe expand, migrate, contract in a way that shows rollout safety."
  },
  {
    id: "performance-n-plus-one",
    topic: "Performance",
    question: "How do you identify and fix an N+1 query in a web app?",
    answer:
      "Look for one query to load a list followed by one query per row, then batch, join, prefetch, or reshape the data access.",
    example:
      "Loading 50 bookings and then querying each customer separately can become 51 queries instead of 2.",
    prompt:
      "Give a diagnosis path using logs or query counters, then name the fix."
  },
  {
    id: "performance-caching-layers",
    topic: "Performance",
    question: "What caching layers might help a booking platform?",
    answer:
      "Useful layers include browser cache, CDN cache, application cache, database query cache patterns, and precomputed views, each with invalidation tradeoffs.",
    example:
      "Public tour descriptions can cache at the CDN, but live availability needs short TTLs or event-driven invalidation.",
    prompt:
      "Explain cache choice by data volatility and what can go stale."
  },
  {
    id: "performance-pagination",
    topic: "Performance",
    question: "Why can offset pagination become slow, and what is the alternative?",
    answer:
      "Large offsets force the database to scan and discard rows. Cursor pagination uses a stable sort key to continue from the last seen row.",
    example:
      "For booking history, use created_at and id as a cursor instead of OFFSET 50000.",
    prompt:
      "Compare offset and cursor pagination for a large vendor bookings table."
  },
  {
    id: "performance-bundle-size",
    topic: "Performance",
    question: "How would you reduce frontend bundle size in a Next.js app?",
    answer:
      "Measure the bundle, remove heavy dependencies, split client components, lazy-load non-critical UI, and keep server-only code out of client bundles.",
    example:
      "A calendar library for admin scheduling can load only on the scheduling route, not on the public tour page.",
    prompt:
      "Explain measurement first, then list three concrete bundle reduction moves."
  },
  {
    id: "performance-db-pooling",
    topic: "Performance",
    question: "Why does database connection pooling matter?",
    answer:
      "Pooling reuses connections and protects the database from too many concurrent clients, which reduces overhead and prevents connection exhaustion.",
    example:
      "A traffic spike on checkout should queue or reuse connections rather than opening hundreds of new Postgres sessions.",
    prompt:
      "Explain pool size, saturation symptoms, and one operational metric to watch."
  },
  {
    id: "performance-observability",
    topic: "Performance",
    question: "What signals would you inspect for a slow booking checkout?",
    answer:
      "Check request latency, database timing, external payment calls, error rates, queue depth, and traces that show where time is spent.",
    example:
      "If checkout latency jumps only when payment calls slow down, app and database tuning may not fix the root cause.",
    prompt:
      "Describe logs, metrics, and traces in a practical incident debugging sequence."
  },
  {
    id: "performance-backpressure",
    topic: "Performance",
    question: "What is backpressure, and why does it matter under load?",
    answer:
      "Backpressure is a system's way of slowing intake when downstream work cannot keep up, preventing collapse from unbounded queues or resource exhaustion.",
    example:
      "If webhook processing lags, limit ingestion, queue safely, and return retryable responses instead of dropping events silently.",
    prompt:
      "Explain how a healthy system says slow down without losing important work."
  },
  {
    id: "testing-unit-vs-integration",
    topic: "Testing",
    question: "How do you decide between a unit test and an integration test?",
    answer:
      "Use unit tests for pure logic and edge cases. Use integration tests when correctness depends on framework wiring, database behavior, or multiple modules together.",
    example:
      "Test price calculation as a unit, but test booking creation with the Django view, service, and database together.",
    prompt:
      "Explain the testing pyramid without sounding dogmatic."
  },
  {
    id: "testing-django-pytest",
    topic: "Testing",
    question: "What should a good pytest-django test verify for a booking endpoint?",
    answer:
      "It should verify status code, response shape, database side effects, permissions, and relevant edge cases with realistic fixtures.",
    example:
      "Posting a booking with too many guests should return validation errors and leave availability unchanged.",
    prompt:
      "Name the assertions that prove behavior rather than implementation details."
  },
  {
    id: "testing-factories-fixtures",
    topic: "Testing",
    question: "Why use factories instead of large shared fixtures?",
    answer:
      "Factories create only the data a test needs, making setup clearer and reducing hidden coupling between tests.",
    example:
      "A booking factory can create a vendor, tour, availability, and customer with explicit overrides for one scenario.",
    prompt:
      "Explain how factories improve readability and isolation."
  },
  {
    id: "testing-mocking-boundaries",
    topic: "Testing",
    question: "What should you mock in a full-stack test suite?",
    answer:
      "Mock slow, flaky, or external systems at clear boundaries. Avoid mocking your own core logic so tests still catch integration bugs.",
    example:
      "Mock a payment provider response, but use the real booking service and database transaction in the test.",
    prompt:
      "Give one good mock and one over-mock that would hide a bug."
  },
  {
    id: "testing-e2e-critical-paths",
    topic: "Testing",
    question: "Which flows deserve end-to-end tests?",
    answer:
      "E2E tests should cover critical user journeys that can break through wiring issues, not every small UI branch.",
    example:
      "A public user books a tour and a vendor sees it in their manifest is a critical path.",
    prompt:
      "Pick two booking-platform E2E flows and justify why they are worth the cost."
  },
  {
    id: "testing-regression-repro",
    topic: "Testing",
    question: "What does it mean to write a regression test for a bug?",
    answer:
      "A regression test reproduces the bug first, fails for the right reason, and then passes only when the behavior is fixed.",
    example:
      "If refunds double-count taxes, write a failing test with the exact tax scenario before changing refund logic.",
    prompt:
      "Describe red, green, and why the test must fail for the intended reason."
  },
  {
    id: "testing-flaky-tests",
    topic: "Testing",
    question: "How do you approach a flaky test?",
    answer:
      "First reproduce and classify the flake, then remove timing assumptions, isolate shared state, control randomness, or improve test boundaries.",
    example:
      "A calendar test that waits 500 ms for availability should wait for the visible result or network completion instead.",
    prompt:
      "Explain why ignoring flaky tests damages trust in the suite."
  },
  {
    id: "system-design-booking-flow",
    topic: "System Design",
    question: "Design the high-level flow for creating a booking online.",
    answer:
      "A safe flow validates request data, checks inventory, reserves capacity atomically, creates payment intent, confirms payment, and records final booking state.",
    example:
      "Hold a seat briefly while payment completes, then release the hold if payment fails or expires.",
    prompt:
      "Talk through the flow, state transitions, and failure points in 60 seconds."
  },
  {
    id: "system-design-inventory-consistency",
    topic: "System Design",
    question: "How would you prevent overselling limited tour capacity?",
    answer:
      "Use a database-backed invariant such as conditional updates, row locks, constraints, or serializable transactions around capacity changes.",
    example:
      "UPDATE availability SET remaining = remaining - 1 WHERE id = ? AND remaining >= 1 can be checked by affected row count.",
    prompt:
      "Explain the consistency guarantee and what happens under concurrent checkout."
  },
  {
    id: "system-design-idempotency",
    topic: "System Design",
    question: "Why do booking and payment APIs need idempotency?",
    answer:
      "Clients and providers retry after timeouts. Idempotency ensures the same operation key does not create duplicate bookings or charges.",
    example:
      "A checkout request with idempotency key abc returns the original booking if the client retries after a network timeout.",
    prompt:
      "Define idempotency and apply it to payment confirmation and webhook handling."
  },
  {
    id: "system-design-availability",
    topic: "System Design",
    question: "How would you design for high availability in a booking product?",
    answer:
      "Separate critical write paths from read-heavy paths, use health checks, redundancy, graceful degradation, and clear recovery for dependencies.",
    example:
      "Public tour pages can stay cached if recommendations fail, but checkout must fail clearly if inventory cannot be verified.",
    prompt:
      "Name what can degrade and what must remain strongly correct."
  },
  {
    id: "system-design-search-filtering",
    topic: "System Design",
    question: "How would you design search and filtering for tours?",
    answer:
      "Model structured filters in the database, use a search index for text relevance if needed, and keep indexing updates observable and retryable.",
    example:
      "Filter by location, date, and category in SQL, then use a search service for fuzzy text over titles and descriptions.",
    prompt:
      "Explain when Postgres is enough and when a dedicated search system is worth it."
  },
  {
    id: "system-design-webhooks",
    topic: "System Design",
    question: "What makes a webhook consumer reliable?",
    answer:
      "It verifies signatures, stores events durably, handles duplicates idempotently, retries safely, and exposes monitoring for failures.",
    example:
      "A payment succeeded webhook should not double-confirm a booking if the provider sends the event twice.",
    prompt:
      "Give a webhook checklist: auth, durability, idempotency, retries, and observability."
  },
  {
    id: "system-design-api-versioning",
    topic: "System Design",
    question: "How would you evolve an API without breaking clients?",
    answer:
      "Prefer additive changes, document response contracts, version breaking changes, and monitor client usage before removing old behavior.",
    example:
      "Add cancellation_policy as an optional field before requiring clients to send or display it.",
    prompt:
      "Explain additive change, breaking change, and a deprecation plan."
  },
  {
    id: "system-design-rate-limits",
    topic: "System Design",
    question: "Why use rate limits, and how would you design them fairly?",
    answer:
      "Rate limits protect reliability and abuse boundaries. Design by identity, endpoint cost, burst allowance, and clear retry responses.",
    example:
      "A public availability endpoint might allow short bursts but cap repeated scraping by IP or API key.",
    prompt:
      "Explain token bucket or leaky bucket in practical terms."
  },
  {
    id: "aws-load-balancing",
    topic: "AWS/Infra",
    question: "What role does a load balancer play in a web application?",
    answer:
      "A load balancer distributes traffic across healthy application instances, terminates TLS in many setups, and removes unhealthy targets.",
    example:
      "An AWS Application Load Balancer routes HTTPS requests to ECS tasks running the Django app.",
    prompt:
      "Explain health checks, TLS termination, and why sticky sessions are usually a tradeoff."
  },
  {
    id: "aws-rds-postgres",
    topic: "AWS/Infra",
    question: "What operational concerns matter for Postgres on RDS?",
    answer:
      "Backups, maintenance windows, parameter tuning, connection limits, read replicas, monitoring, storage growth, and failover behavior all matter.",
    example:
      "A booking database needs point-in-time recovery and alerts before storage or connection exhaustion causes an outage.",
    prompt:
      "List the RDS basics you would check before a launch."
  },
  {
    id: "aws-ecs-containers",
    topic: "AWS/Infra",
    question: "How do containers help deploy a Django or Next.js service?",
    answer:
      "Containers package runtime dependencies consistently, making local, CI, and production environments closer and deployment rollbacks simpler.",
    example:
      "Build one image for the Django app, run migrations as a separate task, then roll ECS service tasks forward.",
    prompt:
      "Explain image, task, service, and one deployment risk."
  },
  {
    id: "aws-s3-static-assets",
    topic: "AWS/Infra",
    question: "Why serve static assets from S3 and a CDN?",
    answer:
      "Object storage plus CDN reduces app server load, improves global latency, and gives cache controls for versioned static files.",
    example:
      "Vendor photos and compiled frontend assets can be stored in S3 and cached at CloudFront edges.",
    prompt:
      "Explain cache headers, invalidation, and why user uploads need access controls."
  },
  {
    id: "aws-cloudwatch-alerts",
    topic: "AWS/Infra",
    question: "What alerts would you want for a full-stack booking system?",
    answer:
      "Alert on user-impacting symptoms first: error rate, latency, failed payments, queue backlog, database saturation, and low inventory sync success.",
    example:
      "A CPU alert is useful, but a spike in 500s on checkout is more directly tied to customer pain.",
    prompt:
      "Separate symptom alerts from cause alerts in a concise answer."
  },
  {
    id: "aws-deploy-rollbacks",
    topic: "AWS/Infra",
    question: "What makes a deployment rollback safe?",
    answer:
      "A safe rollback keeps old and new code compatible with the database, preserves config, and has a tested path to restore the last healthy version.",
    example:
      "A code rollback is risky if the migration dropped a column the old code still reads.",
    prompt:
      "Explain app rollback, migration compatibility, and verification after rollback."
  },
  {
    id: "behavioral-ownership",
    topic: "Behavioral",
    question: "Tell me about a time you owned a problem end to end.",
    answer:
      "Use a specific story with context, your responsibility, actions, tradeoffs, measurable result, and what you learned.",
    example:
      "Frame a bug or feature where you clarified scope, coordinated with others, shipped, monitored, and followed up.",
    prompt:
      "Answer with situation, task, action, result, and reflection in under 60 seconds."
  },
  {
    id: "behavioral-conflict",
    topic: "Behavioral",
    question: "Tell me about a technical disagreement with a teammate.",
    answer:
      "Show that you listened, identified shared goals, used evidence, made a decision, and preserved the working relationship.",
    example:
      "You preferred a simpler migration plan while another engineer wanted a larger rewrite. Data and risk guided the final choice.",
    prompt:
      "Emphasize collaboration, evidence, and how the team moved forward."
  },
  {
    id: "behavioral-ambiguity",
    topic: "Behavioral",
    question: "How do you handle an ambiguous project requirement?",
    answer:
      "Clarify the user problem, identify assumptions, define a small decision point, propose a path, and validate quickly with stakeholders.",
    example:
      "For a new vendor reporting view, start with the decisions operators need before choosing charts or tables.",
    prompt:
      "Give a concrete example where you reduced ambiguity without stalling."
  },
  {
    id: "behavioral-incident",
    topic: "Behavioral",
    question: "Tell me about a production incident or urgent bug.",
    answer:
      "Describe the impact, triage steps, communication, mitigation, root cause, and follow-up prevention work.",
    example:
      "A checkout failure started after deploy, so you rolled back, checked traces, patched the bug, and added a regression test.",
    prompt:
      "Keep the answer calm: impact, action, learning, prevention."
  },
  {
    id: "behavioral-tradeoff",
    topic: "Behavioral",
    question: "Tell me about a tradeoff you made between speed and quality.",
    answer:
      "Show that you protected the core risk while intentionally deferring lower-risk polish with a follow-up plan.",
    example:
      "You shipped a narrow validation fix before a deadline and scheduled the broader refactor after tests captured the bug.",
    prompt:
      "Make clear what you did not compromise and why."
  },
  {
    id: "behavioral-learning",
    topic: "Behavioral",
    question: "Tell me about a time you had to learn something quickly.",
    answer:
      "Use an example where you identified the minimum concepts, practiced on a real task, asked targeted questions, and delivered.",
    example:
      "Learning enough AWS deployment flow to debug a failing service health check and document the fix.",
    prompt:
      "Show method, humility, and outcome without pretending you knew everything."
  },
  {
    id: "behavioral-customer-empathy",
    topic: "Behavioral",
    question: "How do you keep customer impact in mind when building?",
    answer:
      "Connect technical decisions to user outcomes, support costs, reliability, accessibility, and clear communication.",
    example:
      "For vendors, a slow manifest page is not abstract latency. It can slow check-in for a tour about to depart.",
    prompt:
      "Tie engineering quality to a concrete operator or traveler experience."
  }
];

export const deliveryPlatformFlashcards: Flashcard[] = [
  {
    id: "delivery-platform-http-methods",
    topic: "HTTP/REST",
    question: "How do GET, POST, PUT, PATCH, and DELETE differ in a REST API?",
    answer:
      "GET reads, POST creates or triggers a non-idempotent operation, PUT replaces a resource, PATCH partially updates it, and DELETE removes it.",
    example:
      "GET /orders/123 reads an order, POST /orders creates one, PATCH /orders/123/status updates the state, and DELETE may cancel a draft resource.",
    prompt:
      "Explain each method with one order API example and call out idempotency."
  },
  {
    id: "delivery-platform-http-status-codes",
    topic: "HTTP/REST",
    question: "Which HTTP status codes should you know cold for backend interviews?",
    answer:
      "Know 200 success, 201 created, 400 bad request, 401 unauthenticated, 403 unauthorized, 404 missing, 409 conflict, 429 rate limited, and 500 server error.",
    example:
      "Duplicate idempotency key with different payload should be 409, while too many checkout retries should be 429.",
    prompt:
      "Give a one-sentence meaning and an order-system example for each important code."
  },
  {
    id: "delivery-platform-http-idempotency",
    topic: "HTTP/REST",
    question: "How would you prevent duplicate orders when a client retries POST /orders?",
    answer:
      "Require an idempotency key, store the request fingerprint and result, and return the original result when the same key is retried.",
    example:
      "If the mobile app times out after payment authorization, retrying with key abc should return the same order instead of creating another.",
    prompt:
      "Define idempotency, describe the storage table, and explain conflict handling."
  },
  {
    id: "delivery-platform-http-pagination-rate-limits",
    topic: "HTTP/REST",
    question: "How do pagination and rate limiting protect a large REST API?",
    answer:
      "Pagination bounds response and query cost, while rate limiting bounds request volume by identity, endpoint cost, and burst allowance.",
    example:
      "Merchant order history can use cursor pagination, and public menu reads can use Redis-backed token buckets per client.",
    prompt:
      "Compare offset and cursor pagination, then describe one fair rate limit design."
  },
  {
    id: "delivery-platform-http-auth-versioning",
    topic: "HTTP/REST",
    question: "What is the difference between authentication, authorization, and API versioning?",
    answer:
      "Authentication proves who the caller is, authorization decides what they may access, and versioning lets API contracts evolve safely.",
    example:
      "A merchant is authenticated by token, authorized only for their store, and served a stable v1 orders response contract.",
    prompt:
      "Explain the three concepts using a consumer, merchant, and driver API example."
  },
  {
    id: "delivery-platform-db-indexes",
    topic: "Databases",
    question: "What makes a Postgres index useful for a delivery-platform-style backend?",
    answer:
      "An index helps when it matches a common filter, join, or sort pattern and narrows the scanned rows enough to beat its write and storage cost.",
    example:
      "An index on merchant_id and created_at helps fetch a merchant's recent orders in descending time order.",
    prompt:
      "Explain selectivity, composite index order, and how EXPLAIN ANALYZE proves value."
  },
  {
    id: "delivery-platform-db-transactions-races",
    topic: "Databases",
    question: "How do transactions, isolation levels, row locks, and unique constraints prevent race bugs?",
    answer:
      "Transactions group changes, isolation controls concurrent visibility, row locks serialize critical updates, and unique constraints enforce invariants at the database.",
    example:
      "Order creation can lock a payment attempt row and use a unique constraint on idempotency_key to prevent duplicate orders.",
    prompt:
      "Describe one race condition and the database-backed invariant that prevents it."
  },
  {
    id: "delivery-platform-db-pooling-replicas",
    topic: "Databases",
    question: "Why do connection pooling and read replicas matter at high scale?",
    answer:
      "Pooling protects the database from excessive client connections, and read replicas can move read-heavy traffic off the primary with replication lag tradeoffs.",
    example:
      "A menu browsing endpoint might read from replicas, while checkout writes must hit the primary for correct order state.",
    prompt:
      "Explain pool saturation, replica lag, and which endpoints must avoid stale reads."
  },
  {
    id: "delivery-platform-db-sharding",
    topic: "Databases",
    question: "What is sharding, and when would you consider it?",
    answer:
      "Sharding partitions data across database nodes by a key when one primary cannot handle data volume, write load, or operational limits.",
    example:
      "Orders could be partitioned by region or merchant, but cross-shard reporting and rebalancing become harder.",
    prompt:
      "Give the high-level reason to shard and two costs that make it a late move."
  },
  {
    id: "delivery-platform-db-denormalization",
    topic: "Databases",
    question: "When would you denormalize data in a backend system?",
    answer:
      "Denormalize when a read path is important enough to justify duplicated data, extra write complexity, and consistency repair mechanisms.",
    example:
      "Store a snapshot of merchant name and menu item price on an order so historical receipts remain fast and accurate.",
    prompt:
      "Explain the tradeoff between read speed, write complexity, and stale duplicated data."
  },
  {
    id: "delivery-platform-redis-cache-aside",
    topic: "Redis/Caching",
    question: "How does the cache-aside pattern work?",
    answer:
      "The app checks cache first, reads from the database on miss, writes the result back with a TTL, and invalidates or expires when data changes.",
    example:
      "Menu detail reads can check Redis first, load from Postgres on miss, then cache the menu document for a short TTL.",
    prompt:
      "Walk through cache hit, cache miss, write path, and invalidation."
  },
  {
    id: "delivery-platform-redis-ttls-invalidation",
    topic: "Redis/Caching",
    question: "What can go wrong with TTLs and cache invalidation?",
    answer:
      "Long TTLs can serve stale data, short TTLs can reduce cache value, and missed invalidations can make users see incorrect state.",
    example:
      "A merchant changes an item to unavailable, but cached menus continue showing it unless invalidated or expired quickly.",
    prompt:
      "Explain why cache invalidation is hard and how to choose TTLs by data volatility."
  },
  {
    id: "delivery-platform-redis-hot-keys-stampede",
    topic: "Redis/Caching",
    question: "What are hot keys and cache stampedes?",
    answer:
      "A hot key receives disproportionate traffic, while a stampede happens when many clients rebuild an expired cache value at once.",
    example:
      "A popular restaurant on a Friday night can create a hot menu key, and expiration can stampede Postgres with rebuilds.",
    prompt:
      "Name mitigation strategies like jitter, request coalescing, stale while revalidate, and sharding hot keys."
  },
  {
    id: "delivery-platform-redis-rate-limiting",
    topic: "Redis/Caching",
    question: "How would you implement rate limiting with Redis?",
    answer:
      "Use Redis counters, sorted sets, or token buckets keyed by caller and endpoint, with atomic increments and expirations.",
    example:
      "Limit unauthenticated menu search by IP and authenticated order creation by account to prevent abuse and retry storms.",
    prompt:
      "Describe a token bucket and what response metadata you would return with 429."
  },
  {
    id: "delivery-platform-redis-sessions-state",
    topic: "Redis/Caching",
    question: "When is Redis a good fit for sessions or ephemeral state?",
    answer:
      "Redis is useful for short-lived, fast, shared state that can expire, but critical data still needs durable storage or recovery logic.",
    example:
      "A checkout draft or driver location heartbeat can live briefly in Redis, while the confirmed order belongs in the database.",
    prompt:
      "Explain the difference between ephemeral state and durable source of truth."
  },
  {
    id: "delivery-platform-queues-why",
    topic: "Queues",
    question: "Why do queues exist in backend systems?",
    answer:
      "Queues decouple producers from consumers, smooth traffic spikes, enable retries, and move slow work out of user-facing request paths.",
    example:
      "After order creation, enqueue receipt email, merchant tablet notification, and analytics events without blocking checkout.",
    prompt:
      "Explain producer, queue, consumer, and why this improves reliability."
  },
  {
    id: "delivery-platform-queues-tech-differences",
    topic: "Queues",
    question: "How do RabbitMQ, SQS, and Kafka differ at a high level?",
    answer:
      "RabbitMQ is a broker for routed work queues, SQS is managed cloud queuing, and Kafka is a durable event log optimized for streams and replay.",
    example:
      "Use SQS for background jobs, RabbitMQ for complex routing, and Kafka for order events consumed by many services.",
    prompt:
      "Give the simple mental model for each without overclaiming exactly-once delivery."
  },
  {
    id: "delivery-platform-queues-retries-dlq",
    topic: "Queues",
    question: "How should retries and dead letter queues work?",
    answer:
      "Retry transient failures with backoff and limits, then move poison messages to a dead letter queue for inspection and repair.",
    example:
      "If a notification provider is down, retry with exponential backoff, but DLQ malformed payloads that will never succeed.",
    prompt:
      "Differentiate transient failures from poison messages and explain what operators inspect."
  },
  {
    id: "delivery-platform-queues-at-least-once",
    topic: "Queues",
    question: "What does at-least-once delivery mean?",
    answer:
      "The message will be delivered one or more times, so consumers must expect duplicates and handle them safely.",
    example:
      "A payment_succeeded event may be processed twice if the worker crashes after side effects but before acking.",
    prompt:
      "Explain why duplicates happen and how idempotency makes them safe."
  },
  {
    id: "delivery-platform-queues-idempotent-consumers",
    topic: "Queues",
    question: "How do you make a queue consumer idempotent?",
    answer:
      "Use stable event IDs, dedupe records, unique constraints, state checks, and side effects that can be safely repeated or skipped.",
    example:
      "Before sending a refund email, check whether event_id has already been processed or whether the refund state is already applied.",
    prompt:
      "Describe a consumer algorithm that handles duplicate messages and worker crashes."
  },
  {
    id: "delivery-platform-dist-cap",
    topic: "Distributed Systems",
    question: "How do you explain consistency versus availability in practical backend terms?",
    answer:
      "Consistency means users see correct, up-to-date state, while availability means the system responds even when some dependencies fail.",
    example:
      "Checkout should prefer consistency for payment and order state, but menu recommendations can degrade or serve stale data.",
    prompt:
      "Give one delivery flow that needs correctness and one that can tolerate staleness."
  },
  {
    id: "delivery-platform-dist-eventual-consistency",
    topic: "Distributed Systems",
    question: "What is eventual consistency, and where might it appear?",
    answer:
      "Eventual consistency means replicas or derived stores converge after a delay, so reads may temporarily lag behind writes.",
    example:
      "A search index may show an old menu item for a short time after Postgres has been updated.",
    prompt:
      "Explain how to communicate and monitor lag rather than pretending every read is immediate."
  },
  {
    id: "delivery-platform-dist-timeouts-backoff",
    topic: "Distributed Systems",
    question: "Why do timeouts and exponential backoff matter?",
    answer:
      "Timeouts stop callers from waiting forever, and exponential backoff prevents retries from amplifying load on a struggling dependency.",
    example:
      "If payment service latency spikes, clients should timeout, retry with jitter, and avoid creating a retry storm.",
    prompt:
      "Describe a retry policy with max attempts, jitter, and idempotency."
  },
  {
    id: "delivery-platform-dist-circuit-breakers",
    topic: "Distributed Systems",
    question: "How would you handle a slow or failing downstream service?",
    answer:
      "Use timeouts, circuit breakers, fallbacks, bulkheads, graceful degradation, and alerts so one dependency does not take down the caller.",
    example:
      "If ETA prediction fails, checkout can show a conservative fallback while order creation remains available.",
    prompt:
      "Explain circuit breaker states and how they prevent cascading failures."
  },
  {
    id: "delivery-platform-dist-tracing-backpressure",
    topic: "Distributed Systems",
    question: "How do tracing and backpressure help operate distributed systems?",
    answer:
      "Tracing shows request flow across services, and backpressure slows intake when downstream systems cannot keep up.",
    example:
      "A trace can show checkout waiting on inventory, while queue depth and throttling prevent workers from overwhelming that service.",
    prompt:
      "Explain logs, metrics, traces, and backpressure in a production latency spike."
  },
  {
    id: "delivery-platform-microservices-why-split",
    topic: "Microservices",
    question: "Why split a monolith into services?",
    answer:
      "Split when team ownership, scaling needs, deployment cadence, reliability isolation, or domain boundaries justify the operational cost.",
    example:
      "Payments may deserve a separate service because it has strict ownership, compliance, reliability, and idempotency requirements.",
    prompt:
      "Name the benefits and make clear that splitting is not automatically better."
  },
  {
    id: "delivery-platform-microservices-when-not",
    topic: "Microservices",
    question: "When should you not split a monolith?",
    answer:
      "Do not split when boundaries are unclear, the team is small, shared data is tangled, or the operational overhead exceeds the benefit.",
    example:
      "A new product area may stay modular inside the monolith until traffic, ownership, and domain boundaries become clear.",
    prompt:
      "Explain why a well-structured monolith can be the right near-term architecture."
  },
  {
    id: "delivery-platform-microservices-data-ownership",
    topic: "Microservices",
    question: "What does data ownership per service mean?",
    answer:
      "Each service owns its data model and exposes changes through APIs or events instead of letting other services directly mutate its tables.",
    example:
      "The order service should not directly update payment tables. It calls payment APIs or consumes payment events.",
    prompt:
      "Explain why shared databases across services create coupling and migration risk."
  },
  {
    id: "delivery-platform-microservices-sync-async",
    topic: "Microservices",
    question: "How do you choose synchronous versus asynchronous service communication?",
    answer:
      "Use synchronous calls when the caller needs an immediate answer, and asynchronous events when work can happen later or fan out to many consumers.",
    example:
      "Checkout may synchronously authorize payment, while notifications and analytics can consume order_created events.",
    prompt:
      "Describe latency, coupling, failure handling, and user expectations."
  },
  {
    id: "delivery-platform-microservices-contracts-complexity",
    topic: "Microservices",
    question: "What operational complexity comes with microservices?",
    answer:
      "Microservices add network failures, distributed tracing needs, contract versioning, deployment coordination, data consistency challenges, and on-call surface area.",
    example:
      "A simple order flow may now cross order, payment, dispatch, notification, and merchant services, each with its own failure modes.",
    prompt:
      "List the hidden costs and how good API contracts reduce them."
  },
  {
    id: "delivery-platform-reliability-sli-slo-sla",
    topic: "Reliability",
    question: "What is the difference between SLIs, SLOs, and SLAs?",
    answer:
      "An SLI is a measured reliability signal, an SLO is an internal target for that signal, and an SLA is an external promise or contract.",
    example:
      "Checkout success rate is an SLI, 99.9 percent monthly success is an SLO, and customer credits might be tied to an SLA.",
    prompt:
      "Explain these terms with one backend API metric."
  },
  {
    id: "delivery-platform-reliability-percentiles",
    topic: "Reliability",
    question: "Why do p50, p95, and p99 latency matter more than averages?",
    answer:
      "Percentiles show typical, slow, and tail user experiences, while averages can hide painful outliers that affect real users.",
    example:
      "A p99 checkout latency spike means one percent of users may wait long enough to abandon orders even if average latency looks fine.",
    prompt:
      "Explain p50, p95, p99, and which one you would alert on."
  },
  {
    id: "delivery-platform-reliability-error-budgets",
    topic: "Reliability",
    question: "What is an error budget?",
    answer:
      "An error budget is the allowed unreliability implied by an SLO, used to balance feature velocity against reliability work.",
    example:
      "If checkout burns too much budget this week, pause risky launches and prioritize stability fixes.",
    prompt:
      "Explain how error budgets make reliability tradeoffs concrete."
  },
  {
    id: "delivery-platform-reliability-observability",
    topic: "Reliability",
    question: "What is the difference between monitoring, alerting, logging, and tracing?",
    answer:
      "Monitoring tracks system health, alerting pages humans on actionable symptoms, logging records events, and tracing follows requests across services.",
    example:
      "A checkout 500-rate alert pages on-call, logs show errors, and traces show payment timeout as the bottleneck.",
    prompt:
      "Use a production latency spike to explain all four signals."
  },
  {
    id: "delivery-platform-reliability-deployments",
    topic: "Reliability",
    question: "How do rollbacks, feature flags, and canary deploys reduce release risk?",
    answer:
      "Rollbacks restore a known good version, feature flags decouple deploy from launch, and canaries expose changes to a small slice first.",
    example:
      "Canary a new dispatch ranking algorithm to one region, watch error and latency metrics, then ramp or roll back.",
    prompt:
      "Describe a safe release plan for a risky backend change."
  },
  {
    id: "delivery-platform-search-when",
    topic: "Search",
    question: "When is SQL search not enough?",
    answer:
      "SQL search may be insufficient when you need relevance ranking, typo tolerance, stemming, faceting, highlighting, or fast full-text search over many documents.",
    example:
      "Searching restaurants and menu items by fuzzy consumer queries may need Elasticsearch instead of simple LIKE filters.",
    prompt:
      "Compare structured SQL filters with full-text relevance search."
  },
  {
    id: "delivery-platform-search-documents",
    topic: "Search",
    question: "How do you model documents for Elasticsearch?",
    answer:
      "Create search documents around read/query needs, denormalizing fields needed for relevance, filters, display, and access control.",
    example:
      "A merchant search document might include merchant name, cuisine, menu item names, location, availability, and popularity signals.",
    prompt:
      "Explain why search documents often duplicate database data."
  },
  {
    id: "delivery-platform-search-eventual-consistency",
    topic: "Search",
    question: "Why is search often eventually consistent with the database?",
    answer:
      "The database is the source of truth, while search indexes update asynchronously, so there can be lag or failed index updates.",
    example:
      "A merchant updates a menu item, but search results may still show the old item until the indexing event is processed.",
    prompt:
      "Explain how to monitor index lag and handle user-visible stale results."
  },
  {
    id: "delivery-platform-search-reindexing",
    topic: "Search",
    question: "What is reindexing, and how do you do it safely?",
    answer:
      "Reindexing rebuilds documents into a new index or mapping, ideally using aliases, backfills, validation, and a controlled cutover.",
    example:
      "Build merchant_v2 in parallel, compare counts and sample results, then swap the search alias from v1 to v2.",
    prompt:
      "Describe a safe reindex plan that avoids search downtime."
  },
  {
    id: "delivery-platform-search-failure-modes",
    topic: "Search",
    question: "What can go wrong when search is a dependency?",
    answer:
      "Search can be stale, slow, overloaded, incorrectly ranked, missing documents, or unavailable, so callers need fallbacks and clear monitoring.",
    example:
      "If Elasticsearch is slow, a merchant menu page might fall back to category browsing or cached popular results.",
    prompt:
      "Name failure modes and one graceful degradation strategy."
  },
  {
    id: "delivery-platform-design-order-api",
    topic: "System Design",
    question: "Design an API for creating a food delivery order.",
    answer:
      "Accept cart, address, payment method, idempotency key, and client metadata; validate, price, reserve, authorize payment, create order state, and return a stable response.",
    example:
      "POST /v1/orders with Idempotency-Key creates a pending order, authorizes payment, then transitions to confirmed or failed.",
    prompt:
      "Walk through request shape, state transitions, idempotency, and failure responses."
  },
  {
    id: "delivery-platform-design-driver-dispatch",
    topic: "System Design",
    question: "How would you design a driver dispatch system at a high level?",
    answer:
      "Match orders to drivers using location, capacity, availability, ETA, batching rules, fairness, and fallback logic, with real-time updates and observability.",
    example:
      "Dispatch ranks nearby drivers, sends offers, handles accept or reject, and requeues if no driver accepts quickly.",
    prompt:
      "Describe inputs, matching, offer flow, failure handling, and metrics."
  },
  {
    id: "delivery-platform-design-order-tracking",
    topic: "System Design",
    question: "How would you design order tracking?",
    answer:
      "Store authoritative order state, ingest driver location updates, publish state changes, and serve clients through polling, push, or websocket-like streams.",
    example:
      "The app shows accepted, picked up, nearby, and delivered based on order events and recent driver heartbeats.",
    prompt:
      "Explain state source of truth, update frequency, client delivery, and stale-location handling."
  },
  {
    id: "delivery-platform-design-menu-notifications",
    topic: "System Design",
    question: "How would you design merchant menus and notifications?",
    answer:
      "Menus need fast reads, cache invalidation, search indexing, and auditability; notifications need async queues, retries, preferences, and idempotency.",
    example:
      "Menu updates write Postgres, invalidate Redis, update search, and enqueue notifications for affected subscribers if needed.",
    prompt:
      "Tie together database, cache, search index, and queue-based notifications."
  },
  {
    id: "delivery-platform-design-background-jobs",
    topic: "System Design",
    question: "How would you design a background job system?",
    answer:
      "Define job payloads, durable queues, worker pools, idempotent handlers, retries with backoff, DLQs, visibility timeouts, metrics, and replay tooling.",
    example:
      "A nightly merchant payout job emits jobs per merchant, workers process idempotently, and failed jobs move to a DLQ after retries.",
    prompt:
      "Describe the components and the failure handling story."
  },
  {
    id: "delivery-platform-behavioral-performance",
    topic: "Behavioral/AI",
    question: "How should you tell a performance optimization story for a delivery platform?",
    answer:
      "Use a concrete user impact, measurement, root cause, fix, validation, and prevention. Tie it to latency, reliability, or resource efficiency.",
    example:
      "An N+1 query slowed an endpoint, Sentry and DB metrics exposed it, prefetching reduced load, and a query-count test prevented regression.",
    prompt:
      "Give the story in 60 seconds with problem, action, metric, and follow-up."
  },
  {
    id: "delivery-platform-behavioral-production",
    topic: "Behavioral/AI",
    question: "How should you frame a production ownership story?",
    answer:
      "Describe the incident, customer impact, triage, communication, mitigation, root cause, and prevention work without sounding heroic or vague.",
    example:
      "A release caused elevated errors, you rolled back, used logs and traces to isolate it, patched it, and added a regression test.",
    prompt:
      "Answer with calm ownership: impact, debug path, fix, and prevention."
  },
  {
    id: "delivery-platform-behavioral-architecture",
    topic: "Behavioral/AI",
    question: "How should you explain an architecture story?",
    answer:
      "Start from the product problem, then cover API design, data model, tests, tradeoffs, rollout plan, and what you would improve next.",
    example:
      "A backend feature needed a new endpoint, service-layer logic, Postgres schema, tests around edge cases, and monitoring after launch.",
    prompt:
      "Keep the story technical, but anchor every decision to a user or business outcome."
  },
  {
    id: "delivery-platform-behavioral-ai-tools",
    topic: "Behavioral/AI",
    question: "How should you talk about AI coding tools in the development lifecycle?",
    answer:
      "Say you use tools like Claude, Codex, or Cursor for design exploration, code drafting, test generation, review, and debugging, while you verify correctness yourself.",
    example:
      "Use AI to draft edge-case tests for an idempotency API, then run tests, inspect diffs, and validate the architecture manually.",
    prompt:
      "Explain where AI accelerates you and where engineering judgment remains non-negotiable."
  },
  {
    id: "delivery-platform-behavioral-positioning",
    topic: "Behavioral/AI",
    question: "What is your 30-second backend positioning answer?",
    answer:
      "I am a full-stack engineer with a backend lean, working mostly with Django, Angular, and Postgres in production startup environments. I have owned backend features, improved performance, built AI evaluation tooling, and debugged production issues.",
    example:
      "What interests me about delivery systems is backend scale where reliability, latency, and architecture directly affect consumers, merchants, and drivers.",
    prompt:
      "Say the positioning naturally, then close with interest in service-oriented architecture and high-scale reliability."
  }
];

const bookingPlatformExtendedSourceCards =
  bookingPlatformExtendedSource as BookingPlatformExtendedSourceCard[];

export const bookingPlatformExtendedFlashcards: Flashcard[] =
  bookingPlatformExtendedSourceCards.map((card) => ({
    id: `booking-platform-extended-${toCardSlug(card.topic)}-${toCardSlug(card.question)}`,
    topic: card.topic,
    question: card.question,
    answer: card.answer,
    example: card.example,
    prompt: card.interviewPrompt
  }));

function toCardSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type DeckId = "booking-platform" | "booking-platform-extended" | "delivery-platform";

export type InterviewDeck = {
  id: DeckId;
  name: string;
  shortName: string;
  description: string;
  positioning?: string;
  topics: readonly Topic[];
  cards: Flashcard[];
};

export const interviewDecks: InterviewDeck[] = [
  {
    id: "booking-platform",
    name: "Booking platform full-stack",
    shortName: "Booking",
    description:
      "Django, Postgres, testing, performance, system design, infra, and behavioral prep for a full-stack interview.",
    topics,
    cards: flashcards
  },
  {
    id: "booking-platform-extended",
    name: "Booking platform extended",
    shortName: "Extended",
    description:
      "A larger drill bank imported from the markdown source, with focused Django, Postgres, booking-system, Angular, AWS, Terraform, and behavioral prompts.",
    topics: bookingPlatformExtendedTopics,
    cards: bookingPlatformExtendedFlashcards
  },
  {
    id: "delivery-platform",
    name: "Delivery platform backend",
    shortName: "Delivery",
    description:
      "Large-scale backend systems, 24/7 reliability, REST, service-oriented architecture, data stores, queues, search, and AI tooling.",
    positioning:
      "Full-stack engineer with a backend lean, production startup experience, performance optimization, AI evaluation tooling, and interest in service-oriented architecture and high-scale reliability.",
    topics: deliveryPlatformTopics,
    cards: deliveryPlatformFlashcards
  }
];

export const allFlashcards = interviewDecks.flatMap((deck) => deck.cards);
