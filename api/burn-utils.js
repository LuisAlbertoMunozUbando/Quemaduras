export function slugifyPatient({ patientName = '', patientKey = '' }) {
  const seed = `${patientKey || patientName}`.trim();
  return seed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function csvEscape(value) {
  const raw = value === undefined || value === null ? '' : String(value);
  if (/[",\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function parseCsv(csvText) {
  const lines = (csvText || '').split('\n').filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const out = {};
    headers.forEach((h, i) => {
      out[h] = cols[i] ?? '';
    });
    if (out.areaCm2) out.areaCm2 = Number(out.areaCm2);
    if (out.pctScq) out.pctScq = Number(out.pctScq);
    if (out.baux) out.baux = Number(out.baux);
    return out;
  });
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else if (ch === '"') {
      inQuotes = true;
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}
