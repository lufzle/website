---
title: "MCP as the unified protocol for agents and apps"
summary: "How MCP connects agents and apps, what changed in the July specification, and whether one protocol can serve both."
date: "6 Aug 2026"
readTime: "9 min"
lede: "Two years ago I argued that APIs, UIs and CLIs were converging into a single agent-facing surface. The July MCP spec is the closest thing yet to that surface."
order: 2
---

![An architectural diagram on grid paper showing natural user input, CLI terminal, and code converging into an ACI diamond, which connects southbound through structured pipes to protocols, tools, and domain services](/assets/posts/mcp-unified-protocol-agents-apps/hero-architecture.jpg)


I published that argument in September 2024
[[1]](https://dev.to/dariofarzati/from-apis-to-acis-the-next-evolution-in-software-interaction-4d39),
two months before Anthropic released the Model Context Protocol. I called the surface
an Application Conversational Interface: one intent-based door for developers, end
users, and agents, where callers reach the underlying domain without juggling three
separate integration stacks. MCP is what the ecosystem built, and its trajectory is
practical evidence that this convergence is underway.

## Where the contract actually belongs

The 2024 claim was about the friction of translation layers. In traditional software,
you write a domain, then an API on top of it, then a user interface that calls the API,
and often a CLI for operational work. Each layer has its own authors, syntax, and
accidental complexity. A significant portion of engineering time goes toward translating
data between these layers, an exercise that is frequently more tedious than the domain
logic itself.

Language models started to collapse both ends of that pipeline. A model could accept
unstructured natural language and emit structured JSON, an HTML table, or an interactive
form. That looked like an interface capable of minting other interfaces on demand. I took
it as a sign that the middle layer would disappear: you would state an intent, and the
system would interpret the request and return the result in whatever shape the caller
needed at that moment.

The nuance that gets lost in that description is where the contract lives. In the
traditional architecture, the contract is exposed northbound to every consumer. The
human user has to fill out rigid visual forms. The external developer has to read API
documentation, learn endpoints, and write client SDKs. The operator has to memorize CLI
flags. Every caller is forced to understand the internal structure of the interface
before doing useful work.

An Application Conversational Interface folds that northbound exposure. The caller no
longer needs to study schemas, endpoints, or parameter types. Whether the consumer is a
person typing a sentence, an automated workflow, or an external script, communication
happens through intent.

The contract retreats southbound. Inside the boundary of the system, domain logic
cannot operate on pure ambiguity. A financial ledger requires atomic zero-sum balancing,
databases require strict schema invariants, and security systems require explicit
authorization boundaries. The model acts as the universal adapter between the two
worlds, absorbing high-entropy intent from callers northbound while executing against
deterministic, structured contracts southbound.

## The protocol that showed up

MCP shipped in November 2024 as JSON-RPC for connecting models to external systems. The
first spec already had three server primitives: tools the model can call, resources it
can read, and prompts it can fill
[[2]](https://modelcontextprotocol.io/specification/2024-11-05). The ecosystem treated it
as tools: hosts grew a list of functions with JSON Schema arguments, and for a year that
was the product.

June 2025 added elicitation: a server, mid-call, can ask the client to collect
structured input from a person
[[3]](https://modelcontextprotocol.io/specification/2025-06-18/client/elicitation).
November added URL-mode elicitation, so the sensitive part of that conversation can
leave the client and happen in a browser
[[4]](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation). The
same month, MCP Apps was proposed as an extension: a tool can point at a `ui://`
resource, and the host renders HTML in the conversation
[[5]](https://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/), which means
charts, forms, and players travel through the same pipe as the tool.

The July 2026 spec is the one that made this look like infrastructure
[[6]](https://blog.modelcontextprotocol.io/posts/2026-07-28/). They retired the
`initialize` handshake and the `Mcp-Session-Id` header. Each request now carries its
protocol version, client identity, and capabilities in `_meta`, so any request can
land on any instance behind a round-robin load balancer. Method and tool names travel
in `Mcp-Method` and `Mcp-Name`, so a gateway can route and meter without opening the
JSON body. A `tools/call` named `search` arrives as those two headers on a `POST /mcp`,
next to `MCP-Protocol-Version: 2026-07-28`. List responses from tools, prompts, and
resources carry `ttlMs` and `cacheScope`. Server-to-client asks that used to need a
held-open stream move to Multi Round-Trip Requests: the server returns `resultType:
"input_required"` with the questions it needs answered, and the client retries the
original call with the answers attached.

That is a request/response protocol with headers, cache hints, and an optional
`server/discover` call, which is to say it is the web pointed at agents. The MCP blog
puts Tier 1 SDK traffic at close to half a billion downloads a month, with the TypeScript
and Python SDKs each past a billion total [[6]](https://blog.modelcontextprotocol.io/posts/2026-07-28/).
Those are their numbers, and what I can see without them is the shape of the spec: you can
put this behind a load balancer on purpose, which you could not honestly say about a
sessionful JSON-RPC stream.

![An architectural diagram on grid paper showing the present state of MCP: Users, AI Agents, and External Systems interact with the Model & Host Runtime through intent, while the System Backend declares tools and pre-declared ui templates via an MCP Server](/assets/posts/mcp-unified-protocol-agents-apps/the-present-mcp.jpg)

This architecture provides the standardized southbound plumbing that allows an ACI to
work. Tools represent executable capabilities, resources provide documents, prompts store
reusable workflows, elicitation handles interactive clarification, and MCP Apps deliver
visual screens. The caller never touches these contracts directly; the model inspects the
catalog and translates intent into precise execution. What looked in 2024 like the
elimination of contracts was actually their relocation: hidden from the caller,
standardized for the model, and enforced by the domain.

## Auth is still next door

The July post is blunt: authorization is where implementers spend most of their
integration time [[6]](https://blog.modelcontextprotocol.io/posts/2026-07-28/). The
revision hardens the OAuth story: clients must validate the `iss` parameter before
redeeming a code, which closes an authorization-server mix-up. Credentials are bound to
the issuer that minted them. Dynamic Client Registration is deprecated in favor of
Client ID Metadata Documents, with DCR kept around for a while so existing clients do
not fall over. That is real work, and none of it is conversational: the agent does not
talk its way into a token, and auth remains a neighbor protocol you complete before you
call tools.

URL-mode elicitation is an admission of the same split. The spec forbids using the form
path for passwords, API keys, tokens, or payment credentials. The user leaves the
conversational surface, does the sensitive bit in a browser, and comes back, which is
the right security call and also the interface refusing to fold.

I wrote in 2024 about privacy as an open question for intent-based systems. Two years later, sensitive operations still route through standard URLs, and the protocol is designed to keep credentials entirely off the agent stream.

## State you can see

Dropping the session does not make the application stateless. The spec's advice is to
mint an explicit handle from a tool and have the model pass it back as an argument. The
model can see the handle, which is better than a session id hidden in the transport, and
it also means application state now lives in the prompt.

If the model loses the handle, you lose the thread; if it hallucinates one, you get a
confused tool. A developer debugging this ends up asking the model what it thinks the
handle is, which felt unthinkable in 2024 and routine today.

The original ACI sketch treated state as something the interface would keep for you, the
way a conversation does. MCP treats state as data, which is more predictable, and also
more work, and the work sits in the model, which is the part least equipped to guarantee
retention. Tasks, which started as an experiment and now live in an extension, are the
long-running version of that compromise: a durable handle, a polling loop, and an update
that still anchors state management to an explicit identifier.

## Who writes the screen

I wrote that every user would get the interface they needed, generated at request time,
visual or voice or text, with localization, accessibility, and the choice between a
dashboard and a sentence left to the model.

MCP Apps currently take a more controlled approach: pre-declared HTML where the server
authors a `ui://` resource, the tool references it in metadata, and the host renders it.
Elicitation schemas remain flat structures of primitive types so the client can generate
forms reliably. Someone still designs the components, and the protocol transports them.

![An architectural diagram on grid paper showing the destination ACI vision: Users and AI Agents interact with a central Agent-Computer Interface layer that dynamically synthesizes Ad-hoc UIs and Ad-hoc APIs at runtime against core backend domain logic](/assets/posts/mcp-unified-protocol-agents-apps/the-vision-aci.jpg)

Pre-declared HTML is the prerequisite stepping stone. Distributing `ui://`
resources through the same pipe as tools establishes the rendering plumbing while
generative models remain too slow and error-prone to synthesize interactive widgets safely
on every interaction. The vision of generative interfaces was not misplaced, but ahead
of execution costs. Standardizing the transport layer first means that as real-time UI
synthesis matures, moving from pre-declared templates to on-the-fly rendering becomes an
internal client upgrade without altering the protocol wire.

An intent handler without named methods remains impractical for high-volume production.
Wrapping a model around every routine domain operation adds compute cost and latency
that deterministic code avoids. MCP gained adoption because named tools with structured
schemas can be cached, routed at the edge, authorized with OAuth, and verified with
automated tests. The July release optimized that foundation for production traffic
without giving up the unified model. Terminal tools and IDEs have not vanished either;
their operators now interact with MCP servers through the exact same endpoints that
remote agents consume.

## What I would keep

I still think one surface is the right bet. Developers, users, and agents should not
need three stacks to reach the same domain. MCP is the closest working version of that
bet, and the July spec is the first one I would deploy the way I deploy an HTTP API.

The insight of the past two years is that contracts were never the problem. The waste
stemmed from exposing three duplicate contracts northbound to three different audiences.
By moving the contract southbound into an encapsulated, machine-readable protocol, the
surface facing outward becomes natural, unified, and intent-driven.

July's deprecations are a small version of the same lesson. Roots, sampling, and logging
are on a twelve-month clock, and new code should not adopt them. The protocol is allowed
to get smaller on purpose, which is how you know someone is using it.

## Sources

1. Dario Farzati. [From APIs to ACIs: The Next Evolution in Software Interaction](https://dev.to/dariofarzati/from-apis-to-acis-the-next-evolution-in-software-interaction-4d39), DEV, September 2024.
2. Model Context Protocol. [Specification, 2024-11-05](https://modelcontextprotocol.io/specification/2024-11-05).
3. Model Context Protocol. [Elicitation, 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/client/elicitation).
4. Model Context Protocol. [Elicitation, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation).
5. Model Context Protocol. [MCP Apps: Extending servers with interactive user interfaces](https://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/), 21 November 2025.
6. Model Context Protocol. [The 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/), 28 July 2026.
