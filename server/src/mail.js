'use strict';
const config = require('./config');

const ENDPOINT = 'https://api.forwardemail.net/v1/emails';

/**
 * Sends a mail through the Forward Email REST API (HTTPS). Direct SMTP is not an option:
 * the ISP blocks outbound port 25 from the Pi.
 * @returns {Promise<{ error?: string }>}
 */
async function sendMail({ to, subject, text, attachments = [] }) {
  if (!config.forwardEmailToken) return { error: 'FORWARD_EMAIL_API_TOKEN is not configured' };
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // The token is stored pre-encoded (base64 of "apikey:"), as Forward Email expects for Basic auth.
        Authorization: `Basic ${config.forwardEmailToken}`,
      },
      body: JSON.stringify({
        from: config.mailFrom,
        to,
        subject,
        text,
        attachments: attachments.map((a) => ({
          filename: a.filename,
          content: Buffer.from(a.content, 'utf8').toString('base64'),
          encoding: 'base64',
          contentType: a.contentType,
        })),
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) return { error: `Forward Email API error ${res.status}: ${(await res.text()).slice(0, 300)}` };
    return {};
  } catch (e) {
    return { error: `Mail request failed: ${e.message}` };
  }
}

module.exports = { sendMail };
