---
title: "The Graph Is the Easy Part"
summary: "One short interview produced two incompatible records, and both passed every check. What two weeks of failures taught me about a graph that knows its limits."
date: "28 Aug 2026"
readTime: "13 min"
lede: "The yard scanner, the gate reader and ‘the arch’ were one device. Two extractions from the same seven utterances did not agree. Both passed every check."
order: 1
---

![A tidy node-and-edge graph in black ink on grid paper, with one dashed red edge leading to a faintly outlined node in the lower right](/assets/posts/the-graph-is-the-easy-part/hero-graph.png)

The engineer called it the yard scanner. It was a Zebra FX9600 at the gate, reading the
tags on every pallet that left. The owner called it the gate reader. Some of the
warehouse crew called it “the arch.” The interview made one point unusually clear: all
three names meant the same device.

I used that seven-utterance interview to test a system I had built in an afternoon. I
had records, nodes, edges, a vector index and a query that returned a plausible answer.
Then I ran the interview through extraction twice.

The two runs disagreed seven times across three records. Two claims were phrased
differently, and each run found claims the other missed. One split an idea that the
other kept whole. One created a record and a link that did not exist in the other run.
The most serious difference was smaller: one thing had entered under two names.

Both versions conformed to the same registry, and each was internally consistent.
Every check was green.

I am building something I will call the record: a system that interviews people, checks
claims against their sources and answers questions about what it has learned. Models
help extract claims, search for evidence and judge whether a source supports them. They
never directly write the answer that a reader sees. Every printed value comes from a
deterministic resolver reading recorded frontmatter.

That separation was meant to make the answers dependable. The double extraction showed
what it could not do. Either record set would travel through the rest of the system
cleanly, even though each described the conversation differently. Determinism could
preserve a mistake as faithfully as it preserved a fact.

## What the checks never asked

Graphs are generous. Give one a legal node, edge or property and it will store it. It
does not know that two identifiers name the same thing, that five sources copied one
another, or that a new claim inherited an old date. Those are facts about the world
outside the graph.

My checks knew the registry and rejected unknown predicates, malformed evidence,
illegal relationships and contradictory live claims in the same slot. They could tell
whether a record had a valid shape. The extraction experiment asked a different
question: did that shape still refer to the world it came from?

The answer was unknowable from either graph alone. The convergence tool could report
that the two runs differed, but it could not pick the right one. That choice requires
knowledge of the domain or another source, so it belongs to a person.

This became the test for every failure that followed. I looked at what had passed, what
was still wrong, and which decision the machinery had quietly made without authority.

## One thing entered twice

A duplicate node is a peculiar failure because nothing has to break. Search for either
version and the result looks reasonable. Traverse from either and its neighbours make
sense. The corpus is simply wrong about how many things exist.

