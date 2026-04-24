import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const text = req.body;

    const filename = `burnapp/solicitudes-${Date.now()}.txt`;

    const blob = await put(filename, text, {
      access: 'private',
      contentType: 'text/plain',
    });

    return res.status(200).json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      error: 'Could not upload file',
    });
  }
}
