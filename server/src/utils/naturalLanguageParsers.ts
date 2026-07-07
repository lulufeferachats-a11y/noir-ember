const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

/**
 * Validates that a YYYY-MM-DD string is a real calendar date and not in the past.
 */
function validateDate(dateStr: string): string | null {
  const date = new Date(`${dateStr}T12:00:00`);
  // Check it's a real date (e.g. rejects Feb 30)
  if (isNaN(date.getTime())) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (date.getFullYear() !== y || date.getMonth() + 1 !== m || date.getDate() !== d) return null;
  // Check it's not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return null;
  return dateStr;
}

export function parseNaturalDate(input: string): string | null {
  const t = input.toLowerCase().trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return validateDate(t);

  const slash = t.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
  if (slash) {
    const [, d, m, y] = slash;
    return validateDate(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
  }

  const monthFirst = t.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(\d{4})/);
  if (monthFirst && MONTHS[monthFirst[2]]) {
    return validateDate(`${monthFirst[3]}-${String(MONTHS[monthFirst[2]]).padStart(2, '0')}-${monthFirst[1].padStart(2, '0')}`);
  }

  const nameFirst = t.match(/([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/);
  if (nameFirst && MONTHS[nameFirst[1]]) {
    return validateDate(`${nameFirst[3]}-${String(MONTHS[nameFirst[1]]).padStart(2, '0')}-${nameFirst[2].padStart(2, '0')}`);
  }

  return null;
}

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
