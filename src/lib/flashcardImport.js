// Parses pasted or uploaded text into a flat list of { front, back } pairs.
// Accepts: JSON (array of objects with front/back, question/answer, term/definition,
// or a 2-element array), or line-based text where each line separates the two sides
// with a tab, "::", "|", " - ", or a comma (in roughly that priority order).

function fromJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const pairs = [];
  for (const entry of parsed) {
    if (Array.isArray(entry) && entry.length >= 2) {
      pairs.push({ front: String(entry[0]).trim(), back: String(entry[1]).trim() });
      continue;
    }
    if (entry && typeof entry === "object") {
      const front = entry.front ?? entry.question ?? entry.term ?? entry.q;
      const back = entry.back ?? entry.answer ?? entry.definition ?? entry.a;
      if (front != null && back != null) {
        pairs.push({ front: String(front).trim(), back: String(back).trim() });
      }
    }
  }
  return pairs;
}

// Splits a single line into two fields on the first delimiter found, trying
// delimiters in order of how unambiguous they are.
function splitLine(line) {
  const delimiters = ["\t", "::", "|", " - "];
  for (const delim of delimiters) {
    const idx = line.indexOf(delim);
    if (idx > 0) {
      return [line.slice(0, idx), line.slice(idx + delim.length)];
    }
  }
  // Fall back to a simple CSV split: one comma outside quotes.
  const csvMatch = line.match(/^"?(.*?)"?\s*,\s*"?(.*?)"?$/);
  if (csvMatch && csvMatch[1] && csvMatch[2]) {
    return [csvMatch[1], csvMatch[2]];
  }
  return null;
}

function fromLines(text) {
  const pairs = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const fields = splitLine(line);
    if (!fields) continue;
    const front = fields[0].trim();
    const back = fields[1].trim();
    if (front && back) pairs.push({ front, back });
  }
  return pairs;
}

// Returns { cards: [{front, back}], skipped: number } where `skipped` is the count
// of non-empty input lines that couldn't be parsed (JSON input never skips lines).
export function parseFlashcardImport(text) {
  const trimmed = text.trim();
  if (!trimmed) return { cards: [], skipped: 0 };

  const fromJsonResult = fromJson(trimmed);
  if (fromJsonResult !== null) {
    return { cards: fromJsonResult, skipped: 0 };
  }

  const nonEmptyLines = trimmed.split(/\r?\n/).filter((l) => l.trim()).length;
  const cards = fromLines(trimmed);
  return { cards, skipped: Math.max(0, nonEmptyLines - cards.length) };
}
