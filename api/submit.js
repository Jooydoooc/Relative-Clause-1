export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const data = req.body || {};
    const student = data.student || {};

    const test = String(data.test || "Test");
    const score = Number.isFinite(data.score) ? data.score : 0;
    const total = Number.isFinite(data.total) ? data.total : 0;
    const percentage = Number.isFinite(data.percentage) ? data.percentage : 0;

    const forced = !!data.forced_submit;
    const violations = Number.isFinite(data.violations) ? data.violations : 0;
    const expired = Number.isFinite(data.expired_count) ? data.expired_count : 0;

    const ts = String(data.timestamp || new Date().toISOString());

    const name = String(student.name || "Unknown");
    const group = String(student.group || "Unknown");
    const level = String(student.level || "Unknown");

    const message =
      `✅ Results Submitted\n` +
      `👤 Student: ${name}\n` +
      `👥 Group: ${group}\n` +
      `📚 Level: ${level}\n` +
      `📘 Test: ${test}\n` +
      `🎯 Score: ${score}/${total} (${percentage}%)\n` +
      `⏱ Timeouts: ${expired}\n` +
      `🚫 Violations: ${violations}\n` +
      `⚠ Forced submit: ${forced ? "YES" : "NO"}\n` +
      `🕒 Time: ${ts}`;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(200).json({ ok: true, forwarded: false });
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });

    const tgJson = await tgRes.json();
    if (!tgRes.ok || !tgJson.ok) {
      return res.status(200).json({ ok: true, forwarded: false, telegram_error: tgJson });
    }

    return res.status(200).json({ ok: true, forwarded: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
