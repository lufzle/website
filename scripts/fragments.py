import re, sys, spacy
nlp = spacy.load("en_core_web_sm")

def prose(text):
    text = re.sub(r"^\*[^*]+?\*$", "", text, flags=re.M|re.S)   # image captions
    text = re.sub(r"\n\*[^*]+?\*\n", "\n", text, flags=re.S)
    text = re.sub(r"\[\d+\]", "", text)                          # citation markers
    text = re.sub(r"\*\*", "", text)
    lines = [l for l in text.split("\n") if not l.startswith(("|", "#", ">", "-"))]
    return "\n".join(lines)

def check(path):
    paras = [p.strip().replace("\n"," ") for p in re.split(r"\n\s*\n", prose(open(path).read())) if p.strip()]
    flagged = []
    for p in paras:
        for sent in nlp(p).sents:
            s = sent.text.strip()
            if not s or len(s.split()) > 14: continue
            if re.fullmatch(r"[\W\d\[\]]+", s): continue
            root = sent.root
            if root.pos_ not in ("VERB", "AUX"):
                flagged.append((root.pos_, s))
    return flagged

for path in sys.argv[1:]:
    f = check(path)
    print(f"\n{path}: {len(f)} verbless sentence(s)")
    for pos, s in f: print(f"   [root={pos}] {s}")
