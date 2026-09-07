import re, sys, json

path = sys.argv[1]
text = open(path).read()

# strip fenced/quoted image captions and tables for prose analysis
lines = text.split("\n")
prose_lines = [l for l in lines if not l.startswith("|") and not l.startswith("#")
               and not (l.startswith("*") and l.endswith("*"))]
prose = "\n".join(prose_lines)

paras = [p.strip().replace("\n", " ") for p in re.split(r"\n\s*\n", prose) if p.strip()]

def sentences(p):
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', p) if s.strip()]

all_sents = [s for p in paras for s in sentences(p)]
def wc(s): return len(re.findall(r"[A-Za-z0-9'’\-]+", s))

short = [s for s in all_sents if wc(s) <= 6]
print(f"sentences: {len(all_sents)}")
print(f"<=6 words: {len(short)}  ({100*len(short)/len(all_sents):.1f}%)")

# consecutive runs of 3+ short sentences
runs = []
for p in paras:
    ss = sentences(p); run = []
    for s in ss:
        if wc(s) <= 6: run.append(s)
        else:
            if len(run) >= 3: runs.append(run)
            run = []
    if len(run) >= 3: runs.append(run)
print(f"runs of 3+ short: {len(runs)}")
for r in runs: print("   ", " / ".join(r))

print("\n--- paragraph-final sentences (aphorism check) ---")
for p in paras:
    ss = sentences(p)
    if ss: print(f"  [{wc(ss[-1]):2d}w] {ss[-1]}")

print("\n--- negative parallelism ---")
pats = [r"\bnot just\b", r"\brather than\b", r"\binstead of\b", r", not ", r", never ",
        r"\bis not a\b", r"\bisn't\b", r"\bwhat changes is\b", r"\bthe real question\b",
        r"\bit is not\b", r"\bnone of (those|these)\b"]
for pat in pats:
    for m in re.finditer(pat, prose, re.I):
        print(f"  {pat}: ...{prose[max(0,m.start()-55):m.end()+45]}...".replace("\n"," "))

print("\n--- vocabulary ---")
vocab = ["delve","tapestry","testament","landscape","realm","journey","navigate","unlock",
 "harness","leverage","robust","seamless","crucial","pivotal","vital","intricate","meticulous",
 "showcase","underscore","foster","boast","vibrant","profound","transformative","game-changer",
 "deep dive","at its core","worth noting","important to note","serves as","stands as",
 "functions as","operates as","represents","marks ","Moreover","Furthermore","Additionally",
 "Notably","Importantly","Crucially"]
hits = [v for v in vocab if re.search(r"\b"+re.escape(v), prose, re.I)]
print("  hits:", hits or "none")

print("\n--- stage directions ---")
stage = [r"here'?s the", r"let me", r"read that again", r"the general version",
         r"here is the", r"look at", r"in plain terms", r"here'?s what"]
for pat in stage:
    for m in re.finditer(pat, prose, re.I):
        print(f"  ...{prose[max(0,m.start()-40):m.end()+50]}...".replace("\n"," "))

print(f"\nem dashes: {text.count(chr(8212))}")
print(f"semicolons: {text.count(';')}")
print(f"paragraph word counts: {[len(re.findall(r'[A-Za-z]+', p)) for p in paras]}")
