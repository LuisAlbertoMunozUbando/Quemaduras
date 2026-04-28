import { list, put } from '@vercel/blob';
import { csvEscape, parseCsv, slugifyPatient } from './burn-utils.js';

const CSV_HEADERS = [
  'createdAt',
  'patientSlug',
  'patientName',
  'patientKey',
  'region',
  'regionId',
  'grado',
  'gravedad',
  'areaCm2',
  'pctScq',
  'baux',
  'tono',
  'cicatrizacion',
  'tratamiento',
  'riesgoCicatriz',
  'comentario',
  'imageUrl',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { patientName = '', patientKey = '', imageDataUrl, imageName, inference = {} } = req.body || {};

    const patientSlug = slugifyPatient({ patientName, patientKey });
    if (!patientSlug) {
      return res.status(400).json({ ok: false, error: 'Debes enviar nombre o clave de paciente.' });
    }
    if (!imageDataUrl || !String(imageDataUrl).startsWith('data:image/')) {
      return res.status(400).json({ ok: false, error: 'imageDataUrl inválido.' });
    }

    const match = String(imageDataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ ok: false, error: 'No se pudo decodificar la imagen.' });
    }

    const [, mime, b64] = match;
    const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const imageSafeName = String(imageName || `foto.${ext}`).replace(/[^a-zA-Z0-9_.-]/g, '_');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const imagePath = `burn-tracking/${patientSlug}/images/${ts}-${imageSafeName}`;

    const imageBlob = await put(imagePath, Buffer.from(b64, 'base64'), {
      access: 'public',
      contentType: mime,
      addRandomSuffix: false,
    });

    const csvPath = `burn-tracking/${patientSlug}/inferences.csv`;
    const listResult = await list({ prefix: csvPath, limit: 1 });
    let csvContent = CSV_HEADERS.join(',') + '\n';
    if (listResult.blobs?.length) {
      const old = await fetch(listResult.blobs[0].url);
      if (old.ok) {
        csvContent = await old.text();
        if (!csvContent.trim()) csvContent = CSV_HEADERS.join(',') + '\n';
      }
    }

    const row = {
      createdAt: new Date().toISOString(),
      patientSlug,
      patientName,
      patientKey,
      region: inference.region,
      regionId: inference.regionId,
      grado: inference.grado,
      gravedad: inference.gravedad,
      areaCm2: inference.areaCm2,
      pctScq: inference.pctScq,
      baux: inference.baux,
      tono: inference.tono,
      cicatrizacion: inference.cicatrizacion,
      tratamiento: inference.tratamiento,
      riesgoCicatriz: inference.riesgoCicatriz,
      comentario: inference.comentario,
      imageUrl: imageBlob.url,
    };

    csvContent += `${CSV_HEADERS.map((h) => csvEscape(row[h])).join(',')}\n`;

    const csvBlob = await put(csvPath, csvContent, {
      access: 'public',
      contentType: 'text/csv',
      addRandomSuffix: false,
    });

    const records = parseCsv(csvContent);

    return res.status(200).json({
      ok: true,
      patientSlug,
      imageUrl: imageBlob.url,
      csvUrl: csvBlob.url,
      totalEntries: records.length,
      latest: records[records.length - 1] || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'No se pudo guardar la inferencia.' });
  }
}
