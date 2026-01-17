// src/telegram.js

export async function telegramWebhookHandler(req, res) {
  return res.json({ ok: true, note: "telegramWebhookHandler works (stub)" });
}
