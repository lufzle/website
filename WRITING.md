# Writing rules

House style for posts in `src/content/posts/`. The goal is prose that reads as though a person
with opinions wrote it, because one did. Most of the rules below exist because current language
models write a specific way, and that way has become recognisable enough that readers now
discount writing that has it.

Two things to keep in mind before applying any of this.

**Frequency is the tell, not the device.** Every pattern named here is a legitimate rhetorical
device that good writers have used for centuries. Antithesis is not a defect. A three-item list
is not a defect. What marks machine prose is that the same three or four devices carry *every*
paragraph, so the rhythm never varies. The fix is almost never to eliminate a device. It is to
use it where it is earned and to write plainly everywhere else.

**Style is not proof of authorship, and this file is not a detector.** Wikipedia's own guide
warns that human ability to tell machine text from human text is "no better than random chance"
for casual readers, and that false accusations are corrosive. Use this as a revision checklist
for our own drafts, never as evidence about anyone else's.

## The patterns

### 1. Negative parallelism: "not X, but Y"

The single best-documented tic. Pangram measured "not just X but Y" at roughly three times the
human rate, and its use in corporate communications more than quadrupled between 2023 and 2025.
The Atlantic devoted a piece to it in July 2026. Wikipedia's guide lists three variants
separately: "not just X, but also Y", "not X, but Y", and "X rather than Y".

It is seductive because it manufactures the feeling of an argument. The first clause knocks down
a reading nobody proposed, and the second clause sounds like a hard-won conclusion.

- **Bad:** "It is not a nicety. It is the difference between a store you can reason about and one you can't."
- **Better:** "That difference decides whether you can reason about the store at all."

**Rule:** at most one per post, and only where the reading being rejected is one a reader would
actually have. If you cannot name who believes X, delete the X half and assert Y.

Watch for the disguised versions: "rather than", "instead of", "what changes is", "the real
question is", and a bare comma inversion ("The fault was in the display, not the data").

### 2. Sentence-fragment staccato

Short. Punchy. Stacked. Three declaratives in a row, each under six words, used to manufacture
gravity that the content has not earned. Editorial standards commonly flag three or more very
short declaratives in succession.

The problem is not the short sentence. It is the short sentence used as a drum. A short sentence
lands *because* it follows a long one. When a quarter of the piece is short sentences, none of
them land.

**Rule:** count sentences of six words or fewer. If they exceed about 15% of the total, or if
three appear consecutively more than once or twice in a post, redistribute. Keep the ones that
carry a real reversal; join the rest to their neighbours with "and", "so", or "because".

### 3. Paragraph-final aphorisms

The maxim in the last line, shorter than everything before it, portable enough to be a pull
quote. One is a good ending. Fifteen is a tic, and it trains the reader to skim to the last line
of each paragraph.

**Rule:** a post gets two or three of these. Everywhere else, end the paragraph on its last piece
of substance and stop. If the closing line could be lifted out and printed on a poster without
losing meaning, it is probably doing rhythm rather than work.

### 4. Stage directions

"Here's the thing." "Let me be precise." "Now the war story." "Read that again." "Let me
generalise." "Look at that list." "Here's where it gets interesting." "But here's the truth."

These announce emphasis instead of earning it. A 2025 editor's field guide groups them as "ta-da"
phrases. They are also ordinary speech, so one or two in a long post is fine.

**Rule:** if the sentence only tells the reader how to feel about the next sentence, cut it. The
next sentence should be able to do that itself.

### 5. The rule of three

Three adjectives, three examples, three parallel clauses. Wikipedia's guide notes that models use
the triad "to make superficial analysis appear more comprehensive". The tell is when open-ended
material keeps resolving into exactly three neat items of equal length.

**Rule:** if there are four real items, list four. If there are two, list two. Only write three
when the world supplied three.

### 6. Abstract nouns doing the acting

"Innovation drives transformation." "The integration of X enables Y." A 2025 PNAS study of six
models across 12,000 texts found instruction-tuned models keep a strong preference for
nominalisation and noun-heavy phrasing even when told to imitate a different register. It is one
of the better corpus-supported tendencies.

**Rule:** prefer a person or a thing as the subject of the sentence, and a verb that something
can actually do. "The system" and "the graph" are fine subjects. "The integration", "the
alignment" and "the implementation" are usually a verb wearing a disguise.

### 7. The significance gloss

Stating a fact and then immediately explaining what it "highlights", "underscores", "reflects",
"demonstrates" or "signals", often as a trailing "-ing" clause. Wikipedia files this under
superficial analyses, and the PNAS study found models strongly favour exactly this
present-participial construction.

**Rule:** give the fact, then either give evidence or move on. If the gloss restates the fact at
a higher level of abstraction, it is filler. Never end a sentence with a participial phrase that
evaluates the sentence.

### 8. Vocabulary

Avoid outright: delve, tapestry, testament, landscape (figurative), realm, journey (figurative),
navigate (figurative), unlock, harness, leverage (as a verb), robust, seamless, crucial, pivotal,
vital, intricate, meticulous, showcase, underscore, foster, boast, vibrant, profound,
transformative, game-changer, deep dive, at its core, it's worth noting, it's important to note.

Avoid the copula-avoidance verbs where "is" would do: serves as, stands as, functions as,
operates as, represents, marks.

Avoid the stock transitions at sentence-start: Moreover, Furthermore, Additionally, Notably,
Importantly, Crucially.

Prefer the plain word. Zinsser's rule holds: if a shorter word means the same thing, the shorter
word is the right one.

### 9. Symmetry

