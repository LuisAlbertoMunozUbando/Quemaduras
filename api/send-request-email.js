import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Solo aceptar peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    
    // Validar campos requeridos
    const requiredFields = ['nombre', 'apellido', 'email', 'institucion', 'pais', 'perfil', 'tipoUso'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ ok: false, error: `Falta campo requerido: ${field}` });
      }
    }

    const {
      solicitud, fecha, plataforma, nombre, apellido, email, telefono,
      pais, ciudad, institucion, perfil, tipoUso, fuente, comentarios, aceptaNoticias
    } = data;

    // Función para escapar caracteres HTML por seguridad
    const escapeHtml = (unsafe) => {
      if (unsafe == null) return '';
      return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    // Construir el contenido del correo en HTML
    const htmlContent = `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Nueva solicitud BurnApp</h2>
        <ul style="list-style: none; padding: 0;">
          <li style="margin-bottom: 8px;"><strong>Solicitud/Código:</strong> ${escapeHtml(solicitud)}</li>
          <li style="margin-bottom: 8px;"><strong>Fecha:</strong> ${escapeHtml(fecha)}</li>
          <li style="margin-bottom: 8px;"><strong>Plataforma:</strong> ${escapeHtml(plataforma)}</li>
          <li style="margin-bottom: 8px;"><strong>Nombre completo:</strong> ${escapeHtml(nombre)} ${escapeHtml(apellido)}</li>
          <li style="margin-bottom: 8px;"><strong>Email:</strong> ${escapeHtml(email)}</li>
          <li style="margin-bottom: 8px;"><strong>Teléfono:</strong> ${escapeHtml(telefono)}</li>
          <li style="margin-bottom: 8px;"><strong>País:</strong> ${escapeHtml(pais)}</li>
          <li style="margin-bottom: 8px;"><strong>Ciudad:</strong> ${escapeHtml(ciudad)}</li>
          <li style="margin-bottom: 8px;"><strong>Institución:</strong> ${escapeHtml(institucion)}</li>
          <li style="margin-bottom: 8px;"><strong>Perfil:</strong> ${escapeHtml(perfil)}</li>
          <li style="margin-bottom: 8px;"><strong>Tipo de uso:</strong> ${escapeHtml(tipoUso)}</li>
          <li style="margin-bottom: 8px;"><strong>Fuente:</strong> ${escapeHtml(fuente)}</li>
          <li style="margin-bottom: 8px;"><strong>Comentarios:</strong> ${escapeHtml(comentarios)}</li>
          <li style="margin-bottom: 8px;"><strong>Acepta noticias:</strong> ${aceptaNoticias ? 'Sí' : 'No'}</li>
        </ul>
      </div>
    `;

    // Enviar el correo usando Resend
    const sendResult = await resend.emails.send({
      from: 'BurnApp <onboarding@resend.dev>',
      to: [process.env.NOTIFY_EMAIL],
      reply_to: email, // Permite responder directamente al usuario
      subject: `Nueva solicitud BurnApp - ${escapeHtml(nombre)} ${escapeHtml(apellido)}`,
      html: htmlContent
    });

    if (sendResult.error) {
      console.error('Error de Resend:', sendResult.error);
      return res.status(500).json({ ok: false, error: sendResult.error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error general enviando correo:', error);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
