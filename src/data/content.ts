export type CoreFact = {
  label: string;
  body: string;
};

export type GuidedExample = {
  title: string;
  scenario: string;
  steps: string[];
  code?: string;
  takeaway: string;
};

export type TradeoffLens = {
  prompt: string;
  juniorAnswer: string;
  midLevelAnswer: string;
  considerations: string[];
};

export type ReadingModule = {
  id: string;
  title: string;
  category: string;
  summary: string;
  estimatedMinutes: number;
  coreFacts: CoreFact[];
  interviewLine: string;
  tradeoffLens: TradeoffLens;
  guidedExamples: GuidedExample[];
  commonPitfalls: string[];
};

export const readingModules: ReadingModule[] = [
  {
    id: "booking-system-walkthrough",
    title: "Booking system walkthrough",
    category: "System design",
    estimatedMinutes: 10,
    summary:
      "The central reservation-system answer: model the booking domain, protect inventory in Postgres, make retries safe, and keep slow side effects out of the critical path.",
    coreFacts: [
      {
        label: "Data model",
        body:
          "Separate Activity, ScheduledSlot, Customer, Booking, Payment, Cancellation, and AuditEvent records so each table owns one lifecycle."
      },
      {
        label: "Double-booking defense",
        body:
          "Limited inventory needs a database-backed invariant such as SELECT FOR UPDATE, a conditional update, a unique seat constraint, or a capacity check."
      },
      {
        label: "API shape",
        body:
          "A create-booking API should validate party size, accept an idempotency key, reserve capacity, record state, and return stable conflict errors."
      },
      {
        label: "Side effects",
        body:
          "Confirmation email, supplier sync, analytics, and retryable payment reconciliation should run through a worker after the booking transaction commits."
      }
    ],
    interviewLine:
      "I would model Activity separately from ScheduledSlot, create bookings through an idempotent POST, and prevent double-booking with a short transaction plus SELECT FOR UPDATE or a conditional capacity update, backed by database constraints.",
    tradeoffLens: {
      prompt: "When would you lock inventory pessimistically instead of relying on optimistic retries?",
      juniorAnswer:
        "I would use SELECT FOR UPDATE because it prevents two users from booking the same slot.",
      midLevelAnswer:
        "I would use a pessimistic lock when contention is likely and correctness matters more than avoiding waits. The trade-off is lower concurrency on that slot, so I would keep the transaction short, avoid external calls while locked, and still enforce the invariant with a database constraint.",
      considerations: [
        "Contention level",
        "Correctness requirement",
        "Lock duration",
        "Database backstop"
      ]
    },
    guidedExamples: [
      {
        title: "Create a safe booking",
        scenario:
          "A customer submits checkout for two seats on a scheduled tour with limited capacity.",
        steps: [
          "Validate request shape, authorization, requested seat count, and idempotency key.",
          "Open a transaction and lock or conditionally update the ScheduledSlot row.",
          "Reject with a 409 conflict if remaining capacity is insufficient.",
          "Create the Booking and Payment state while the inventory invariant is protected.",
          "Commit quickly, then enqueue email, supplier sync, and retryable follow-up work."
        ],
        takeaway:
          "The source of truth is the database transaction; the user-facing API should be retry-safe and explicit when sold out."
      }
    ],
    commonPitfalls: [
      "Checking availability only when the page loads and not again during checkout.",
      "Calling payment providers or email services while holding the inventory lock.",
      "Relying only on application checks when a database constraint can enforce the invariant."
    ]
  },
  {
    id: "postgres-indexes",
    title: "Postgres indexes",
    category: "Database fundamentals",
    estimatedMinutes: 7,
    summary:
      "Indexes are read-performance tools with write and storage costs. A strong answer explains when the planner uses an index and how to prove the change.",
    coreFacts: [
      {
        label: "Definition",
        body:
          "A B-tree index is a sorted side structure that lets Postgres find matching rows without scanning every row in the table."
      },
      {
        label: "Trade-off",
        body:
          "Reads can get faster, but inserts, updates, deletes, and disk usage get more expensive because every index must stay synchronized."
      },
      {
        label: "Selectivity",
        body:
          "Indexes help most when a predicate narrows the table enough. Boolean or three-state columns often still use a sequential scan."
      },
      {
        label: "Composite order",
        body:
          "Composite indexes follow the leftmost-prefix rule. An index on activity_id and starts_at helps activity_id queries, but not starts_at alone."
      }
    ],
    interviewLine:
      "An index is a sorted structure that turns broad table scans into targeted lookups. I add indexes for filters, joins, and sorts, then verify with EXPLAIN ANALYZE because low-cardinality or small-table queries may still be faster as sequential scans.",
    tradeoffLens: {
      prompt: "When would you add an index, and when would you avoid one?",
      juniorAnswer:
        "I would add an index because it makes database reads faster.",
      midLevelAnswer:
        "I would add an index when the query is frequent, filters or sorts on that column, and selects a small enough part of the table. The trade-off is slower writes and more disk usage, so I would avoid indexing low-cardinality columns or rarely used paths and verify the plan with EXPLAIN ANALYZE.",
      considerations: [
        "Query frequency",
        "Selectivity",
        "Write cost",
        "Measured query plan"
      ]
    },
    guidedExamples: [
      {
        title: "Choose an availability index",
        scenario:
          "An activity page loads upcoming slots by activity id and date range.",
        steps: [
          "Start from the exact WHERE and ORDER BY clauses.",
          "Put the equality predicate, activity_id, first in the composite index.",
          "Put the range or sort column, starts_at, next.",
          "Use EXPLAIN ANALYZE to compare estimated rows, actual rows, and timing."
        ],
        takeaway:
          "Index design should follow the query shape, not a generic list of columns in the model."
      }
    ],
    commonPitfalls: [
      "Adding indexes everywhere without accounting for write cost.",
      "Expecting an index on email to help lower(email) unless it is a functional index.",
      "Forgetting Django ForeignKey fields are indexed by default."
    ]
  },
  {
    id: "django-request-lifecycle",
    title: "Django request lifecycle",
    category: "Django fundamentals",
    estimatedMinutes: 6,
    summary:
      "This answer should sound ordered and concrete: server, middleware, routing, view, ORM, response. It also gives you natural places to mention auth, logging, and validation.",
    coreFacts: [
      {
        label: "Entry point",
        body:
          "A request enters through WSGI or ASGI, where Django builds a request object and sends it through the configured stack."
      },
      {
        label: "Middleware",
        body:
          "Middleware wraps requests and responses for cross-cutting concerns such as sessions, auth, CSRF, CORS, logging, and error handling."
      },
      {
        label: "Routing and view",
        body:
          "The URL resolver maps the path to a view, where request validation, domain logic, serializers, templates, and ORM access usually happen."
      },
      {
        label: "Lazy QuerySets",
        body:
          "QuerySets compose SQL lazily and usually execute only when iterated, sliced, converted to list, counted, or rendered."
      }
    ],
    interviewLine:
      "A request enters through WSGI or ASGI, runs request middleware, gets matched by urls.py, executes the view, often evaluates ORM QuerySets against Postgres, and then returns through response middleware to the client.",
    tradeoffLens: {
      prompt: "How much logic should live in the Django view?",
      juniorAnswer:
        "I would put the logic in the view because the request comes there.",
      midLevelAnswer:
        "I would keep the view thin when the logic is reusable or business-critical, because service-layer code is easier to test and reuse. The trade-off is a little more structure, so I would keep simple request orchestration in the view and move booking rules, transactions, and side effects into focused functions or services.",
      considerations: [
        "Business logic complexity",
        "Testability",
        "Reuse across entry points",
        "Framework coupling"
      ]
    },
    guidedExamples: [
      {
        title: "Trace a booking detail request",
        scenario:
          "A customer opens a booking confirmation page after checkout.",
        steps: [
          "Authentication middleware identifies the user session or token.",
          "The URL router maps /bookings/:id to the detail view.",
          "The view checks object-level authorization before reading booking data.",
          "The ORM loads booking, customer, slot, and payment relations with select_related where appropriate.",
          "The serializer returns JSON and response middleware records timing or headers."
        ],
        takeaway:
          "The lifecycle is more memorable when you attach each framework step to a concrete booking request."
      }
    ],
    commonPitfalls: [
      "Skipping middleware order or forgetting response middleware runs on the way out.",
      "Putting all business logic directly in the view when the project has a service layer.",
      "Missing QuerySet laziness when explaining N+1 query behavior."
    ]
  },
  {
    id: "transactions-and-locking",
    title: "Transactions and locking",
    category: "Correctness under concurrency",
    estimatedMinutes: 9,
    summary:
      "This is the booking-system correctness cluster: atomicity, race conditions, row locks, constraints, and when optimistic concurrency is enough.",
    coreFacts: [
      {
        label: "Transaction",
        body:
          "A transaction groups operations so they commit together or roll back together. In Django, transaction.atomic is the usual boundary."
      },
      {
        label: "Race condition",
        body:
          "A race condition happens when two requests read or update shared state at the same time and correctness depends on timing."
      },
      {
        label: "Pessimistic locking",
        body:
          "SELECT FOR UPDATE locks selected rows inside a transaction so competing writers wait and then re-read committed state."
      },
      {
        label: "Optimistic concurrency",
        body:
          "A version column or conditional update detects that another transaction changed the row, then the application retries or returns a conflict."
      }
    ],
    interviewLine:
      "For high-contention inventory, I would wrap the write in transaction.atomic, SELECT FOR UPDATE the slot row, check capacity inside the lock, update it, and still back the invariant with a database constraint.",
    tradeoffLens: {
      prompt: "When would you choose optimistic concurrency over row locking?",
      juniorAnswer:
        "I would use optimistic concurrency because it avoids locking.",
      midLevelAnswer:
        "I would choose optimistic concurrency when conflicts are rare and the user can tolerate retry or conflict handling. The trade-off is more retry logic and possible failed writes under contention, so for limited high-demand inventory I would prefer row locking or a conditional update with a database constraint.",
      considerations: [
        "Expected contention",
        "User retry tolerance",
        "Conflict handling",
        "Invariant criticality"
      ]
    },
    guidedExamples: [
      {
        title: "Protect the last seat",
        scenario:
          "Two checkout requests both try to book the final remaining seat.",
        steps: [
          "Request A opens a transaction and locks the slot row.",
          "Request B reaches the same row and waits instead of reading stale capacity.",
          "Request A decrements capacity, creates the booking, and commits.",
          "Request B resumes, sees zero remaining seats, and returns a sold-out conflict."
        ],
        code: `with transaction.atomic():
    slot = ScheduledSlot.objects.select_for_update().get(id=slot_id)
    if slot.remaining_seats < requested_seats:
        raise SoldOutError()
    slot.remaining_seats -= requested_seats
    slot.save(update_fields=["remaining_seats"])
    Booking.objects.create(slot=slot, customer=customer, num_seats=requested_seats)`,
        takeaway:
          "The second request should wait and observe the real committed state, not make a decision from stale state."
      }
    ],
    commonPitfalls: [
      "Checking capacity before opening the transaction.",
      "Holding locks while making slow external network calls.",
      "Using only app-level logic for invariants the database can enforce."
    ]
  },
  {
    id: "keys-and-relationships",
    title: "Keys and relationships",
    category: "Data modeling",
    estimatedMinutes: 6,
    summary:
      "Relationship answers should show where facts belong. For bookings, the essential move is placing availability on ScheduledSlot, not on Activity.",
    coreFacts: [
      {
        label: "Primary key",
        body:
          "A primary key uniquely identifies one row. Django creates an id primary key by default unless the model defines something else."
      },
      {
        label: "Foreign key",
        body:
          "A foreign key references another table's primary key and lets the database enforce referential integrity between related records."
      },
      {
        label: "Many-to-many",
        body:
          "A many-to-many relationship is implemented with a join table, even when Django presents it as a ManyToManyField."
      },
      {
        label: "Normalization",
        body:
          "Normalization stores each fact once to reduce duplication and update anomalies. Denormalization is a deliberate read-performance trade-off."
      }
    ],
    interviewLine:
      "I model relationships around the lifecycle of the data: customers make bookings, bookings point to scheduled slots, scheduled slots point to activities, and payments point to bookings.",
    tradeoffLens: {
      prompt: "When would you denormalize a booking data model?",
      juniorAnswer:
        "I would denormalize because it makes reads faster.",
      midLevelAnswer:
        "I would start normalized for correctness, then denormalize only for a measured read bottleneck such as reporting or search. The trade-off is duplicate data and update complexity, so I would define the source of truth, update path, and consistency expectations before adding the redundant field.",
      considerations: [
        "Source of truth",
        "Read latency",
        "Update complexity",
        "Consistency tolerance"
      ]
    },
    guidedExamples: [
      {
        title: "Place the booking foreign key",
        scenario:
          "An activity runs many times per day with different start times and capacities.",
        steps: [
          "Activity stores stable details such as title, location, duration, and supplier.",
          "ScheduledSlot stores the specific start time and capacity for one occurrence.",
          "Booking points to ScheduledSlot because the customer reserves one occurrence.",
          "Payment points to Booking because money is tied to the reservation attempt."
        ],
        takeaway:
          "The foreign key should point to the entity whose state the row actually depends on."
      }
    ],
    commonPitfalls: [
      "Putting capacity directly on Activity when it varies by date and time.",
      "Treating denormalization as simpler while silently creating consistency work.",
      "Using select_related for reverse or many-valued relationships that require prefetch_related."
    ]
  },
  {
    id: "performance-methodology",
    title: "Performance methodology",
    category: "Production debugging",
    estimatedMinutes: 7,
    summary:
      "Good performance answers are procedural: measure, locate the bottleneck, fix the largest contributor, then verify with the same metric.",
    coreFacts: [
      {
        label: "Measure first",
        body:
          "Use traces, query logs, Sentry performance, Django Debug Toolbar, or assertNumQueries before choosing an optimization."
      },
      {
        label: "Find the layer",
        body:
          "Classify slow time as database, Python code, external network call, frontend bundle/rendering, or queue/backlog delay."
      },
      {
        label: "Tail latency",
        body:
          "p95 and p99 latency show slow user experiences that averages hide, especially during partial dependency failures."
      },
      {
        label: "Read/write trade-off",
        body:
          "Indexes, caching, denormalization, and precomputation can speed reads but add write cost, staleness, or consistency work."
      }
    ],
    interviewLine:
      "I profile before optimizing: find the slow transaction, identify whether time is in the database, app code, or an external dependency, make the smallest targeted fix, and verify p95 latency and query count before and after.",
    tradeoffLens: {
      prompt: "How do you decide whether a performance optimization is worth it?",
      juniorAnswer:
        "I would optimize the slow code to make the endpoint faster.",
      midLevelAnswer:
        "I would first measure where time is spent and choose the smallest fix for the biggest bottleneck. The trade-off is engineering time and possible complexity, so I would compare before-and-after p95 latency, query count, and operational risk before keeping the change.",
      considerations: [
        "Measured bottleneck",
        "User impact",
        "Implementation complexity",
        "Before-and-after metric"
      ]
    },
    guidedExamples: [
      {
        title: "Fix an N+1 query",
        scenario:
          "A bookings list endpoint is slow and performance traces show repeated customer queries.",
        steps: [
          "Reproduce the endpoint and count queries.",
          "Find the serializer or template field touching booking.customer per row.",
          "Use select_related for the single-valued customer relation.",
          "Add assertNumQueries so query count cannot quietly regress.",
          "Compare before and after latency and query count."
        ],
        takeaway:
          "A performance story is strongest when it ends with measured before and after numbers."
      }
    ],
    commonPitfalls: [
      "Optimizing on a hunch without a baseline.",
      "Reporting average latency while ignoring p95 and p99.",
      "Caching live availability without an invalidation or staleness plan."
    ]
  },
  {
    id: "testing-strategy",
    title: "Testing strategy",
    category: "Engineering quality",
    estimatedMinutes: 7,
    summary:
      "Testing answers should separate unit, integration, regression, and end-to-end tests, then prioritize the paths where money and inventory correctness matter.",
    coreFacts: [
      {
        label: "Unit tests",
        body:
          "Unit tests cover isolated logic such as price calculation, validation rules, state transitions, and edge cases."
      },
      {
        label: "Integration tests",
        body:
          "Integration tests verify framework wiring and real database behavior, which matters for ORM queries, constraints, permissions, and transactions."
      },
      {
        label: "Regression tests",
        body:
          "A regression test reproduces a specific escaped bug before the fix, then stays in the suite to prevent the bug from returning."
      },
      {
        label: "Mocking boundary",
        body:
          "Mock external, slow, flaky, or nondeterministic systems like payments and email. Avoid mocking the core logic or database behavior you need to prove."
      }
    ],
    interviewLine:
      "I unit-test business rules, integration-test endpoints against a real test database, and write regression tests for escaped bugs. I mock external services like payments, but I do not mock the database in integration tests.",
    tradeoffLens: {
      prompt: "When would you choose an integration test instead of a unit test?",
      juniorAnswer:
        "I would write an integration test because it tests more of the app.",
      midLevelAnswer:
        "I would use an integration test when correctness depends on framework wiring, database constraints, transactions, or permissions. The trade-off is slower tests and more setup, so I would reserve them for critical paths and keep pure business rules covered by faster unit tests.",
      considerations: [
        "Behavior under test",
        "Framework or database dependency",
        "Execution speed",
        "Criticality of path"
      ]
    },
    guidedExamples: [
      {
        title: "Cover an oversell bug",
        scenario:
          "A bug allowed two confirmed bookings for one remaining seat.",
        steps: [
          "Create a slot with one remaining seat in the test database.",
          "Exercise the same booking service boundary twice under the risky condition.",
          "Assert that exactly one booking is confirmed.",
          "Assert the other request receives a sold-out conflict.",
          "Assert remaining seats never becomes negative."
        ],
        takeaway:
          "The test should prove the externally visible behavior and the invariant, not private implementation details."
      }
    ],
    commonPitfalls: [
      "Mocking the ORM and missing real transaction behavior.",
      "Writing only happy-path tests for checkout.",
      "Using coverage percentage as a substitute for risk-based thinking."
    ]
  },
  {
    id: "redis-caching-rate-limits",
    title: "Redis, caching, and rate limits",
    category: "Caching and throttling",
    estimatedMinutes: 6,
    summary:
      "Redis answers should separate speed from correctness: know the access pattern, staleness tolerance, invalidation plan, and fallback when the cache is wrong or unavailable.",
    coreFacts: [
      {
        label: "Cache-aside",
        body:
          "Cache-aside reads from cache first, falls back to the database on miss, and writes the fresh value back with an appropriate TTL."
      },
      {
        label: "Invalidation",
        body:
          "Caching is hard because stale values can outlive the source-of-truth update unless TTLs or explicit invalidation are designed."
      },
      {
        label: "Rate limiting",
        body:
          "Redis can support rate limits with counters, sorted sets, or token bucket state because updates can be fast and atomic."
      },
      {
        label: "Source of truth",
        body:
          "Redis is usually an acceleration or coordination layer. Correctness-critical booking, payment, and inventory state should still be recoverable from the primary database."
      }
    ],
    interviewLine:
      "I would consider Redis when the endpoint is read-heavy and the data can tolerate some staleness. I would set a TTL, design invalidation, watch hit rate, and keep the database as the source of truth.",
    tradeoffLens: {
      prompt: "When would you use Redis for an endpoint?",
      juniorAnswer:
        "I would use Redis because it is fast.",
      midLevelAnswer:
        "I would consider Redis if the endpoint is read-heavy and the data can tolerate some staleness. I would set a TTL, think through invalidation, and make sure the database remains the source of truth, because the trade-off is cache consistency and operational complexity.",
      considerations: [
        "Read-heavy access pattern",
        "Staleness tolerance",
        "Invalidation strategy",
        "Database source of truth"
      ]
    },
    guidedExamples: [
      {
        title: "Cache an activity listing",
        scenario:
          "A public listing endpoint is read-heavy, while checkout still needs current inventory.",
        steps: [
          "Identify which fields can be stale and for how long.",
          "Use a cache key that includes stable filters such as location and date.",
          "Set a TTL and invalidate when suppliers edit the listing.",
          "Always re-check inventory against Postgres during checkout."
        ],
        takeaway:
          "Cache the browsing path for speed, but preserve the database as the authority for booking correctness."
      }
    ],
    commonPitfalls: [
      "Caching correctness-critical inventory without a re-check at checkout.",
      "Adding Redis without knowing hit rate, TTL, or invalidation behavior.",
      "Letting Redis outage take down a path that could fall back to the database."
    ]
  },
  {
    id: "idempotency-retries-queues",
    title: "Idempotency, retries, and queues",
    category: "Reliability patterns",
    estimatedMinutes: 7,
    summary:
      "Backend reliability often comes down to making repeated attempts safe and moving slow side effects out of the request path.",
    coreFacts: [
      {
        label: "Idempotency key",
        body:
          "An idempotency key lets a retried request return the original result instead of duplicating a booking, order, or charge."
      },
      {
        label: "At-least-once delivery",
        body:
          "Queue consumers should expect duplicate messages because a worker can finish side effects but fail before acknowledging the message."
      },
      {
        label: "Dead letter queue",
        body:
          "A dead letter queue stores messages that exceeded retry limits so operators can inspect, repair, or replay them safely."
      }
    ],
    interviewLine:
      "Retries need idempotency, queues need duplicate-safe consumers, and both need bounded backoff so recovery traffic does not become a retry storm.",
    tradeoffLens: {
      prompt: "When would you move work to a queue instead of doing it inline?",
      juniorAnswer:
        "I would use a queue because it makes the request faster.",
      midLevelAnswer:
        "I would move slow, retryable, non-critical side effects to a queue when the user does not need the result synchronously. The trade-off is eventual consistency and duplicate delivery, so workers need idempotency, retries with backoff, and monitoring for stuck or dead-lettered jobs.",
      considerations: [
        "User needs immediate result",
        "Retry safety",
        "Duplicate handling",
        "Operational visibility"
      ]
    },
    guidedExamples: [
      {
        title: "Handle payment timeout",
        scenario:
          "The client times out after submitting checkout, but the payment provider may still complete the charge.",
        steps: [
          "Persist the request under an idempotency key.",
          "Mark payment state as pending or unknown.",
          "Retry or reconcile through provider events.",
          "Return the same booking result for client retries."
        ],
        takeaway:
          "Timeout does not mean failure; the system needs a stable record that retries and webhooks can reconcile."
      }
    ],
    commonPitfalls: [
      "Letting client retries create duplicate bookings.",
      "Assuming queues deliver each message exactly once.",
      "Retrying immediately without jitter or a max-attempt policy."
    ]
  },
  {
    id: "aws-infra-basics",
    title: "AWS and infrastructure basics",
    category: "Cloud deployment",
    estimatedMinutes: 6,
    summary:
      "Infrastructure answers should show the job of each service and the operational trade-off it introduces for a Django/Postgres application.",
    coreFacts: [
      {
        label: "EC2 and ECS",
        body:
          "EC2 gives virtual machines you manage, while ECS runs Docker containers as services on EC2 or Fargate."
      },
      {
        label: "RDS and S3",
        body:
          "RDS manages relational database hosting tasks, while S3 stores durable objects such as static assets, uploads, exports, and backups."
      },
      {
        label: "Secrets",
        body:
          "Secrets should live in environment variables or a secrets manager such as AWS Secrets Manager or SSM, not in committed source code."
      },
      {
        label: "Terraform",
        body:
          "Terraform declares infrastructure in version-controlled configuration so environments can be reviewed and reproduced."
      }
    ],
    interviewLine:
      "A typical production shape is a Dockerized Django app on ECS Fargate, Postgres on RDS, static and media assets in S3, secrets in a secrets manager, workers on a queue, and infrastructure defined in Terraform.",
    tradeoffLens: {
      prompt: "When would you choose ECS Fargate instead of EC2?",
      juniorAnswer:
        "I would use Fargate because it is easier than managing servers.",
      midLevelAnswer:
        "I would choose Fargate when container orchestration matters but the team does not want to manage host capacity. The trade-off is less control and sometimes higher cost, so for specialized networking, custom hosts, or very cost-sensitive steady workloads I would compare against ECS on EC2.",
      considerations: [
        "Operational ownership",
        "Cost profile",
        "Control over hosts",
        "Scaling pattern"
      ]
    },
    guidedExamples: [
      {
        title: "Deploy a Django worker stack",
        scenario:
          "A booking app needs web requests, background email, supplier sync, and a managed database.",
        steps: [
          "Run web and worker containers separately.",
          "Use RDS for Postgres and S3 for static or uploaded objects.",
          "Inject configuration through environment variables and least-privilege task roles.",
          "Monitor service health, latency, error rate, and queue depth."
        ],
        takeaway:
          "Cloud answers land better when every service has a specific job in the system."
      }
    ],
    commonPitfalls: [
      "Treating EC2, ECS, Fargate, and Lambda as interchangeable.",
      "Hardcoding secrets in source code or examples.",
      "Using Lambda as a vague answer for long-running stateful application work."
    ]
  },
  {
    id: "angular-frontend-basics",
    title: "Angular frontend basics",
    category: "Frontend fundamentals",
    estimatedMinutes: 5,
    summary:
      "Keep Angular answers practical: components for UI, services for shared logic and API calls, reactive forms for validation, and browser tools for debugging failed requests.",
    coreFacts: [
      {
        label: "Components",
        body:
          "Angular components combine a template, class, and styles. Parents pass data down with Input and children emit events up with Output."
      },
      {
        label: "Services",
        body:
          "Services are dependency-injected singletons used for shared state, API clients, and logic that should not live inside one component."
      },
      {
        label: "HttpClient",
        body:
          "HttpClient returns RxJS Observables. Components subscribe directly or use the async pipe and handle errors with catchError."
      },
      {
        label: "Forms",
        body:
          "Reactive forms use FormGroup and FormControl in TypeScript and are preferred for complex validation, while the backend must validate again."
      }
    ],
    interviewLine:
      "In Angular I think in components for view structure, services for shared API and state logic, HttpClient Observables for server communication, and reactive forms for complex user input with backend validation as the real authority.",
    tradeoffLens: {
      prompt: "When would you move Angular logic into a service?",
      juniorAnswer:
        "I would use a service so multiple components can share the code.",
      midLevelAnswer:
        "I would move API calls or cross-component state into a service when the behavior is reused or needs one clear owner. The trade-off is indirection, so I would keep purely local display state in the component and use services for shared state, API boundaries, and business rules.",
      considerations: [
        "Reuse across components",
        "State ownership",
        "Testability",
        "Component simplicity"
      ]
    },
    guidedExamples: [
      {
        title: "Debug a failed booking request",
        scenario:
          "The checkout form shows an error after submitting to the API.",
        steps: [
          "Open the Network tab and inspect status code, request payload, response body, and headers.",
          "Separate client issues such as validation, auth, or CORS from backend 500s.",
          "Check the console for JavaScript or Observable handling errors.",
          "Reproduce with the same payload against backend logs or Sentry."
        ],
        takeaway:
          "A good frontend debugging answer moves from browser evidence to backend evidence instead of guessing."
      }
    ],
    commonPitfalls: [
      "Relying only on client-side validation for booking rules.",
      "Letting components become large API and state containers.",
      "Ignoring the response body and guessing from the status code alone."
    ]
  },
  {
    id: "auth-security-permissions",
    title: "Auth, security, and permissions",
    category: "Security fundamentals",
    estimatedMinutes: 7,
    summary:
      "Mid-level security answers separate authentication from authorization, validate at boundaries, protect browser flows, and check object-level permissions before reads and writes.",
    coreFacts: [
      {
        label: "Authentication",
        body:
          "Authentication proves who the user is through a session, token, SSO flow, or service credential before the app trusts identity."
      },
      {
        label: "Authorization",
        body:
          "Authorization decides what that identity can access. Object-level authorization checks the specific booking, supplier, account, or resource being read or changed."
      },
      {
        label: "Browser defenses",
        body:
          "Cookie-based browser apps need CSRF protection, secure cookie settings, careful CORS policy, and server-side validation even when the frontend validates first."
      },
      {
        label: "Sensitive logging",
        body:
          "Logs should help debugging without exposing passwords, tokens, session cookies, payment identifiers, or private customer data."
      }
    ],
    interviewLine:
      "I separate authentication from authorization: first prove the caller identity, then check object-level authorization on the exact booking or supplier resource before returning or mutating data, with CSRF, CORS, input validation, and safe logging at the boundaries.",
    tradeoffLens: {
      prompt: "When would you use session cookies instead of JWTs for a browser app?",
      juniorAnswer:
        "I would use JWTs because they are modern and work well for APIs.",
      midLevelAnswer:
        "For a server-rendered or same-site browser app, I would usually prefer secure HttpOnly session cookies because revocation and CSRF controls are straightforward. JWTs can fit stateless APIs or cross-service calls, but the trade-off is token revocation, storage risk, expiry handling, and making sure authorization still happens on every object.",
      considerations: [
        "Client type",
        "Revocation needs",
        "CSRF and storage risk",
        "Object-level authorization"
      ]
    },
    guidedExamples: [
      {
        title: "Protect a supplier edit endpoint",
        scenario:
          "A supplier employee submits an update for a scheduled activity that belongs to a different supplier account.",
        steps: [
          "Authenticate the user and load their supplier membership or role.",
          "Load the target activity by id without trusting the client-provided supplier id.",
          "Check object-level authorization against the loaded activity's supplier.",
          "Return 403 for authenticated users who lack access and avoid leaking private details.",
          "Log the denied access with safe identifiers that do not include secrets."
        ],
        takeaway:
          "The important security move is checking the loaded object, not just checking that the user is logged in."
      }
    ],
    commonPitfalls: [
      "Treating login as permission to access every object.",
      "Trusting supplier_id, user_id, or role values sent by the browser.",
      "Logging tokens, cookies, passwords, or payment details while debugging."
    ]
  },
  {
    id: "api-endpoint-design",
    title: "API endpoint design",
    category: "Backend implementation",
    estimatedMinutes: 8,
    summary:
      "Endpoint design answers should cover request shape, validation, status codes, idempotency, authorization, response contracts, and failure modes.",
    coreFacts: [
      {
        label: "Request contract",
        body:
          "A strong endpoint defines required fields, optional fields, idempotency keys, auth context, and which values the server ignores or derives itself."
      },
      {
        label: "Validation",
        body:
          "Boundary validation catches malformed input, while domain validation enforces rules such as capacity, ownership, state transitions, and payment eligibility."
      },
      {
        label: "Status codes",
        body:
          "Use status codes intentionally: 400 for malformed input, 401 for unauthenticated, 403 for forbidden, 404 for missing, 409 for conflicts, and 201 for creation."
      },
      {
        label: "Stable errors",
        body:
          "Clients need predictable error codes and response bodies so retries, form messages, and observability can distinguish validation failures from conflicts."
      }
    ],
    interviewLine:
      "For a create-booking endpoint, I would define the request and response contract, authenticate the caller, validate input, check object-level permissions, enforce capacity in a transaction, return 201 on success, 409 on sold-out conflicts, and make retries safe with an idempotency key.",
    tradeoffLens: {
      prompt: "How much logic should live directly in an API route handler?",
      juniorAnswer:
        "I would put the endpoint logic in the route because that is where the request comes in.",
      midLevelAnswer:
        "I would keep route handlers focused on HTTP concerns such as auth, parsing, validation, status codes, and serialization. The trade-off is an extra service boundary, but moving booking rules and transactions into a service makes them easier to test, reuse from workers, and keep consistent across entry points.",
      considerations: [
        "HTTP boundary concerns",
        "Business rule reuse",
        "Testability",
        "Worker or webhook reuse"
      ]
    },
    guidedExamples: [
      {
        title: "Design POST /bookings",
        scenario:
          "A customer submits a checkout request for two seats on a scheduled activity.",
        steps: [
          "Accept slot_id, party_size, customer details, payment reference, and an idempotency key.",
          "Reject malformed payloads with 400 and unauthenticated callers with 401.",
          "Check object-level authorization or public booking eligibility for the slot.",
          "Use a transaction to reserve capacity and create a booking state.",
          "Return 201 with the booking id, status, and stable conflict errors for sold-out attempts."
        ],
        takeaway:
          "A mid-level endpoint answer connects HTTP semantics to domain correctness and retry behavior."
      }
    ],
    commonPitfalls: [
      "Returning 500 for expected validation or sold-out cases.",
      "Letting clients choose server-owned state such as price, status, or supplier id.",
      "Designing only the happy path and skipping retry, conflict, and auth behavior."
    ]
  },
  {
    id: "observability-debugging",
    title: "Observability and debugging",
    category: "Production debugging",
    estimatedMinutes: 7,
    summary:
      "Production debugging answers should move from symptom to evidence: logs, metrics, and traces, then a small mitigation, a root cause, and prevention.",
    coreFacts: [
      {
        label: "Logs",
        body:
          "Logs explain discrete events and errors. Useful logs include request ids, safe object ids, state transitions, and failure reasons."
      },
      {
        label: "Metrics",
        body:
          "Metrics show trends and health over time, such as request rate, error rate, p95 latency, queue depth, cache hit rate, and database timing."
      },
      {
        label: "Traces",
        body:
          "Traces show how one request moves through app code, database calls, queues, and external services so bottlenecks can be located."
      },
      {
        label: "Incident shape",
        body:
          "A strong incident answer names impact, mitigation, evidence, root cause, fix, and the prevention mechanism such as an alert, test, or runbook."
      }
    ],
    interviewLine:
      "For a production issue, I would start with user impact and the alert, inspect logs, metrics, and traces to locate the failing layer, mitigate first if users are affected, then fix root cause and add prevention through tests, alerts, or a runbook.",
    tradeoffLens: {
      prompt: "When would you add more logging instead of a metric or trace?",
      juniorAnswer:
        "I would add logs because they show what happened in the code.",
      midLevelAnswer:
        "I would add logs when I need event-level detail, such as why a booking changed state or why validation failed. The trade-off is volume, cost, and privacy risk, so for trends or alerting I would use metrics, and for cross-service latency I would rely on traces with correlation ids.",
      considerations: [
        "Debug detail needed",
        "Alerting versus investigation",
        "Privacy and cost",
        "Correlation across services"
      ]
    },
    guidedExamples: [
      {
        title: "Debug slow checkout",
        scenario:
          "Checkout p95 latency jumps from 800 ms to 4 seconds during peak booking traffic.",
        steps: [
          "Confirm user impact, affected endpoint, region, and start time from metrics.",
          "Use traces to separate app time, database time, payment provider time, and queue delay.",
          "Check logs for correlated errors, timeouts, retries, or lock waits using request ids.",
          "Mitigate with rollback, feature flag, capacity change, or dependency fallback if needed.",
          "Add a regression test, alert threshold, or runbook note after the root cause is fixed."
        ],
        takeaway:
          "The answer sounds mid-level when it uses evidence to narrow the problem instead of guessing the slow layer."
      }
    ],
    commonPitfalls: [
      "Jumping to a code fix before measuring the affected layer.",
      "Alerting on noisy symptoms nobody can act on.",
      "Adding verbose logs that expose private data or create avoidable cost."
    ]
  },
  {
    id: "frontend-state-forms",
    title: "Frontend state and forms",
    category: "Frontend implementation",
    estimatedMinutes: 7,
    summary:
      "Frontend full-stack answers should cover state ownership, form validation, loading, empty, error, and success states, API boundaries, and backend authority.",
    coreFacts: [
      {
        label: "State ownership",
        body:
          "Keep local display state in the component, shared API state in a service or data layer, and server-owned truth on the backend."
      },
      {
        label: "Form lifecycle",
        body:
          "Forms need initial state, client validation, submit state, disabled duplicate submits, error rendering, success handling, and reset or navigation behavior."
      },
      {
        label: "Async states",
        body:
          "User-facing screens need loading, empty, error, and success states so slow networks, failed requests, and missing data are understandable."
      },
      {
        label: "Backend authority",
        body:
          "Client validation improves experience, but the backend must revalidate permissions, capacity, price, and any security-sensitive rule."
      }
    ],
    interviewLine:
      "On the frontend, I would keep form state local unless it needs to be shared, call the API through a service boundary, show loading, empty, error, and success states, prevent duplicate submits, and rely on backend validation for the final booking rules.",
    tradeoffLens: {
      prompt: "When should form state stay local instead of moving to a shared store?",
      juniorAnswer:
        "I would move it to shared state so other components can access it.",
      midLevelAnswer:
        "I would keep form state local when only one component owns the draft and no other route needs it. The trade-off is simpler code versus persistence and coordination, so I would move state to a service or shared store only for multi-step flows, cross-component reuse, or state that must survive navigation.",
      considerations: [
        "Single owner or shared owner",
        "Navigation persistence",
        "Validation complexity",
        "API boundary"
      ]
    },
    guidedExamples: [
      {
        title: "Submit a booking form",
        scenario:
          "A customer fills a checkout form while live inventory and network conditions can change.",
        steps: [
          "Validate required fields and show inline messages before submit.",
          "Disable the submit button while the request is in flight to avoid duplicates.",
          "Show a loading state during submit and an error state for validation or conflict responses.",
          "Handle 409 sold-out responses differently from 500 unexpected failures.",
          "Show success only after the backend confirms the booking state."
        ],
        takeaway:
          "A strong frontend answer treats async state and backend authority as part of the user experience."
      }
    ],
    commonPitfalls: [
      "Only designing the success path.",
      "Letting duplicate clicks create duplicate requests without idempotency or disabled state.",
      "Assuming client validation is enough for price, inventory, or permission rules."
    ]
  },
  {
    id: "sql-live-coding-drills",
    title: "SQL and live coding drills",
    category: "Implementation practice",
    estimatedMinutes: 8,
    summary:
      "Live coding preparation should cover small endpoint implementations, SQL queries, data transforms, edge cases, and how to narrate correctness while coding.",
    coreFacts: [
      {
        label: "Clarify first",
        body:
          "Before coding, restate input, output, edge cases, constraints, and whether the interviewer expects production code, pseudocode, or a focused function."
      },
      {
        label: "SQL shape",
        body:
          "For SQL questions, identify tables, joins, filters, grouping, ordering, and whether the query needs pagination or an index-friendly predicate."
      },
      {
        label: "Endpoint shape",
        body:
          "For endpoint coding, show validation, authorization, service call, error handling, and a small test or example request."
      },
      {
        label: "Narration",
        body:
          "Mid-level live coding narration explains trade-offs, tests edge cases, and names what would be hardened in production."
      }
    ],
    interviewLine:
      "In live coding, I would clarify the contract, implement the smallest correct version, test edge cases, and narrate production concerns like validation, authorization, SQL indexes, idempotency, and error handling without overbuilding.",
    tradeoffLens: {
      prompt: "When should you write the simplest solution instead of optimizing immediately?",
      juniorAnswer:
        "I would optimize right away so the solution is fast.",
      midLevelAnswer:
        "I would start with the simplest correct solution when constraints are small or unclear, then discuss the bottleneck and optimize only if the data size or query pattern requires it. The trade-off is speed of implementation versus scalability, so I would prove correctness first and name the index, pagination, or algorithm change I would add next.",
      considerations: [
        "Input size",
        "Correctness first",
        "Measured bottleneck",
        "Optimization path"
      ]
    },
    guidedExamples: [
      {
        title: "Query upcoming bookings",
        scenario:
          "An interviewer asks for SQL that lists upcoming confirmed bookings for one supplier.",
        steps: [
          "Clarify the tables: bookings, scheduled_slots, activities, suppliers, and customers.",
          "Join bookings to slots and activities, then filter by supplier id, confirmed status, and starts_at in the future.",
          "Order by starts_at and add a limit or cursor for large result sets.",
          "Mention an index such as activity supplier plus slot start time, depending on the schema.",
          "Test empty results, canceled bookings, and bookings for another supplier."
        ],
        code: `SELECT b.id, b.customer_id, s.starts_at, a.title
FROM bookings b
JOIN scheduled_slots s ON s.id = b.slot_id
JOIN activities a ON a.id = s.activity_id
WHERE a.supplier_id = $1
  AND b.status = 'confirmed'
  AND s.starts_at >= NOW()
ORDER BY s.starts_at ASC
LIMIT 50;`,
        takeaway:
          "A good SQL drill answer includes the query, the access pattern, and the edge cases you would test."
      }
    ],
    commonPitfalls: [
      "Coding before clarifying inputs and expected behavior.",
      "Forgetting empty, unauthorized, duplicate, or invalid-input cases.",
      "Optimizing without explaining the actual data size or query pattern."
    ]
  },
  {
    id: "behavioral-story-bank",
    title: "Behavioral story bank",
    category: "Interview storytelling",
    estimatedMinutes: 6,
    summary:
      "Behavioral preparation is not memorizing prose; it is compressing real examples into a repeatable structure with evidence and reflection.",
    coreFacts: [
      {
        label: "STAR",
        body:
          "A useful story covers situation, task, action, and result, then adds the lesson or prevention step for senior-level signal."
      },
      {
        label: "Specific impact",
        body:
          "Interview stories get stronger when they include a concrete metric, customer impact, operational risk, or business trade-off."
      },
      {
        label: "Ownership",
        body:
          "Production ownership stories should include triage, communication, mitigation, root cause, and how recurrence was prevented."
      }
    ],
    interviewLine:
      "I would answer behavioral prompts with one specific situation, my concrete action, a measurable result, and the lesson I carried forward.",
    tradeoffLens: {
      prompt: "How do you make a behavioral story sound senior instead of vague?",
      juniorAnswer:
        "I would explain what happened and what I did to fix it.",
      midLevelAnswer:
        "I would state the user impact, my specific responsibility, the trade-off I chose under pressure, and the prevention step afterward. The stronger signal is not just that I fixed it, but that I improved the system or process so the same issue is less likely to recur.",
      considerations: [
        "User impact",
        "Your ownership",
        "Decision trade-off",
        "Prevention mechanism"
      ]
    },
    guidedExamples: [
      {
        title: "Tell a production incident story",
        scenario:
          "An interviewer asks about a bug or outage that escaped to production.",
        steps: [
          "State user impact without drama.",
          "Explain your debugging path.",
          "Name the mitigation and final fix.",
          "Close with the prevention mechanism, such as a regression test or alert."
        ],
        takeaway:
          "The ending matters: show that the incident changed the system, not just that you fixed it once."
      }
    ],
    commonPitfalls: [
      "Telling the team story without making your personal action clear.",
      "Ending at the fix and skipping prevention.",
      "Using vague words like improved or optimized without a metric."
    ]
  }
];
