const MAX_BODY_BYTES = 16 * 1024;

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const contentLength = Number(request.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return response.status(413).json({ ok: false, error: 'payload_too_large' });
  }

  const body = request.body || {};
  if (body.company) return response.status(200).json({ ok: true });

  const lead = {
    nombre: clean(body.nombre, 120),
    email: clean(body.email, 180).toLowerCase(),
    telefono: clean(body.telefono, 80),
    web: clean(body.web, 300),
    fecha: clean(body.fecha, 20),
    hora: clean(body.hora, 20),
    preguntas: clean(body.preguntas, 2000),
    company: ''
  };

  if (!lead.nombre || !lead.email || !lead.telefono || !lead.fecha || !lead.hora ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return response.status(400).json({ ok: false, error: 'invalid_data' });
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    'https://script.google.com/macros/s/AKfycbzxxGdHj653ejI2IUqCb2xs59ITbNbm_oqa7UY0hM1YPH-b0B1GNneOvZbiFGomqACpkA/exec';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      redirect: 'follow',
      signal: controller.signal
    });
    const result = await upstream.json().catch(() => null);
    if (!upstream.ok || !result?.ok) {
      console.error('Google Sheets webhook failed', upstream.status, result);
      return response.status(502).json({ ok: false, error: 'storage_failed' });
    }
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Google Sheets webhook error', error);
    return response.status(502).json({ ok: false, error: 'storage_unavailable' });
  } finally {
    clearTimeout(timeout);
  }
}
