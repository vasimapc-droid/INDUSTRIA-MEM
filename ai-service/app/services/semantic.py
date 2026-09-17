from typing import List
import os, re, httpx

_model = None
_corpus_cache: List[dict] | None = None


def _get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            print("[semantic] loading model all-MiniLM-L6-v2...")
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            print("[semantic] model loaded")
        except Exception as e:
            print(f"[semantic] sentence-transformers unavailable: {e}")
            _model = False
    return _model


def _load_corpus(force: bool = False) -> List[dict]:
    """Load verified knowledge corpus from backend. Does NOT cache empty results."""
    global _corpus_cache
    if _corpus_cache and not force:
        return _corpus_cache

    backend = os.getenv("BACKEND_URL", "http://localhost:8080/api")
    try:
        r = httpx.get(f"{backend}/knowledge/public/verified", timeout=10)
        if r.status_code == 200:
            data = r.json()
            # filter out entries with no useful content
            useful = [
                k for k in data
                if (k.get("problem") or k.get("symptoms") or k.get("rootCause") or k.get("solution"))
            ]
            if useful:
                _corpus_cache = useful
                print(f"[semantic] loaded {len(useful)} useful knowledge entries (out of {len(data)} total)")
                return useful
            else:
                print("[semantic] backend returned empty or useless corpus")
                return []
        else:
            print(f"[semantic] backend returned status {r.status_code}")
            return []
    except Exception as e:
        print(f"[semantic] backend fetch failed: {e}")
        return []


def similar_incidents(query: str, top_k: int = 5) -> dict:
    corpus = _load_corpus()
    if not corpus:
        return {"results": [], "fallback": True, "message": "No verified knowledge available."}

    model = _get_model()
    if model:
        try:
            # Build rich text for each entry with more weight on rootCause and solution
            texts = []
            for k in corpus:
                parts = [
                    str(k.get("problem", "")),
                    str(k.get("symptoms", "")),
                    str(k.get("rootCause", "")),
                    str(k.get("solution", "")),
                    str(k.get("title", "")),
                    str(k.get("machine", {}).get("name", "") if isinstance(k.get("machine"), dict) else ""),
                ]
                texts.append(" ".join(p for p in parts if p).strip())
            
            emb = model.encode([query] + texts, normalize_embeddings=True)
            q, m = emb[0], emb[1:]
            sims = (m @ q).tolist()
        except Exception as e:
            print(f"[semantic] embedding failed: {e}")
            sims = _keyword_sims(query, corpus)
    else:
        sims = _keyword_sims(query, corpus)

    # Score adjustment: entries with rootCause AND solution get a boost
    adjusted = []
    for k, s in zip(corpus, sims):
        score = float(s)
        has_cause = bool(k.get("rootCause"))
        has_solution = bool(k.get("solution"))
        if has_cause and has_solution:
            score = min(1.0, score * 1.15)  # 15% boost for complete entries
        elif not has_cause and not has_solution:
            score = score * 0.6  # penalize empty entries
        adjusted.append((k, score))

    ranked = sorted(adjusted, key=lambda x: x[1], reverse=True)[:top_k]
    return {
        "results": [
            {
                "knowledgeId": k.get("id"),
                "title": k.get("title"),
                "machine": k.get("machine", {}).get("name") if isinstance(k.get("machine"), dict) else None,
                "problem": k.get("problem"),
                "symptoms": k.get("symptoms"),
                "rootCause": k.get("rootCause"),
                "solution": k.get("solution"),
                "similarity": round(float(s) * 100, 1)
            } for k, s in ranked if s > 0.55
        ]
    }


def _keyword_sims(query: str, corpus: List[dict]) -> List[float]:
    q = set(re.findall(r"[a-z0-9]+", query.lower()))
    out = []
    for k in corpus:
        text = " ".join(str(k.get(f, "")) for f in ("problem", "symptoms", "rootCause", "solution")).lower()
        words = set(re.findall(r"[a-z0-9]+", text))
        if not words:
            out.append(0.0)
            continue
        inter = q & words
        union = q | words
        out.append(len(inter) / max(1, len(union)) * 2)
    return [min(1.0, s) for s in out]