Excessive balance is the meta-pattern behind most of the above. Clauses that mirror each other,
lists that resolve in threes, paragraphs of near-identical length, sentences alternating between
smooth exposition and manufactured punch. A 2025 syntactic study found lower variability across
several complexity measures in model-written argumentative essays.

**Rule:** vary paragraph length on purpose. A three-line paragraph next to a twelve-line one is
a good sign. Rectangular paragraphs all the way down are a bad one.

### 10. Em dashes and formatting

Models overuse the em dash where a comma, colon, or full stop would serve, and one July 2026
study found Claude in particular uses them more than professional writers do. This is a weak tell
on its own and Wikipedia has flagged it as possibly dated, but the underlying advice is sound:
an em dash should mark a real interruption, not a decorative pause.

Also avoid: bold used on every key phrase in "key takeaways" fashion, bullet lists where the
bullet is a bold inline header followed by a colon and a sentence, title case in headings, and
emoji as section markers.

### 11. Signpost fragments

The verbless sentence that tells the reader where they are in the piece instead of telling them
something. "Five of those, and what each one cost." "The most expensive hour." "Now the war
story." "Three rules, in order." It has no subject and no finite verb, and what it carries is
navigation, which the headings and the paragraphs are already doing.

This is close to the stage directions in rule 4 and worth separating from them. A stage direction
tells the reader how to feel about the next sentence. A signpost fragment tells the reader how
many sentences are coming. Both announce rather than earn, and the second one hides better,
because it usually contains a real number and so reads as information.

It is also close to the legitimate fragment listed under "What is not a tell", and the line
between them is whether the fragment carries content. "Measured, not assumed." carries a claim
about method. "Five of those, and what each one cost." carries a count the reader is about to get
from the headings anyway.

- **Bad:** "Every hard problem had the same shape. Five of those, and what each one cost."
- **Better:** "Every hard problem had the same shape."
- **Also fine:** "It happened five times before I stopped being surprised by it."

The second version cuts and does not replace. The third keeps the count by giving it a subject
and a verb and a small admission to carry, so it reads as a person talking.

**Rule:** cut on sight, and only replace if the count is doing real work for the reader. Prefer
deleting to rewriting, because a signpost that has been rewritten into a sentence is usually
still a signpost.

Watch for these shapes: a bare noun phrase ending in a full stop, a count followed by a colon
("Three of them:"), a label with no verb ("The general version:", "The short answer:"), and any
sentence you could delete without the reader noticing anything missing except the rhythm.

## What is *not* a tell

Do not strip these out of a draft on suspicion. Several are markers of human writing.

- **Em dashes in moderation**, and correct semicolons. Professional writers use both.
- **Rhetorical questions.** Jiang and Hyland found model-written essays used *fewer* questions
  and personal asides than student essays. Genre matters more than authorship here.
- **Formal or academic register.** The correlation is with specific overused words, not with
  formality as such.
- **Perfect grammar.** Skilled writers have it too.
- **A single triad, one good aphorism, one fragment, one antithesis.** These are craft.
- **First person, opinion, hedging, admitted uncertainty, and specific unglamorous detail.**
  These read as human because the machine default is confident, positive, and general. Keep them.

## The revision pass

Run this on a draft before publishing.

1. Count sentences of six words or fewer. Over 15% of the total means redistribute.
2. Read only the last sentence of every paragraph. If it reads as a list of maxims, cut most of them.
3. Search for: `not just`, `rather than`, `, not `, `isn't`, `is not a`. Keep one instance per post.
4. Search for every word in the vocabulary list.
5. Find each three-item list and ask whether the world supplied three.
6. Read the piece aloud. If the rhythm is predictable for more than two paragraphs, break it.
7. Check that at least one paragraph is markedly longer or shorter than its neighbours.
8. Find every sentence with no finite verb. Ask of each whether it carries content or only
   structure. Cut the structural ones. A parser makes a first pass at this and gets it wrong
   often enough that every flag needs a human look: run against two drafts of one post, the
   check flagged 12 sentences of which 7 were real fragments, then 3 of which none were.

### The checker

`scripts/fragments.py`, in the same folder as `scripts/check.py`. It parses each sentence and
flags any of fourteen words or fewer whose root is not a verb or auxiliary.

```
pip install spacy
pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl
python3 scripts/fragments.py path/to/post.md
```

Two known weaknesses, both from the tagger rather than the rule. Nouns that double as verbs get
mistagged, so "A biological ontology types every synonym" and "An interval closes" both flag as
fragments and neither is one. Sentences that open with a long adverbial phrase sometimes lose
their root to the preposition. Expect roughly five false positives per two thousand words, and
read every flag before cutting anything.

Note that it does not strip numbered lists, so a post's Sources section floods the output. Run it
against the body alone.

## Sources

- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) — the catalogue this file leans on most, including its caveats about detection.
- [Reinhart et al., "Do LLMs write like humans? Variation in grammatical and rhetorical styles", PNAS 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC11874169/) — nominalisation and participial-clause findings across 12,000 texts.
- [The Atlantic on negative parallelism, July 2026](https://www.theatlantic.com/technology/2026/07/ai-chatbot-writing-tic-negative-parallelism/687892/) — the "not X, it's Y" tic and the Pangram rate figures.
- [Jiang & Hyland, "Does ChatGPT write like a student?"](https://research-portal.uea.ac.uk/en/publications/does-chatgpt-write-like-a-student-engagement-markers-in-argumenta/) — engagement markers; the rhetorical-question counter-evidence.
- William Zinsser, *On Writing Well* — clutter, the short word, and trusting the material.
