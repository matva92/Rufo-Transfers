const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const SIMPLE_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_FORM_FILL_MS = 4000;
const CAPTCHA_DEBUG = process.env.CAPTCHA_DEBUG === '1';

function getClientIp(event) {
  const forwarded = event.headers?.['x-forwarded-for'] || event.headers?.['X-Forwarded-For'] || '';
  if (!forwarded) return '';
  return String(forwarded).split(',')[0].trim();
}

function getRecaptchaToken(data = {}) {
  return String(
    data['g-recaptcha-response'] ||
      data.gRecaptchaResponse ||
      data.recaptchaToken ||
      '',
  ).trim();
}

function validateFormTiming(data = {}) {
  const startedAtRaw = String(data.form_started_at || '').trim();
  if (!startedAtRaw) return false;
  const startedAt = Number(startedAtRaw);
  if (!Number.isFinite(startedAt)) return false;
  if (startedAt > Date.now() + 30000) return false;
  return Date.now() - startedAt >= MIN_FORM_FILL_MS;
}

async function verifyRecaptchaToken(token, remoteIp = '') {
  const secret =
    process.env.RECAPTCHA_SECRET_KEY ||
    process.env.GOOGLE_RECAPTCHA_SECRET ||
    process.env.NETLIFY_RECAPTCHA_SECRET ||
    '';
  if (!secret) {
    console.error('Missing reCAPTCHA secret env var');
    return { ok: false, reason: 'missing-secret' };
  }
  if (!token) return { ok: false, reason: 'missing-token' };

  const body = new URLSearchParams();
  body.append('secret', secret);
  body.append('response', token);
  if (remoteIp) body.append('remoteip', remoteIp);

  try {
    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const parsed = await res.json();
    if (!res.ok) {
      return { ok: false, reason: `provider-http-${res.status}` };
    }
    if (!parsed || parsed.success !== true) {
      return {
        ok: false,
        reason: 'provider-rejected',
        codes: Array.isArray(parsed?.['error-codes']) ? parsed['error-codes'] : [],
      };
    }

    const expectedHostname = process.env.RECAPTCHA_EXPECTED_HOSTNAME || '';
    if (
      expectedHostname &&
      parsed.hostname &&
      String(parsed.hostname).toLowerCase() !== expectedHostname.toLowerCase()
    ) {
      return { ok: false, reason: 'hostname-mismatch' };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err?.message || 'verify-failed' };
  }
}

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

function normalizeEmailCandidate(value = '') {
  let v = String(value).trim();
  if (!v) return '';
  const angle = v.match(/<([^>]+)>/);
  if (angle && angle[1]) v = angle[1].trim();
  v = v.replace(/^['"]+|['"]+$/g, '').trim();
  return v;
}

function parseRecipientEmails(rawValue = '') {
  const parts = String(rawValue)
    .split(/[;,]/)
    .map((part) => normalizeEmailCandidate(part))
    .filter(Boolean);

  const valid = [];
  const invalid = [];
  for (const candidate of parts) {
    if (SIMPLE_EMAIL_RE.test(candidate)) valid.push(candidate);
    else invalid.push(candidate);
  }
  return { valid, invalid };
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
  const clientIp = getClientIp(event);

  if (String(data.company || '').trim()) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ ok: false, message: 'Validation failed' }),
    };
  }

  if (!validateFormTiming(data)) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ ok: false, message: 'Validation failed' }),
    };
  }

  const recaptchaToken = getRecaptchaToken(data);
  const recaptcha = await verifyRecaptchaToken(recaptchaToken, clientIp);
  if (!recaptcha.ok) {
    console.warn('Rejected by captcha validation', {
      reason: recaptcha.reason,
      codes: recaptcha.codes || [],
      ip: clientIp || 'unknown',
    });
    const body = { ok: false, message: 'Captcha validation failed' };
    if (CAPTCHA_DEBUG) {
      body.reason = recaptcha.reason;
      if (Array.isArray(recaptcha.codes) && recaptcha.codes.length > 0) {
        body.codes = recaptcha.codes;
      }
    }
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    };
  }

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
  const { valid: toEmails, invalid: invalidToEmails } = parseRecipientEmails(
    toEmailsRaw,
  );
  const normalizedSenderEmail = normalizeEmailCandidate(senderEmail);
  const senderLooksValid = SIMPLE_EMAIL_RE.test(normalizedSenderEmail);
  if (toEmails.length === 0 && senderLooksValid) {
    toEmails.push(normalizedSenderEmail);
  }
  if (invalidToEmails.length > 0) {
    console.warn('Ignored invalid BREVO_TO_EMAIL values', {
      invalid: invalidToEmails,
    });
  }

  if (!apiKey || !senderEmail || toEmails.length === 0) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        ok: false,
        message:
          'Missing email configuration. Verify BREVO_TO_EMAIL and BREVO_SENDER_EMAIL.',
      }),
    };
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
