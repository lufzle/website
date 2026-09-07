---
title: "Vibe coding a mature, live product"
summary: "What agent-driven development means inside an organization with real users, real incidents and a real backlog."
date: "17 Jul 2026"
readTime: "8 min"
lede: "Vibe coding a weekend project is one thing. Doing it on a product with paying customers, an on-call rotation and a five-year-old codebase is a different discipline."
order: 3
---

![A technical architectural blueprint on grid paper showing a cross-section of code sediment across multiple years, with an AI agent cursor inspecting the layers while an on-call pager monitors operational alerts](/assets/posts/vibe-coding-a-mature-live-product/hero-sediment.jpg)

The social media feed makes modern software development look solved. A developer opens an empty directory, types three sentences into Claude Code or Cursor, and watches twenty files appear in rapid succession. Within forty minutes, a functional web application is running in the browser, complete with authentication, database tables, and polished styling. The demonstration looks like magic because in greenfield development, every architectural decision is unencumbered. There are no active users to disrupt, no existing database migrations to preserve, no latency budgets to defend, and no colleagues who have to maintain the output six months later.

Bringing that workflow into a five-year-old production repository produces a very different afternoon. You open a terminal in a codebase with hundreds of thousands of lines of code, ask an agent for an update to a billing calculation or an asynchronous notification pipeline, and wait. The agent inspects several directories, writes clean and readable TypeScript that compiles on the first attempt, passes two trivial unit tests, and would drop database transactions under load if anyone pushed it to main.

The gap between those two outcomes has little to do with raw model intelligence. It stems from the fact that a mature codebase is not merely an assembly of source text. It is an accretion of historical trade-offs, organizational compromises, and operational constraints that rarely appear in the repository files.

## The sediment of a living repository

In a greenfield project, every architectural pattern is fresh and unified. In a five-year-old system built by dozens of engineers across multiple reorganizations, the codebase resembles sedimentary rock. You find the 2021 database access pattern living alongside the 2023 query builder, right next to the 2025 event-driven refactor that ran out of team budget halfway through the third quarter.

When you open Claude Code in a multi-year codebase and ask for a change in a couple of informal paragraphs, the model lacks the organizational context to interpret what it sees. An agent prompted to add an event handler reads across all these historical layers without knowing which pattern the team actually uses today and which one has been deprecated for eighteen months. It spots a legacy helper function, notices that it already has comprehensive inline documentation, and builds the new feature on top of it. A human engineer on the team would have recognized the trap instantly from conversations during sprint planning. The agent sees only text on disk and treats every file as equally canonical.

Documentation drift accelerates this confusion. Most production systems contain README files, architectural decision records, and inline docstrings written by engineers who left the company years ago. The code continued to evolve under the pressure of production outages, while the explanatory text sat untouched. When an agent parses the repository to orient itself, it treats these stale descriptions as ground truth, generating implementations that conform to obsolete 2024 designs and silently break against modern assumptions.

Traffic density introduces another blind spot. To an agent reading source code, a line in an obscure administrative export script looks identical to a line in the primary checkout path. Both are functions that accept an argument, execute a query, and return a response. In reality, a missing index or an extra database query inside an in-memory loop in the export script causes an unnoticeable three-second delay once a week. The exact same construct on the checkout path exhausts the connection pool within thirty seconds of a marketing campaign launch. An agent has no intuitive awareness of request volume, concurrency limits, or lock contention unless someone explicitly injects production telemetry into its prompt.

The most dangerous edits often target the ugliest code. Every mature repository has functions that look horrifying to anyone with an aesthetic sensibility: an arbitrary ten-millisecond sleep, a manual retry loop around an external call, or an awkward type cast that bypasses the compiler. Almost every one of those blemishes was added during an incident response to survive an upstream cloud provider bug, an undocumented rate limit in a third-party webhook, or a socket timeout in a legacy database driver. An agent instructed to clean up the module sees only technical debt. It removes the delay, streamlines the retry logic, and reopens the exact operational failure that the team diagnosed two years earlier.

