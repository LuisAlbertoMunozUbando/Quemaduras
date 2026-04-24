import { Resend } from 'resend';

// Vercel Environment Variable Setup:
// Go to Vercel Dashboard -> Project -> Settings -> Environment Variables
// Add RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx

// Initialize Resend with the environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // 2. Validate required fields
    if (
      !data.nombre ||
      !data.apellido ||
      !data.email ||
      !data.aceptaTerminos ||
      !data.aceptaAviso
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Email Settings
    // For testing, we use the Resend onboarding email
    // For production, change to a verified domain email, e.g., 'BurnApp <notificaciones@yourdomain.com>'
    const senderEmail = 'BurnApp <onboarding@resend.dev>';
    
    // The email address where you want to receive these notifications
    // Replace 'YOUR_EMAIL_HERE' with your actual personal/work email
    const destinationEmail = 'jlurquieta1@gmail.com';
    
    const subject = `Nueva solicitud de acceso a BurnApp - ${data.nombre} ${data.apellido}`;

    // 3. Construct HTML Email
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #E63329;">Nueva Solicitud de Acceso a BurnApp</h2>
        <p>Has recibido una nueva solicitud de acceso. Aquí están los detalles:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Código de Solicitud:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.solicitud}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Fecha:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.fecha}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Nombre:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.nombre} ${data.apellido}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Teléfono:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.telefono || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>País/Ciudad:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.pais} / ${data.ciudad || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Institución:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.institucion}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Perfil Profesional:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.perfil}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Plataforma:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.plataforma}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Tipo de Uso:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.tipoUso}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Fuente:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.fuente || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Comentarios:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.comentarios || '—'}</td>
          </tr>
        </table>

        <h3 style="margin-top: 30px; font-size: 16px;">Aceptaciones Legales:</h3>
        <ul style="list-style-type: none; padding: 0;">
          <li>✅ Términos y Condiciones: ${data.aceptaTerminos ? 'Aceptado' : 'No'}</li>
          <li>✅ Aviso Médico: ${data.aceptaAviso ? 'Aceptado' : 'No'}</li>
          <li>📬 Noticias: ${data.aceptaNoticias ? 'Aceptado' : 'No'}</li>
        </ul>
      </div>
    `;

    // Plain text fallback
    const textContent = `
NUEVA SOLICITUD DE ACCESO BURNAPP

Código: ${data.solicitud}
Fecha: ${data.fecha}
Nombre: ${data.nombre} ${data.apellido}
Email: ${data.email}
Teléfono: ${data.telefono || '—'}
País/Ciudad: ${data.pais} / ${data.ciudad || '—'}
Institución: ${data.institucion}
Perfil: ${data.perfil}
Plataforma: ${data.plataforma}
Uso: ${data.tipoUso}
Fuente: ${data.fuente || '—'}
Comentarios: ${data.comentarios || '—'}

Aceptaciones:
- Términos: ${data.aceptaTerminos ? 'Sí' : 'No'}
- Aviso Médico: ${data.aceptaAviso ? 'Sí' : 'No'}
- Noticias: ${data.aceptaNoticias ? 'Sí' : 'No'}
    `.trim();

    // 4. Send email via Resend
    const { data: resendData, error } = await resend.emails.send({
      from: senderEmail,
      to: [destinationEmail],
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error('Resend Error:', error);
      return res.status(500).json({ error: 'Failed to send email via Resend', details: error });
    }

    // 5. Success Response
    return res.status(200).json({ success: true, message: 'Email sent successfully', id: resendData.id });
    
  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
