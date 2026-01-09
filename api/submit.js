export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const data = req.body || {};
    const student = data.student || {};
    const { test, score, total, percentage, timestamp } = data;

    const safeTest = String(test || "Test");
    const safeScore = Number.isFinite(score) ? score : 0;
    const safeTotal = Number.isFinite(total) ? total : 0;
    const safePct = Number.isFinite(percentage) ? percentage : 0;
    const safeTime = String(timestamp || new Date().toISOString());

    const name = String(student.name || "Unknown");
    const group = String(student.group || "Unknown");
    const level = String(student.level || "Unknown");

    const message =
      `✅ Results Submitted\n` +
      `👤 Student: ${name}\n` +
      `👥 Group: ${group}\n` +
      `📚 Level: ${level}\n` +
      `📘 Test: ${safeTest}\n` +
      `🎯 Score: ${safeScore}/${safeTotal} (${safePct}%)\n` +
      `🕒 Time: ${safeTime}`;

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