Much of the architecture lives completely outside the git history. The connection pool ceiling configured in an AWS console, the Redis eviction policy chosen during a database migration, the partition keys in a Kafka cluster, and the feature flags managed through an external dashboard rarely exist in the application repository. When an agent modifies application code, it makes reasonable local assumptions about the operating environment that fail immediately when deployed to a distributed infrastructure. A change that passes every local check in Docker with sixteen gigabytes of workstation memory will trigger an immediate out-of-memory kill when deployed to a production container with a strict memory limit.

## The harness that makes speed safe

Greenfield prototyping relies on visual verification. You click a button in the browser, watch a modal open, check the developer console for red errors, and conclude that the task is finished. That loop fails on a system processing real money and real user data. Manual inspection cannot verify that a database transaction maintained serializable isolation under concurrent writes, or that customer data remained strictly partitioned across tenant boundaries.

When a repository lacks rigorous automated testing, delegating work to an agent becomes an exercise in wishful thinking. In greenfield vibecoding, a lack of tests feels like speed; in an active production system, a missing test suite turns every agentic prompt into Russian roulette. Many teams discover that their existing test suites measure line execution while leaving behavioral contracts completely unverified. If the suite consists of superficial unit tests that mock every external dependency, an agent can rewrite the underlying implementation, update the mock assertions to match its new code, and present a green build that breaks in production.

If an agent writes both the implementation and the tests within the same session, it inevitably authors tests that mirror its own incorrect assumptions. The verification suite validates that the code does what the agent intended, not what the business requires. To rely on an agent in a production environment, the verification harness must exist independently of the agent prompt.

Building that harness requires deterministic foundations:

1. Hermetic local environments that spin up temporary database instances using tools like Testcontainers, allowing agents to execute real queries against realistic schemas.
2. Strict type systems with compiler flags that forbid implicit any types and unvalidated casting.
3. Contract tests that validate integrations against live service boundaries using realistic wire protocols.
4. Behavioral regression suites that execute known edge cases before and after any code modification.

The human review gate also changes under agentic development. Reviewing code written by another person is a collaborative assessment of shared intent. You understand how your colleague thinks, and you discuss trade-offs in context. Reviewing hundreds of lines generated by an agent requires an entirely different level of vigilance.

The code produced by modern models is almost always well-formatted, cleanly structured, and accompanied by persuasive explanatory comments. The bugs are rarely syntax errors or missing variables. They are subtle semantic errors: forgotten database transaction rollbacks, off-by-one errors in pagination logic, or unhandled null states in nested payloads. Because the diff looks professional and the build passes, human reviewers experience cognitive fatigue and tend to approve changes with less scrutiny than they would give human work. That dynamic inverts the supposed speed advantages of automation.

## The pager test and team ownership

The fundamental test of any engineering practice is operational accountability. If a deployment triggers an alert at three in the morning on a Sunday, the on-call engineer cannot ask the language model why an algorithm was implemented in a specific way. The engineer who approved and merged the pull request has to diagnose the issue under pressure and decide whether to hotfix or roll back. Explaining in an incident post-mortem that an agent wrote the logic does not satisfy customers whose transactions failed.

When individuals generate large volumes of code without writing it character by character, organizational comprehension begins to decay. Writing software manually is an exercise in building a mental model. In the process of drafting functions, debugging test failures, and refactoring interfaces, an engineer learns where the system bends and where it breaks. If an engineer merely prompts an agent and skims the output, that mental model never forms. The team retains the artifact while losing the institutional knowledge of how it behaves.

The social reality of an engineering organization is what separates real systems from the solopreneur demo. A solo creator on social media can afford to drop a table, wipe state, or take a half-day outage while experimenting with a new feature. In an organization supporting enterprise contracts, service level agreements, and data audits, code is a liability that must be maintained across multiple years and shared among dozens of colleagues.

The teams that use agents productively on mature products follow a disciplined protocol. They restrict agent tasks to small, isolated boundaries with clear inputs and outputs, avoiding open-ended requests to refactor entire subsystems. They write the specifications and test assertions before asking the model to touch the implementation. And they treat the agent as a fast junior contributor whose code must be understood, defended, and owned by the human author before it reaches production.

The pace of text generation was never the limiting factor in software development. The difficult work remains what it has always been: understanding customer requirements, anticipating failure modes, maintaining systemic coherence, and taking personal responsibility for what runs in production.
