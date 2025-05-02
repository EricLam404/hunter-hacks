export function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/gi, "")
        .split(/\s+/)
        .filter((w) => w.length > 2);
}

export function termFreq(tokens: string[]): Record<string, number> {
    const freq: Record<string, number> = {};
    for (const token of tokens) {
        freq[token] = (freq[token] || 0) + 1;
    }
    return freq;
}

export function cosineSimilarity(
    vec1: Record<string, number>,
    vec2: Record<string, number>
): number {
    const intersection = Object.keys(vec1).filter((k) => k in vec2);
    const dotProduct = intersection.reduce(
        (sum, k) => sum + vec1[k] * vec2[k],
        0
    );

    const normA = Math.sqrt(
        Object.values(vec1).reduce((sum, val) => sum + val ** 2, 0)
    );
    const normB = Math.sqrt(
        Object.values(vec2).reduce((sum, val) => sum + val ** 2, 0)
    );

    return normA && normB ? dotProduct / (normA * normB) : 0;
}

export function computeRelevance(pageText: string, topic: string): number {
    const pageTokens = tokenize(pageText);
    const topicTokens = tokenize(topic);
    return cosineSimilarity(termFreq(pageTokens), termFreq(topicTokens));
}
