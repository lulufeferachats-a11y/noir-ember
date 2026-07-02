const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

/**
 * Parses common natural-language date formats into YYYY-MM-DD.
 * Returns null if the input cannot be confidently parsed, so the caller
 * can ask the guest to rephrase rather than save bad data - PARTIE 11.
 */
export function parseNaturalDate(input: string): string | null {
  const t = input.toLowerCase().trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;

  const slash = t.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
  if (slash) {
    const [, d, m, y] = slash;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const monthFirst = t.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(\d{4})/);
  if (monthFirst && MONTHS[monthFirst[2]]) {
    return `${monthFirst[3]}-${String(MONTHS[monthFirst[2]]).padStart(2, '0')}-${monthFirst[1].padStart(2, '0')}`;
  }

  const nameFirst = t.match(/([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/);
  if (nameFirst && MONTHS[nameFirst[1]]) {
    return `${nameFirst[3]}-${String(MONTHS[nameFirst[1]]).padStart(2, '0')}-${nameFirst[2].padStart(2, '0')}`;
  }

  return null;
}

/** Parses common natural-language time formats into HH:MM (24h). */
export function parseNaturalTime(input: string): string | null {
  const t = input.toLowerCase().trim();

  const withColon = t.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
  if (withColon) {
    let h = parseInt(withColon[1], 10);
    const m = withColon[2];
    const ampm = withColon[3];
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    if (h > 23) return null;
    return `${String(h).padStart(2, '0')}:${m}`;
  }

  const simple = t.match(/^(\d{1,2})\s*(am|pm)$/);
  if (simple) {
    let h = parseInt(simple[1], 10);
    if (h > 12 || h < 1) return null;
    if (simple[2] === 'pm' && h < 12) h += 12;
    if (simple[2] === 'am' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:00`;
  }

  return null;
}
