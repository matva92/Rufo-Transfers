const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toTextRow(label, value) {
  if (!value) return '';
  return `${label}: ${value}\n`;
}

function toHtmlRow(label, value) {
  if (!value) return '';
  return `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;color:#666;width:38%">${escapeHtml(label)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;color:#111">${escapeHtml(value)}</td></tr>`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : (event.body || '');
  const params = new URLSearchParams(rawBody);
  const data = Object.fromEntries(params);

  const lang = data.language === 'en' ? 'en' : 'es';
  const labels = lang === 'en'
    ? {
        title: 'New Quote Request',
        sectionTrip: 'Trip',
        sectionPassenger: 'Passenger',
        sectionSchedule: 'Schedule',
        sectionExtras: 'Extras',
        sectionTotals: 'Totals',
        origin: 'Origin',
        destination: 'Destination',
        distance: 'Distance (km)',
        duration: 'Duration',
        vehicle: 'Vehicle',
        passengers: 'Passengers',
        luggage: 'Luggage',
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email',
        phone: 'Phone',
        flight: 'Flight number',
        tripDate: 'Trip date',
        pickupTime: 'Pickup time',
        arrivalTime: 'Latest arrival',
        extras: 'Requested services',
        comments: 'Comments',
        currency: 'Currency',
        totalARS: 'Total ARS',
        totalUSD: 'Total USD',
        reference: 'Reference',
      }
    : {
        title: 'Nueva solicitud de cotización',
        sectionTrip: 'Viaje',
        sectionPassenger: 'Pasajero',
        sectionSchedule: 'Horarios',
        sectionExtras: 'Extras',
        sectionTotals: 'Totales',
        origin: 'Origen',
        destination: 'Destino',
        distance: 'Distancia (km)',
        duration: 'Duración',
        vehicle: 'Vehículo',
        passengers: 'Pasajeros',
        luggage: 'Equipaje',
        firstName: 'Nombre',
        lastName: 'Apellido',
        email: 'Email',
        phone: 'Teléfono',
        flight: 'Número de vuelo',
        tripDate: 'Fecha del viaje',
        pickupTime: 'Hora de recogida',
        arrivalTime: 'Hora límite',
        extras: 'Servicios solicitados',
        comments: 'Comentarios',
        currency: 'Moneda',
        totalARS: 'Total ARS',
        totalUSD: 'Total USD',
        reference: 'Referencia',
      };

  const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
  const subject = `${labels.title}${fullName ? ` · ${fullName}` : ''}`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f7f6f3;padding:24px">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e4e1db;border-radius:12px;overflow:hidden">
      <div style="padding:18px 22px;background:#1a3a5c;color:#fff">
        <div style="font-size:16px;font-weight:700">${escapeHtml(labels.title)}</div>
        ${data.reference ? `<div style="margin-top:6px;font-size:12px;opacity:.85">${escapeHtml(labels.reference)}: ${escapeHtml(data.reference)}</div>` : ''}
      </div>

      <div style="padding:18px 22px">
        <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.08em;margin:4px 0 8px">${escapeHtml(labels.sectionTrip)}</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${toHtmlRow(labels.origin, data.origin)}
          ${toHtmlRow(labels.destination, data.destination)}
          ${toHtmlRow(labels.distance, data.distance_km)}
          ${toHtmlRow(labels.duration, data.duration)}
          ${toHtmlRow(labels.vehicle, data.vehicle)}
          ${toHtmlRow(labels.passengers, data.passengers)}
          ${toHtmlRow(labels.luggage, data.luggage)}
        </table>

        <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.08em;margin:18px 0 8px">${escapeHtml(labels.sectionPassenger)}</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${toHtmlRow(labels.firstName, data.first_name)}
          ${toHtmlRow(labels.lastName, data.last_name)}
          ${toHtmlRow(labels.email, data.email)}
          ${toHtmlRow(labels.phone, data.phone)}
          ${toHtmlRow(labels.flight, data.flight_number)}
        </table>

        <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.08em;margin:18px 0 8px">${escapeHtml(labels.sectionSchedule)}</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${toHtmlRow(labels.tripDate, data.trip_date)}
          ${toHtmlRow(labels.pickupTime, data.pickup_time)}
          ${toHtmlRow(labels.arrivalTime, data.arrival_time)}
        </table>

        <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.08em;margin:18px 0 8px">${escapeHtml(labels.sectionExtras)}</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${toHtmlRow(labels.extras, data.extras_summary)}
          ${toHtmlRow(labels.comments, data.comments)}
        </table>

        <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.08em;margin:18px 0 8px">${escapeHtml(labels.sectionTotals)}</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${toHtmlRow(labels.currency, data.currency)}
          ${toHtmlRow(labels.totalARS, data.total_ars)}
          ${toHtmlRow(labels.totalUSD, data.total_usd)}
        </table>
      </div>
    </div>
  </div>`;

  const text =
    `${labels.title}\n` +
    (data.reference ? `${labels.reference}: ${data.reference}\n\n` : '\n') +
    `${labels.sectionTrip}\n` +
    toTextRow(labels.origin, data.origin) +
    toTextRow(labels.destination, data.destination) +
    toTextRow(labels.distance, data.distance_km) +
    toTextRow(labels.duration, data.duration) +
    toTextRow(labels.vehicle, data.vehicle) +
    toTextRow(labels.passengers, data.passengers) +
    toTextRow(labels.luggage, data.luggage) +
    `\n${labels.sectionPassenger}\n` +
    toTextRow(labels.firstName, data.first_name) +
    toTextRow(labels.lastName, data.last_name) +
    toTextRow(labels.email, data.email) +
    toTextRow(labels.phone, data.phone) +
    toTextRow(labels.flight, data.flight_number) +
    `\n${labels.sectionSchedule}\n` +
    toTextRow(labels.tripDate, data.trip_date) +
    toTextRow(labels.pickupTime, data.pickup_time) +
    toTextRow(labels.arrivalTime, data.arrival_time) +
    `\n${labels.sectionExtras}\n` +
    toTextRow(labels.extras, data.extras_summary) +
    toTextRow(labels.comments, data.comments) +
    `\n${labels.sectionTotals}\n` +
    toTextRow(labels.currency, data.currency) +
    toTextRow(labels.totalARS, data.total_ars) +
    toTextRow(labels.totalUSD, data.total_usd);

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'Rufo Transfers';
  const toName = process.env.BREVO_TO_NAME || '';
  const toEmailsRaw = process.env.BREVO_TO_EMAIL || senderEmail;
  const toEmails = String(toEmailsRaw)
    .split(/[;,]/)
    .map((e) => e.trim())
    .filter(Boolean);

  if (!apiKey || !senderEmail || toEmails.length === 0) {
    return { statusCode: 500, body: 'Missing email configuration.' };
  }

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: toEmails.map((email) => (toName ? { email, name: toName } : { email })),
    subject,
    htmlContent: html,
    textContent: text,
  };

  if (data.email && data.email.includes('@')) {
    payload.replyTo = { email: data.email, name: fullName || data.email };
  }

  try {
    const res = await fetch(BREVO_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      let providerMessage = `Brevo error ${res.status}`;
      let providerBody = errText;
      try {
        const parsed = JSON.parse(errText);
        providerBody = parsed;
        if (parsed && typeof parsed.message === 'string' && parsed.message.trim()) {
          providerMessage = parsed.message.trim();
        }
      } catch (_) {}

      console.error('Brevo send failed', {
        status: res.status,
        message: providerMessage,
        body: providerBody,
      });

      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          ok: false,
          message: providerMessage,
          providerStatus: res.status,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        ok: false,
        message: err.message || 'send failed',
      }),
    };
  }
};
