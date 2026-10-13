import "server-only";
import { Resend } from "resend";
import type { Lead } from "./leads";
import { site } from "./site";

const ROLE_LABEL: Record<Lead["role"], string> = {
  patient: "🧑‍🤝‍🧑 Patient / caregiver",
  pharmacy: "💊 Pharmacy",
  clinic: "🩺 Doctor / clinic",
  partner: "🤝 Investor / partner",
  other: "✉️ Other",
};

const esc = (s: string | null | undefined) =>
  (s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Email the team about a new lead, and (optionally) thank the person. Never throws. */
export async function notifyNewLead(lead: Lead) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_TO;
  if (!key || !to) {
    console.info(`[lead] ${lead.role} · ${lead.name} · ${lead.city} (email alerts not configured)`);
    return;
  }
  const resend = new Resend(key);
  const from = process.env.RESEND_FROM || "AICA Leads <onboarding@resend.dev>";
  const wa = lead.phone ? `https://wa.me/91${lead.phone}` : null;
  const rows: [string, string | null][] = [
    ["Type", ROLE_LABEL[lead.role]],
    ["Name", lead.name],
    ["Phone", lead.phone ? `+91 ${lead.phone}` : null],
    ["Email", lead.email],
    ["City", lead.city],
    ["Organisation", lead.organization],
    ["Message", lead.message],
    ["Language", lead.locale],
    ["Page", lead.sourcePage],
    ["Source", [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" / ") || lead.referrer],
  ];
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="margin:0 0 4px">New AICA lead: ${esc(ROLE_LABEL[lead.role])}</h2>
      <p style="color:#56607c;margin:0 0 16px">${esc(new Date(lead.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))}</p>
      <table style="border-collapse:collapse;width:100%">
        ${rows
          .filter(([, v]) => v)
          .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#56607c;vertical-align:top">${k}</td><td style="padding:6px 0"><b>${esc(v)}</b></td></tr>`)
          .join("")}
      </table>
      ${wa ? `<p style="margin-top:20px"><a href="${wa}" style="background:#25D366;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none">Reply on WhatsApp</a></p>` : ""}
      <p style="margin-top:20px"><a href="${site.url}/admin">Open the leads dashboard →</a></p>
    </div>`;

  try {
    await resend.emails.send({
      from,
      to: to.split(",").map((s) => s.trim()),
      subject: `New lead · ${ROLE_LABEL[lead.role]} · ${lead.name}, ${lead.city}`,
      html,
      replyTo: lead.email ?? undefined,
    });
    // Confirmation to the person only works once you verify your own domain in Resend.
    if (lead.email && process.env.LEAD_CONFIRMATION === "on") {
      const hi = lead.locale === "hi";
      await resend.emails.send({
        from,
        to: lead.email,
        subject: hi ? "आप AICA वेटलिस्ट में हैं" : "You're on the AICA waitlist",
        html: hi
          ? `<p>नमस्ते ${esc(lead.name)},</p><p>AICA में रुचि के लिए धन्यवाद। ${esc(lead.city)} में AICA शुरू होते ही हम आपसे संपर्क करेंगे।</p><p>— टीम AICA, लखनऊ</p>`
          : `<p>Hi ${esc(lead.name)},</p><p>Thanks for your interest in AICA. We'll reach out as soon as AICA opens in ${esc(lead.city)}.</p><p>— Team AICA, Lucknow</p>`,
      });
    }
  } catch (e) {
    console.error("[lead] email failed", e);
  }
}
