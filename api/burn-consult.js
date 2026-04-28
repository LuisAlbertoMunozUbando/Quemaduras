import { list } from '@vercel/blob';
import { parseCsv, slugifyPatient } from './burn-utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const name = String(req.query?.name || '').trim();
    const key = String(req.query?.key || '').trim();
    const patientSlug = slugifyPatient({ patientName: name, patientKey: key });

    if (!patientSlug) {
      return res.status(400).json({ ok: false, error: 'Debes enviar nombre o clave.' });
    }

    const csvPath = `burn-tracking/${patientSlug}/inferences.csv`;
    const listResult = await list({ prefix: csvPath, limit: 1 });

    if (!listResult.blobs?.length) {
      return res.status(200).json({ ok: true, patientSlug, totalEntries: 0, records: [] });
    }

    const response = await fetch(listResult.blobs[0].url);
    if (!response.ok) {
      return res.status(500).json({ ok: false, error: 'No se pudo leer el historial del paciente.' });
    }

    const csv = await response.text();
    const records = parseCsv(csv).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return res.status(200).json({ ok: true, patientSlug, totalEntries: records.length, records });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'No se pudo consultar el historial.' });
  }
}