The extraction literature calls this canonicalisation. An open knowledge base does not
inherently know that “Barack Obama” and “Obama” refer to one person, so it can store
both as separate entities [[6]](https://arxiv.org/abs/1902.00172). Newer methods improve
the clustering on some datasets and tie older methods on others
[[7]](https://aclanthology.org/2021.emnlp-main.811/). Those results measure how well
names are grouped. They do not establish that the resulting answers improve.

Production systems make different bets. One graph-memory method tells its resolution
prompt that duplicates can have different names
[[8]](https://arxiv.org/abs/2501.13956). Microsoft's GraphRAG merges entities with the
same title and type, and its paper describes exact string matching
[[9]](https://microsoft.github.io/graphrag/index/default_dataflow/)
[[4]](https://arxiv.org/abs/2404.16130). The Mem0 paper describes matching nodes by
embedding similarity [[22]](https://arxiv.org/abs/2504.19413), while its current
open-source documentation describes a content hash for exact duplicates and says graph
memory was removed from that edition
[[23]](https://docs.mem0.ai/migration/oss-v2-to-v3). Exact strings can miss aliases,
while similarity can join two different things; either error can remain invisible.

Medicine and biology gave me a better model. The UMLS Metathesaurus is organized around
concepts and links the many names used for one meaning across almost two hundred
vocabularies
[[10]](https://www.nlm.nih.gov/research/umls/knowledge_sources/metathesaurus/index.html).
SNOMED CT keeps a stable concept separate from its full name, preferred term and
synonyms; the preferred term can vary by language
[[11]](https://docs.snomed.org/snomed-ct-specifications/snomed-ct-editorial-guide/readme/authoring/general-naming-conventions/descriptions/synonym).
The Gene Ontology goes further and types a synonym as exact, broad, narrow or related
[[12]](https://geneontology.org/docs/ontology-documentation/).

![Two circular nodes with the same fan of edges, joined by a grey pencil bracket and a question mark](/assets/posts/the-graph-is-the-easy-part/two-nodes-one-thing.png)

The useful distinction is simple: a concept has an identity; a name is one way people
refer to it. The modelling is mature, but automatic resolution remains uncertain.

I took the conservative route. Before a new concept is created, a lexical check compares
its name, aliases and summary with the concepts already in the record. An exact alias is
always proposed as a match; overlapping names or summaries can raise another candidate.
The check warns without blocking or merging. A person makes and records the decision.

Fellegi and Sunter called this the “possible link” class in their 1969 theory of record
linkage [[13]](https://www.cs.cornell.edu/~shmat/courses/cs6434/fellegi-sunter.pdf). My
check is only a tripwire for that state. It can still miss two synonyms with no lexical
overlap, including “yard scanner” and “gate reader” if their summaries do not reveal the
connection. The uncertainty is visible, but entity resolution remains unfinished.

## The detector I deleted

Identity failed again when I made the schema more expressive.

A subject originally held one live claim for each predicate. I needed the same subject
to carry several facets of a predicate, so I added an `aspect` value inside its scope.
The first change took about an hour to implement. Records that had collided before
could now coexist under different aspect values, exactly as intended.

One of those collisions had been doing extra work. Two unrelated rules had landed in
one record. With no aspect to separate them, the uniqueness constraint rejected the
pair as an undeclared contradiction. That rejection was the only signal that the record
might contain two concepts. Once each rule had its own aspect, both validated.

Everything was still green.

I left a note on the constraint because its second job was easy to miss:

> An aspect key buys the ability to hold several facets of one subject and pays for it
> by switching off the signal that the subject was overloaded.

A constraint can enforce the rule you designed and expose a modelling error you never
named. The second service is fragile because nobody owns it. Add a discriminator and
the collision disappears; months later, the cost can be a corpus of concepts split or
combined in ways no query can detect.

I kept the scope field, closed the list of allowed aspect values and added a separate
check that compares claims across them. The original constraint had provided both
behaviours for free. Making them explicit cost more code, but it also gave each one a
name and an owner.

![A turnstile with an unchanged counter beside an open wooden side gate labelled scope, with figures walking through the side gate](/assets/posts/the-graph-is-the-easy-part/the-side-gate.png)

## Ninety seconds became two days

The next failure appeared in the sentence a person actually reads.

I recorded a decision that superseded an older claim in the same slot. Ninety seconds
later, I asked the record about it. The answer contained the new claim's text followed
by “Recorded 2 days ago.” The trace view showed the right claim and the right time.

The resolver had selected the new assertion. The display then took the recording date
from the first assertion in the slot, which was the one just superseded. The stored data
was sound and the resolution was sound. The answer made fresh knowledge look stale,
which is how useful information gets ignored.

Temporal database researchers distinguish two clocks. *Valid time* says when a fact
holds in the world. *Transaction time* says when the database learned or recorded it
[[14]](https://www2.cs.arizona.edu/~rts/pubs/TKDEJan99.pdf). A tariff can take effect in
January and reach the record in March. An auditor may later ask what the system believed
in February about the January tariff. One timestamp cannot answer that question.

Bitemporal databases preserve the distinction during deletion as well. XTDB closes the
old version's system-time interval so earlier versions remain available
[[15]](https://docs.xtdb.com/about/time-in-xtdb.html). Datomic records a retraction where
an ordinary database might remove data
[[16]](https://docs.datomic.com/datomic-overview.html). The past remains addressable
because closing an interval preserves the record.

![Two stacked timelines: a fact valid from January and a thinner bar for when the record learned it in March, cut by a vertical audit line](/assets/posts/the-graph-is-the-easy-part/two-clocks-one-fact.png)

My conformance gate did not catch the display bug. It ran the new implementation beside
its reference and required identical output. The reference contained the same faulty
line, so the two implementations agreed byte for byte. Everything was still green. A
check for divergence cannot expose a defect shared by both sides.

The answer now takes `recorded_at` from the assertion the resolver returned. Every
transaction timestamp comes from the system clock. Valid time remains a separate claim
about the world and comes from evidence about when the claim held.

## Five witnesses, one source

Agreement looked safer until I followed the edges back.

A graph can show five sources supporting one claim. If four copied the fifth, there is
one observation with five URLs. Counting the edges turns repetition into apparent
corroboration.

Researchers modelled source dependence as early as 2009. A false value can spread
through copying, after which agreement offers much less evidence
[[19]](http://www.vldb.org/pvldb/vol2/vldb09-pvldb47.pdf). The resolver therefore counts
independent sources behind the support. Repeated claims or links do not increase that
count.

![A central claim node with five incoming edges, four of the source nodes drawn as faded photocopies of the fifth](/assets/posts/the-graph-is-the-easy-part/five-edges-one-source.png)

The same issue becomes harder when sources truly disagree. A last-write-wins rule
discards an assertion when a replacement arrives. Averaging creates a value that nobody
supplied.
A confidence score in the interface appears more careful. In one evaluation, two
established truth-discovery methods produced a false positive rate of 1.0 on both
datasets; they predicted every value true
[[17]](http://vldb.org/pvldb/vol5/p550_bozhao_vldb2012.pdf).

I made contradiction a state in the record. A slot contains one resolved claim or an
explicit `UNKNOWN_CONTRADICTED` result with the competing values attached. The
intelligence community's analytic standards require analysts to consider contrary
information and expose significant differences in judgement to the reader
[[18]](https://www.dni.gov/files/documents/ICD/ICD-203.pdf).

This matters before an attacker appears, but an attacker makes the cost plain. One
retrieval-poisoning study achieved a 90 percent attack success rate with five malicious
texts per target question in a database of millions
[[21]](https://arxiv.org/abs/2402.07867). A fetched page, an interview claim and a schema
decision enter with different authority. If they become interchangeable nodes, that
distinction has already been lost.

## The node that was never created

Some failures remain outside every improved constraint.

I built an evaluation view that placed each answer beside all the records relevant to
its question. On the first reading, it found an answer that was sourced, stable and
silent on one third of what had been asked. The question requested what had been
answered or dropped since an earlier point. The response reported only the current
state. Nothing in it was false. A needed part was absent, and every mechanical check
passed.

I can query for claims marked unverified, contradicted or stale. I cannot query for a
node that was never created. Knowledge-base researchers describe completeness as a
property of a particular question because no practical knowledge base can equal the
whole truth [[20]](https://www.akbc.ws/2016/papers/10_Paper.pdf).

That means a coverage measure needs an expected set from outside the graph. Without
that denominator, the system is comparing what it found with what it found. A high
percentage says nothing about the missing third.

## The boundary I stopped trying to erase

The failures began to make sense when I gave the graph less authority.

The canonical record now lives in plain files. Claims retain their evidence, review
state, valid interval and recording time. A changed claim becomes a new assertion linked
to the old one. Preservation systems have used this object-and-relationship model for
decades [[1]](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf).

The record can also retain a claim that has not been verified. It labels the evidence as
unchecked or unverified and tells the reader. The refusal is narrower and more useful
than deletion: an untested claim cannot quietly acquire the standing of a fact.

The graph is a projection of those files. It can be discarded and rebuilt, one partition
at a time. When a claim is retired, rebuilding removes its projected edge without
rewriting the historical record.

![A translucent graph floating above a row of solid text files, with a single rebuild arrow pointing up from the files](/assets/posts/the-graph-is-the-easy-part/two-layer-diagram.png)

The boundary continues through the answer path. The index returns record keys to the
resolver, which reads the records and selects the live claims according to their
evidence and time. Once the same keys have been selected, its output is byte-identical
whether the graph is available or stopped. The index can change which records are
found; it cannot change what a selected record says.

That narrower job for the graph also changed retrieval. I had planned to begin every
search by walking the graph. Published results argued against making that the universal
default. On LoCoMo, a benchmark for memory over long conversations, graph-first systems
scored about 55–56 percent accuracy while ordinary retrieval, Mem0 and full-context
approaches scored 77–81 percent
[[2]](https://arxiv.org/abs/2601.07978). The authors of HippoRAG 2 likewise report that
earlier graph approaches fall below standard RAG on basic factual memory
[[3]](https://arxiv.org/abs/2502.14802).

Graphs earn their place on a different class of question. GraphRAG's strongest results
concern global questions about a corpus, evaluated for breadth and diversity
[[4]](https://arxiv.org/abs/2404.16130). I now classify questions as precise, multi-hop
or global. Plain retrieval starts all three classes in the current design. Graph
traversal can contribute to the last two, and the ranked lists are combined with
reciprocal rank fusion. That method needs
no training, and its original evaluation found that the exact constant was not critical
[[5]](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf).

The boundaries are deliberately plain. Extraction proposes claims, and evidence
supports them. A person decides ambiguous identity after reviewing the evidence. The
resolver handles time and authority, the graph finds paths, and the interface renders
the chosen claim. Each part can be tested against the kind of fact it is capable of
knowing.

## What green means now

The convergence tool still will not turn the two versions of that seven-utterance
interview into one. It reports the divergences, names the case where one thing received
two identifiers, and declines to say which extraction was right. That last step remains
a domain decision.

A green result now means that the records have a legal shape, their evidence can be
traced, and the system kept contradictions visible and decisions inside their authority.
Completeness still has to be measured for each question. Repetition still needs
provenance, and an unreviewed claim remains unconfirmed.

The graph took an afternoon. Teaching the surrounding system where to stop took two
weeks.

A graph will let you say more than you know. The work is in not saying it.

## Sources

1. Library of Congress. [PREMIS Data Dictionary for Preservation Metadata, v3.0](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf).
2. Wolff & Bennati. [Cost and Accuracy of Long-Term Memory in Distributed Multi-Agent Systems Based on Large Language Models](https://arxiv.org/abs/2601.07978), 2026.
3. Gutiérrez et al. [From RAG to Memory: Non-Parametric Continual Learning for Large Language Models (HippoRAG 2)](https://arxiv.org/abs/2502.14802), 2025.
4. Edge et al. [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130), 2024.
5. Cormack, Clarke & Büttcher. [Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf), SIGIR 2009.
6. Vashishth, Jain & Talukdar. [CESI: Canonicalizing Open Knowledge Bases using Embeddings and Side Information](https://arxiv.org/abs/1902.00172), WWW 2018.
7. Dash et al. [Open Knowledge Graphs Canonicalization using Variational Autoencoders](https://aclanthology.org/2021.emnlp-main.811/), EMNLP 2021.
8. Rasmussen et al. [Zep: A Temporal Knowledge Graph Architecture for Agent Memory](https://arxiv.org/abs/2501.13956), 2025.
9. Microsoft. [GraphRAG indexing dataflow](https://microsoft.github.io/graphrag/index/default_dataflow/).
10. National Library of Medicine. [UMLS Metathesaurus](https://www.nlm.nih.gov/research/umls/knowledge_sources/metathesaurus/index.html).
11. SNOMED International. [SNOMED CT Editorial Guide: preferred term](https://docs.snomed.org/snomed-ct-specifications/snomed-ct-editorial-guide/readme/authoring/general-naming-conventions/descriptions/preferred-term) and [synonym](https://docs.snomed.org/snomed-ct-specifications/snomed-ct-editorial-guide/readme/authoring/general-naming-conventions/descriptions/synonym).
12. Gene Ontology Consortium. [Ontology documentation: synonym scopes](https://geneontology.org/docs/ontology-documentation/).
13. Fellegi & Sunter. [A Theory for Record Linkage](https://www.cs.cornell.edu/~shmat/courses/cs6434/fellegi-sunter.pdf), JASA 1969.
14. Jensen & Snodgrass. [Temporal Data Management](https://www2.cs.arizona.edu/~rts/pubs/TKDEJan99.pdf), IEEE TKDE 1999.
15. XTDB. [Time in XTDB: bitemporality](https://docs.xtdb.com/about/time-in-xtdb.html).
16. Datomic. [Overview: retractions as facts](https://docs.datomic.com/datomic-overview.html).
17. Zhao et al. [A Bayesian Approach to Discovering Truth from Conflicting Sources for Data Integration](http://vldb.org/pvldb/vol5/p550_bozhao_vldb2012.pdf), VLDB 2012.
18. ODNI. [Intelligence Community Directive 203: Analytic Standards](https://www.dni.gov/files/documents/ICD/ICD-203.pdf).
19. Dong, Berti-Équille & Srivastava. [Integrating Conflicting Data: The Role of Source Dependence](http://www.vldb.org/pvldb/vol2/vldb09-pvldb47.pdf), VLDB 2009.
20. Razniewski, Suchanek & Nutt. [But What Do We Actually Know?](https://www.akbc.ws/2016/papers/10_Paper.pdf), AKBC 2016.
21. Zou et al. [PoisonedRAG: Knowledge Corruption Attacks to Retrieval-Augmented Generation of Large Language Models](https://arxiv.org/abs/2402.07867), 2024.
22. Chhikara et al. [Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory](https://arxiv.org/abs/2504.19413), 2025.
23. Mem0. [Open Source: Migrating to the New Memory Algorithm](https://docs.mem0.ai/migration/oss-v2-to-v3).

*Every source above was fetched and read at its origin during this work. Each cited
sentence was checked against the page itself. Claims from blocked sources were omitted.*
