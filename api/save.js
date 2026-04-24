import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { body } = req;
    
    // We expect the frontend to send the raw string text content in the body
    // If Vercel parsed it as a string, we can use it directly. 
    // If it's a buffer or object, we stringify or decode.
    const content = typeof body === 'string' ? body : JSON.stringify(body);
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `burnapp_solicitudes_${timestamp}_${Date.now()}.txt`;

    const blob = await put(filename, content, {
      access: 'public', // Set to 'private' if you only want server-side access, but public is easier to download
      contentType: 'text/plain',
    });

    return res.status(200).json({ success: true, url: blob.url });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return res.status(500).json({ error: 'Failed to upload file to Vercel Blob' });
  }
}
