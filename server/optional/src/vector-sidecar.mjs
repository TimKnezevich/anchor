export class VectorSidecar {
  constructor(options = {}) {
    this.maxResults = options.maxResults ?? 5;
  }

  rankNodes(query, nodes) {
    const normalizedQuery = String(query ?? "").toLowerCase().trim();

    if (normalizedQuery === "") {
      return [];
    }

    const scored = [];

    for (const node of nodes) {
      const haystacks = [
        String(node.id ?? "").toLowerCase(),
        String(node.type ?? "").toLowerCase(),
        String(node.title ?? "").toLowerCase(),
        String(node.status ?? "").toLowerCase()
      ];

      let score = 0;
      for (const value of haystacks) {
        if (value.includes(normalizedQuery)) {
          score += 1;
        }
      }

      if (score > 0) {
        scored.push({
          node_id: node.id,
          score,
          rationale: `matched ${score} fields` // deterministic and non-authoritative
        });
      }
    }

    scored.sort((a, b) => b.score - a.score || a.node_id.localeCompare(b.node_id));

    return scored.slice(0, this.maxResults);
  }
}
