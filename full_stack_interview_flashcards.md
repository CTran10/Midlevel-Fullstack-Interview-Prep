# Full-Stack Engineer Interview Flashcards

```json
[
  {
    "topic": "Django ORM",
    "question": "When are Django QuerySets evaluated?",
    "answer": "QuerySets are lazy. They are evaluated when iterated, sliced with a step, converted to list, counted in some cases, checked for truthiness, or otherwise forced.",
    "example": "qs = Booking.objects.filter(status='confirmed') does not hit the database until list(qs) or iteration.",
    "interviewPrompt": "How would you avoid accidentally running extra ORM queries in a view?"
  },
  {
    "topic": "Django ORM",
    "question": "What is the difference between filter and get?",
    "answer": "filter returns a QuerySet and can return zero, one, or many rows. get returns one object and raises DoesNotExist or MultipleObjectsReturned if the result count is not exactly one.",
    "example": "Booking.objects.get(id=booking_id) is appropriate when the primary key must exist exactly once.",
    "interviewPrompt": "When would get be risky in API code?"
  },
  {
    "topic": "Django ORM",
    "question": "What are Q objects used for?",
    "answer": "Q objects express complex WHERE clauses, especially OR, NOT, and grouped boolean logic.",
    "example": "Booking.objects.filter(Q(status='confirmed') | Q(status='pending'))",
    "interviewPrompt": "How would you query bookings that are either pending or confirmed but not canceled?"
  },
  {
    "topic": "Django ORM",
    "question": "What are F expressions used for?",
    "answer": "F expressions let the database update or compare fields using current database values, avoiding stale read-modify-write logic in Python.",
    "example": "Tour.objects.filter(id=tour_id).update(remaining=F('remaining') - 1)",
    "interviewPrompt": "Why is an F expression safer than reading a counter, decrementing it, and saving?"
  },
  {
    "topic": "Django ORM",
    "question": "What is annotate used for?",
    "answer": "annotate adds calculated values to each row in a QuerySet, often using aggregates, counts, sums, or conditional expressions.",
    "example": "Tour.objects.annotate(booking_count=Count('bookings'))",
    "interviewPrompt": "How would you show each tour with its number of confirmed bookings?"
  },
  {
    "topic": "Django ORM",
    "question": "What is aggregate used for?",
    "answer": "aggregate returns summary values across a QuerySet instead of adding values to each row.",
    "example": "Booking.objects.filter(status='confirmed').aggregate(total=Sum('price'))",
    "interviewPrompt": "What is the difference between annotate and aggregate?"
  },
  {
    "topic": "Django ORM",
    "question": "When would you use values or values_list?",
    "answer": "Use them when you only need dictionaries or tuples of selected fields instead of full model instances.",
    "example": "Booking.objects.values_list('id', 'status')",
    "interviewPrompt": "Why might values_list improve performance in a reporting endpoint?"
  },
  {
    "topic": "Django ORM",
    "question": "When would you use only or defer?",
    "answer": "Use only or defer to avoid loading large model fields immediately, but be careful because accessing deferred fields later triggers extra queries.",
    "example": "Customer.objects.only('id', 'email')",
    "interviewPrompt": "How can only accidentally create an N+1 problem?"
  },
  {
    "topic": "Django ORM",
    "question": "What are the caveats of bulk_create and bulk_update?",
    "answer": "Bulk operations are efficient but may skip save methods, signals, per-object validation, and some automatic behavior depending on database and Django version.",
    "example": "BookingLineItem.objects.bulk_create(items)",
    "interviewPrompt": "When would you avoid bulk_create even if it is faster?"
  },
  {
    "topic": "Django ORM",
    "question": "Why use database constraints in addition to Django validation?",
    "answer": "Django validation can be bypassed by scripts, concurrent requests, or direct database writes. Database constraints enforce correctness at the source of truth.",
    "example": "UniqueConstraint(fields=['tour', 'external_reference'], name='unique_tour_reference')",
    "interviewPrompt": "What invariant in a booking system belongs in the database?"
  },
  {
    "topic": "select_related vs prefetch_related",
    "question": "What does select_related do?",
    "answer": "select_related follows single-valued relationships using SQL joins, usually ForeignKey and OneToOneField.",
    "example": "Booking.objects.select_related('customer', 'tour')",
    "interviewPrompt": "When is select_related the right choice?"
  },
  {
    "topic": "select_related vs prefetch_related",
    "question": "What does prefetch_related do?",
    "answer": "prefetch_related fetches related objects in separate queries and joins them in Python. It is used for many-to-many and reverse foreign key relationships.",
    "example": "Tour.objects.prefetch_related('bookings')",
    "interviewPrompt": "Why does prefetch_related work better than select_related for many bookings per tour?"
  },
  {
    "topic": "select_related vs prefetch_related",
    "question": "Can select_related and prefetch_related be used together?",
    "answer": "Yes. Use select_related for single-valued relationships and prefetch_related for multi-valued relationships in the same QuerySet.",
    "example": "Booking.objects.select_related('customer').prefetch_related('line_items')",
    "interviewPrompt": "How would you optimize a booking detail page with customer and line items?"
  },
  {
    "topic": "select_related vs prefetch_related",
    "question": "What is Prefetch used for?",
    "answer": "Prefetch lets you customize the queryset used for prefetching, including filters, ordering, nested selects, and assigning results to a custom attribute.",
    "example": "Prefetch('bookings', queryset=Booking.objects.filter(status='confirmed'), to_attr='confirmed_bookings')",
    "interviewPrompt": "How would you prefetch only confirmed bookings for each tour?"
  },
  {
    "topic": "N+1 Queries",
    "question": "What is an N+1 query problem?",
    "answer": "It happens when code performs one query to load a list and then one additional query per item to load related data.",
    "example": "Looping over bookings and accessing booking.customer.email without select_related can run one query per booking.",
    "interviewPrompt": "How would you recognize an N+1 issue from logs?"
  },
  {
    "topic": "N+1 Queries",
    "question": "How do you fix an N+1 query for foreign keys?",
    "answer": "Use select_related so Django retrieves the related rows in the original query using joins.",
    "example": "Booking.objects.select_related('customer')",
    "interviewPrompt": "A bookings list shows each customer's name. What ORM change would you make?"
  },
  {
    "topic": "N+1 Queries",
    "question": "How do you fix an N+1 query for reverse relationships?",
    "answer": "Use prefetch_related so Django fetches the related collection in a small number of additional queries.",
    "example": "Tour.objects.prefetch_related('bookings')",
    "interviewPrompt": "A tours page shows each tour's bookings. What would you use?"
  },
  {
    "topic": "N+1 Queries",
    "question": "How can serializers or templates hide N+1 queries?",
    "answer": "They may access related fields implicitly while rendering each object, causing extra queries outside the view logic.",
    "example": "A serializer field source='customer.email' can trigger a query per booking.",
    "interviewPrompt": "How would you debug a slow Django REST Framework list endpoint?"
  },
  {
    "topic": "N+1 Queries",
    "question": "How can tests catch N+1 regressions?",
    "answer": "Use query count assertions around representative views or service calls, and include enough rows to expose per-row query growth.",
    "example": "with self.assertNumQueries(3): self.client.get('/bookings/')",
    "interviewPrompt": "What test would prevent a bookings page from growing from 3 queries to 103?"
  },
  {
    "topic": "N+1 Queries",
    "question": "What is over-prefetching?",
    "answer": "Over-prefetching loads related data that is not needed, increasing memory usage and query cost.",
    "example": "Prefetching every line item and payment for a list that only displays booking IDs is wasteful.",
    "interviewPrompt": "How do you balance query count reduction against memory usage?"
  },
  {
    "topic": "Postgres Indexes",
    "question": "What is a B-tree index good for?",
    "answer": "A B-tree index is the default Postgres index type and works well for equality, range queries, sorting, and prefix matching in some cases.",
    "example": "CREATE INDEX ON bookings (start_time);",
    "interviewPrompt": "What kind of index would you add for filtering bookings by start time?"
  },
  {
    "topic": "Postgres Indexes",
    "question": "How does composite index column order matter?",
    "answer": "A composite index is most useful when queries filter or sort by the leading columns of the index.",
    "example": "An index on (tour_id, start_time) helps WHERE tour_id = 1 ORDER BY start_time.",
    "interviewPrompt": "Would an index on (start_time, tour_id) help the same query equally?"
  },
  {
    "topic": "Postgres Indexes",
    "question": "What is a partial index?",
    "answer": "A partial index indexes only rows matching a condition, making it smaller and faster for common filtered queries.",
    "example": "CREATE INDEX ON bookings (tour_id, start_time) WHERE status = 'confirmed';",
    "interviewPrompt": "Why might confirmed bookings deserve a partial index?"
  },
  {
    "topic": "Postgres Indexes",
    "question": "What is a unique index or unique constraint used for?",
    "answer": "It enforces uniqueness at the database level and can also speed lookups by the unique columns.",
    "example": "UniqueConstraint(fields=['supplier_id', 'external_id'], name='unique_supplier_external_booking')",
    "interviewPrompt": "How would you prevent duplicate bookings from an external provider?"
  },
  {
    "topic": "Postgres Indexes",
    "question": "What is an expression index?",
    "answer": "An expression index indexes the result of an expression rather than a raw column.",
    "example": "CREATE INDEX ON customers (lower(email));",
    "interviewPrompt": "How would you optimize case-insensitive email lookup?"
  },
  {
    "topic": "Postgres Indexes",
    "question": "When can an index hurt performance?",
    "answer": "Indexes add write overhead, consume storage, and may not help low-selectivity queries. Too many indexes slow inserts and updates.",
    "example": "Indexing a boolean status with a 50/50 distribution may not help much.",
    "interviewPrompt": "How would you decide whether an index is worth adding?"
  },
  {
    "topic": "Postgres Indexes",
    "question": "What does EXPLAIN ANALYZE do?",
    "answer": "It shows the query plan and actual execution timing, helping verify whether an index is used and where time is spent.",
    "example": "EXPLAIN ANALYZE SELECT * FROM bookings WHERE tour_id = 42;",
    "interviewPrompt": "How would you prove an index improved a slow query?"
  },
  {
    "topic": "Transactions",
    "question": "What does transaction.atomic do in Django?",
    "answer": "It wraps a block of code in a database transaction so all operations commit together or roll back together on error.",
    "example": "with transaction.atomic(): create_booking(); charge_customer();",
    "interviewPrompt": "Why should booking creation and inventory decrement be atomic?"
  },
  {
    "topic": "Transactions",
    "question": "What is transaction isolation?",
    "answer": "Isolation controls how concurrent transactions see each other's changes. Stronger isolation reduces anomalies but can increase contention.",
    "example": "Postgres defaults to READ COMMITTED, where each statement sees committed data at statement start.",
    "interviewPrompt": "What race can still happen under READ COMMITTED?"
  },
  {
    "topic": "Transactions",
    "question": "What is a race condition?",
    "answer": "A race condition occurs when correctness depends on timing between concurrent operations.",
    "example": "Two users both see one remaining seat and both book it before either update is committed.",
    "interviewPrompt": "How would you prevent overselling the last available spot?"
  },
  {
    "topic": "Race Conditions",
    "question": "How can conditional updates prevent races?",
    "answer": "They let the database enforce the precondition in the update statement itself.",
    "example": "Tour.objects.filter(id=tour_id, remaining__gt=0).update(remaining=F('remaining') - 1)",
    "interviewPrompt": "Why is this safer than checking remaining first?"
  },
  {
    "topic": "Row Locking",
    "question": "What does select_for_update do?",
    "answer": "It locks selected rows until the transaction ends, preventing concurrent transactions from modifying or locking them incompatibly.",
    "example": "Tour.objects.select_for_update().get(id=tour_id)",
    "interviewPrompt": "When would you lock a tour inventory row?"
  },
  {
    "topic": "Row Locking",
    "question": "What is a deadlock?",
    "answer": "A deadlock happens when transactions wait on each other in a cycle. Databases usually abort one transaction.",
    "example": "Transaction A locks tour 1 then tour 2, while transaction B locks tour 2 then tour 1.",
    "interviewPrompt": "How can consistent lock ordering reduce deadlocks?"
  },
  {
    "topic": "Row Locking",
    "question": "What does skip_locked do?",
    "answer": "skip_locked tells Postgres to skip rows already locked by another transaction, useful for concurrent workers processing jobs.",
    "example": "Job.objects.select_for_update(skip_locked=True).filter(status='queued')[:10]",
    "interviewPrompt": "When would skip_locked be useful in a booking platform?"
  },
  {
    "topic": "Row Locking",
    "question": "What does nowait do with row locks?",
    "answer": "nowait causes the query to fail immediately if a row is already locked instead of waiting.",
    "example": "Inventory.objects.select_for_update(nowait=True).get(id=inventory_id)",
    "interviewPrompt": "When is failing fast better than waiting for a lock?"
  },
  {
    "topic": "Transactions",
    "question": "What should not happen inside a long transaction?",
    "answer": "Avoid slow network calls, user interaction, or expensive work while holding locks because it increases contention and deadlock risk.",
    "example": "Do not hold an inventory lock while waiting on a slow external payment API if the design can reserve first and finalize later.",
    "interviewPrompt": "How would you design around payment latency?"
  },
  {
    "topic": "Transactions",
    "question": "What is idempotency and why does it matter?",
    "answer": "Idempotency means safely handling retries without duplicating side effects. It matters for payments, booking creation, and webhooks.",
    "example": "Use an idempotency key to ensure a retried booking request returns the original booking instead of creating another.",
    "interviewPrompt": "How would you make a create booking endpoint retry-safe?"
  },
  {
    "topic": "Booking System Design",
    "question": "What are core entities in a booking system?",
    "answer": "Common entities include supplier, activity, availability slot, inventory, customer, booking, booking items, payment, cancellation, and audit events.",
    "example": "A tour has many availability slots; a booking reserves seats on one slot.",
    "interviewPrompt": "Sketch a minimal booking data model."
  },
  {
    "topic": "Booking System Design",
    "question": "How would you prevent overselling inventory?",
    "answer": "Use database-enforced constraints, atomic updates, row locks, or reservation records with unique constraints depending on the inventory model.",
    "example": "Decrement remaining seats only with WHERE remaining >= requested_quantity.",
    "interviewPrompt": "How would your design behave under 100 simultaneous booking attempts?"
  },
  {
    "topic": "Booking System Design",
    "question": "What is a reservation hold?",
    "answer": "A temporary reservation hold blocks inventory for a short period while checkout completes, then expires if payment is not completed.",
    "example": "Hold 2 seats for 10 minutes, then release them if no confirmed booking exists.",
    "interviewPrompt": "How would you expire stale holds safely?"
  },
  {
    "topic": "Booking System Design",
    "question": "How would you model cancellations?",
    "answer": "Use explicit booking states and cancellation records rather than deleting bookings, preserving auditability and payment history.",
    "example": "Booking status moves from confirmed to canceled, with canceled_at and canceled_by.",
    "interviewPrompt": "Why is hard deletion dangerous for bookings?"
  },
  {
    "topic": "Booking System Design",
    "question": "How would you handle booking state transitions?",
    "answer": "Define valid transitions and centralize transition logic in a service layer or state-machine-like function.",
    "example": "pending -> confirmed -> canceled is valid; canceled -> confirmed may require special admin flow.",
    "interviewPrompt": "Where would you enforce valid booking status changes?"
  },
  {
    "topic": "Booking System Design",
    "question": "How would you design availability search?",
    "answer": "Precompute or efficiently query availability by activity, date range, capacity, timezone, and status, with indexes matching common filters.",
    "example": "Search slots WHERE activity_id = ? AND start_time BETWEEN ? AND ? AND remaining >= party_size.",
    "interviewPrompt": "What indexes would support availability search?"
  },
  {
    "topic": "Booking System Design",
    "question": "How should time zones be handled?",
    "answer": "Store timestamps in UTC, store the supplier or activity timezone separately, and convert at display and scheduling boundaries.",
    "example": "A tour in Hawaii should display local start time even if the database stores UTC.",
    "interviewPrompt": "What can go wrong around daylight saving time?"
  },
  {
    "topic": "Booking System Design",
    "question": "How would you handle external supplier integrations?",
    "answer": "Use idempotent sync jobs, external IDs, retry policies, reconciliation, clear failure states, and audit logs.",
    "example": "A webhook with external_booking_id updates the matching local booking once.",
    "interviewPrompt": "How would you protect against duplicate webhooks?"
  },
  {
    "topic": "Booking System Design",
    "question": "How would you design booking auditability?",
    "answer": "Record important events with actor, timestamp, previous state, new state, and source system.",
    "example": "BookingEvent(type='status_changed', actor='admin', from='pending', to='confirmed')",
    "interviewPrompt": "What events would you audit in a booking lifecycle?"
  },
  {
    "topic": "Booking System Design",
    "question": "How would you handle payments in booking flow?",
    "answer": "Separate payment authorization or capture from booking state, use idempotency keys, and reconcile asynchronous payment events.",
    "example": "Create pending booking, authorize payment, then confirm booking after successful payment event.",
    "interviewPrompt": "What happens if payment succeeds but the confirmation request times out?"
  },
  {
    "topic": "Booking System Design",
    "question": "How would you make booking APIs reliable?",
    "answer": "Use validation, idempotency, atomic database operations, clear state transitions, structured errors, monitoring, and retry-safe external calls.",
    "example": "POST /bookings accepts an Idempotency-Key header and returns the same booking for retries.",
    "interviewPrompt": "What failure modes should a create booking endpoint handle?"
  },
  {
    "topic": "Booking System Design",
    "question": "How would you scale reads for availability-heavy traffic?",
    "answer": "Use efficient indexes, caching where correctness allows, denormalized availability summaries, pagination, and careful cache invalidation.",
    "example": "Cache public availability for low-risk windows but invalidate when inventory changes.",
    "interviewPrompt": "What booking data is safe or unsafe to cache?"
  },
  {
    "topic": "Testing Strategy",
    "question": "What should unit tests cover in a booking system?",
    "answer": "Unit tests should cover pure business rules such as status transitions, pricing calculations, validation, and cancellation rules.",
    "example": "Test that a canceled booking cannot be canceled again without raising a domain error.",
    "interviewPrompt": "Which booking rules would you test without hitting the database?"
  },
  {
    "topic": "Testing Strategy",
    "question": "What should integration tests cover?",
    "answer": "Integration tests should cover database behavior, constraints, transactions, ORM queries, API endpoints, and interactions between services.",
    "example": "Test that duplicate external booking IDs are rejected by the database constraint.",
    "interviewPrompt": "What bugs only show up with a real database?"
  },
  {
    "topic": "Testing Strategy",
    "question": "How would you test race conditions?",
    "answer": "Use transactional tests, concurrent workers or threads, and database assertions to prove only one operation succeeds when inventory is limited.",
    "example": "Start two concurrent booking attempts for one remaining seat and assert one succeeds.",
    "interviewPrompt": "How would you prove your oversell fix works?"
  },
  {
    "topic": "Testing Strategy",
    "question": "How would you test N+1 query prevention?",
    "answer": "Create multiple related rows and assert the endpoint or service uses a fixed number of queries.",
    "example": "Create 20 bookings and assert the list endpoint stays under a small query count.",
    "interviewPrompt": "Why is testing with one row insufficient?"
  },
  {
    "topic": "Testing Strategy",
    "question": "What are good API test cases for booking creation?",
    "answer": "Test valid creation, invalid inputs, insufficient inventory, duplicate idempotency keys, payment failure, authorization, and concurrent requests.",
    "example": "POST party_size=0 should return a validation error.",
    "interviewPrompt": "What edge cases would you include for create booking?"
  },
  {
    "topic": "Testing Strategy",
    "question": "When should you mock external services?",
    "answer": "Mock external services in unit and most integration tests, but keep contract tests or sandbox tests for the integration boundary.",
    "example": "Mock payment provider success and failure responses.",
    "interviewPrompt": "How do you avoid tests that are both flaky and unrealistic?"
  },
  {
    "topic": "Testing Strategy",
    "question": "What is a regression test?",
    "answer": "A regression test captures a previously broken behavior so the same bug does not return.",
    "example": "After fixing duplicate booking retries, add a test that sends the same idempotency key twice.",
    "interviewPrompt": "How do you turn a production bug into a useful test?"
  },
  {
    "topic": "Testing Strategy",
    "question": "What should end-to-end tests cover?",
    "answer": "E2E tests should cover critical user journeys across frontend and backend, not every edge case.",
    "example": "Search availability, select a tour, enter customer info, submit booking, and see confirmation.",
    "interviewPrompt": "Which flows deserve E2E coverage in a booking platform?"
  },
  {
    "topic": "Angular Basics",
    "question": "What is an Angular component?",
    "answer": "A component combines a TypeScript class, template, and styles to control a piece of UI.",
    "example": "BookingCardComponent displays booking status, customer name, and actions.",
    "interviewPrompt": "How would you break a booking admin page into components?"
  },
  {
    "topic": "Angular Basics",
    "question": "What is an Angular service?",
    "answer": "A service holds shared logic or data access and is injected into components using dependency injection.",
    "example": "BookingService calls the bookings API and returns Observables.",
    "interviewPrompt": "Why put API calls in a service instead of directly in a component?"
  },
  {
    "topic": "Angular Basics",
    "question": "What are Observables used for in Angular?",
    "answer": "Observables represent asynchronous streams, commonly HTTP responses, form changes, and event streams.",
    "example": "this.bookingService.list().subscribe(bookings => this.bookings = bookings)",
    "interviewPrompt": "How are Observables different from Promises?"
  },
  {
    "topic": "Angular Basics",
    "question": "What is reactive forms in Angular?",
    "answer": "Reactive forms define form state and validation in TypeScript using FormGroup, FormControl, and validators.",
    "example": "new FormControl('', [Validators.required, Validators.email])",
    "interviewPrompt": "Why might reactive forms be better for a complex checkout form?"
  },
  {
    "topic": "Angular Basics",
    "question": "What is an Angular pipe?",
    "answer": "A pipe transforms values for display in templates.",
    "example": "{{ booking.startTime | date:'short' }}",
    "interviewPrompt": "How would you format money and dates in a booking UI?"
  },
  {
    "topic": "Angular Basics",
    "question": "What is route guarding?",
    "answer": "Route guards control whether users can enter or leave routes based on authentication, authorization, unsaved changes, or other checks.",
    "example": "An admin route requires an authenticated user with staff permissions.",
    "interviewPrompt": "How would you protect an internal booking management page?"
  },
  {
    "topic": "Angular Basics",
    "question": "How should Angular handle loading and error states?",
    "answer": "Components should explicitly represent loading, success, empty, and error states so the UI remains predictable.",
    "example": "Show a spinner while bookings load, an empty message if none exist, and a retry button on error.",
    "interviewPrompt": "What states should a bookings list page support?"
  },
  {
    "topic": "AWS EC2",
    "question": "What is EC2?",
    "answer": "EC2 provides virtual machines where you manage the operating system, runtime, scaling, patching, and deployment configuration.",
    "example": "Run a Django app on an EC2 instance behind a load balancer.",
    "interviewPrompt": "When would EC2 be preferable to Lambda?"
  },
  {
    "topic": "AWS ECS",
    "question": "What is ECS?",
    "answer": "ECS is AWS's container orchestration service for running Docker containers on EC2 or Fargate.",
    "example": "Run Django web containers and Celery worker containers as separate ECS services.",
    "interviewPrompt": "How would you deploy a containerized full-stack app on ECS?"
  },
  {
    "topic": "AWS Lambda",
    "question": "What is Lambda?",
    "answer": "Lambda runs serverless functions in response to events without managing servers, best for short-lived, event-driven workloads.",
    "example": "Process an S3 upload or handle a lightweight webhook.",
    "interviewPrompt": "What are Lambda's limitations for long-running jobs?"
  },
  {
    "topic": "AWS S3",
    "question": "What is S3 used for?",
    "answer": "S3 is object storage used for files, static assets, exports, backups, and data exchange.",
    "example": "Store booking confirmation PDFs or uploaded supplier images.",
    "interviewPrompt": "How would you safely serve private files from S3?"
  },
  {
    "topic": "AWS RDS",
    "question": "What is RDS?",
    "answer": "RDS is managed relational database hosting for engines such as Postgres and MySQL, handling backups, patching, replicas, and failover options.",
    "example": "Run the application's Postgres database on RDS.",
    "interviewPrompt": "What operational benefits does RDS provide over self-managed Postgres?"
  },
  {
    "topic": "AWS Basics",
    "question": "What is a load balancer used for?",
    "answer": "A load balancer distributes traffic across healthy application instances or containers and provides a stable entry point.",
    "example": "An Application Load Balancer routes HTTPS traffic to ECS tasks.",
    "interviewPrompt": "How does a load balancer help during deployments?"
  },
  {
    "topic": "AWS Basics",
    "question": "What is IAM?",
    "answer": "IAM manages identities and permissions for AWS users, roles, and services using least-privilege policies.",
    "example": "An ECS task role grants read access to one S3 bucket.",
    "interviewPrompt": "Why should applications use IAM roles instead of hardcoded AWS keys?"
  },
  {
    "topic": "AWS Basics",
    "question": "What is CloudWatch?",
    "answer": "CloudWatch collects logs, metrics, and alarms for AWS resources and applications.",
    "example": "Alert when ECS task errors spike or RDS CPU remains high.",
    "interviewPrompt": "What metrics would you monitor for a booking API?"
  },
  {
    "topic": "Terraform",
    "question": "What is Terraform?",
    "answer": "Terraform is infrastructure as code. It declares cloud resources in configuration files and applies changes through plans.",
    "example": "Define an ECS service, RDS instance, S3 bucket, and IAM roles in Terraform.",
    "interviewPrompt": "Why is Terraform safer than manually clicking resources in AWS?"
  },
  {
    "topic": "Terraform",
    "question": "What is terraform plan used for?",
    "answer": "terraform plan previews infrastructure changes before applying them, helping catch accidental creates, updates, and destroys.",
    "example": "Run terraform plan before changing an RDS instance class.",
    "interviewPrompt": "What would you look for before approving a Terraform plan?"
  },
  {
    "topic": "Behavioral Stories",
    "question": "Tell me about a time you debugged a difficult production issue.",
    "answer": "Use STAR: describe the situation, your task, the actions you took, and the measurable result. Emphasize structured debugging and communication.",
    "example": "A booking endpoint slowed down due to N+1 queries; I reproduced it, added query-count tests, used select_related, and reduced latency.",
    "interviewPrompt": "Walk me through your debugging process under pressure."
  },
  {
    "topic": "Behavioral Stories",
    "question": "Tell me about a time you handled a race condition or data consistency bug.",
    "answer": "Focus on identifying the invariant, reproducing the concurrent failure, applying a database-backed fix, and adding regression tests.",
    "example": "Two checkout requests could reserve the final seat; I changed the update to be atomic and tested concurrent attempts.",
    "interviewPrompt": "How did you know the fix was correct?"
  },
  {
    "topic": "Behavioral Stories",
    "question": "Tell me about a time you disagreed with a technical decision.",
    "answer": "Show that you listened, clarified tradeoffs, used evidence, and committed once a decision was made.",
    "example": "I proposed a simpler service-layer change instead of introducing a new dependency, using performance data and maintenance cost.",
    "interviewPrompt": "How do you handle disagreement with a senior engineer?"
  },
  {
    "topic": "Behavioral Stories",
    "question": "Tell me about a time you improved code quality.",
    "answer": "Describe the quality problem, the smallest useful improvement, how you avoided risky rewrites, and how tests protected behavior.",
    "example": "I extracted duplicated booking validation into one service and added focused tests around edge cases.",
    "interviewPrompt": "How do you decide when refactoring is worth it?"
  },
  {
    "topic": "Behavioral Stories",
    "question": "Tell me about a time you learned a new technology quickly.",
    "answer": "Explain how you identified what mattered, built a small working example, asked targeted questions, and applied it to the project.",
    "example": "I learned enough Angular reactive forms to ship a checkout form with validation and clear error states.",
    "interviewPrompt": "How do you ramp up when joining an unfamiliar codebase?"
  },
  {
    "topic": "Behavioral Stories",
    "question": "Tell me about a time you balanced speed and correctness.",
    "answer": "Show judgment: identify risk, choose a scoped solution, communicate tradeoffs, and leave the system safer than you found it.",
    "example": "For an urgent booking bug, I shipped a minimal transaction fix with regression tests, then proposed follow-up monitoring.",
    "interviewPrompt": "How do you decide what must be fixed now versus later?"
  }
]
```
