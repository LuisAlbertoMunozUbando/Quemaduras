import fetch from 'node-fetch';

async function testEmail() {
  const testData = {
    solicitud: 'BA-TEST-123',
    fecha: new Date().toLocaleString('es-MX'),
    plataforma: 'Web',
    nombre: 'Antigravity',
    apellido: 'Agent',
    email: 'test@example.com',
    telefono: '+1234567890',
    pais: 'México',
    ciudad: 'CDMX',
    institucion: 'OpenAI',
    perfil: 'Investigador Científico',
    tipoUso: 'Exploración / Experimentación',
    fuente: 'Otro',
    comentarios: 'Este es un correo de prueba generado automáticamente.',
    aceptaNoticias: true
  };

  try {
    const response = await fetch('http://localhost:3000/api/send-request-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Test Result:', result);
    
    if (response.ok && result.ok) {
      console.log('✅ Email sent successfully!');
    } else {
      console.error('❌ Failed to send email:', result.error || response.statusText);
    }
  } catch (error) {
    console.error('❌ Error running test:', error);
  }
}

testEmail();
