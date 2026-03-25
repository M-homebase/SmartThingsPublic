import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  try {
    const { challengeeEmail, challengerName, challengerScore, message } =
      await request.json();

    if (!challengeeEmail || !challengerScore) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://thecognoscenti.com";

    // Save challenge record
    await prisma.challenge.create({
      data: {
        challengerName: challengerName ?? "A Cognoscenti Benefactor",
        challengerScore,
        challengeeEmail,
        message:
          message ??
          `${challengerName} donated and scored ${challengerScore} on the Benefactor Assessment. They thought you should know.`,
      },
    });

    // Send email if Resend is configured
    if (resend) {
      const challengeMessage =
        message ??
        `${challengerName} scored ${challengerScore} on the Cognoscenti Benefactor Assessment and just donated.`;

      await resend.emails.send({
        from: "The Cognoscenti <noreply@thecognoscenti.com>",
        to: challengeeEmail,
        subject: `${challengerName ?? "Someone"} has a question about your giving`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background: #080808; color: #F5F5F0; font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 0 auto; padding: 48px 32px; }
    .brand { color: #C9A227; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 40px; }
    h1 { font-size: 28px; font-weight: bold; margin: 0 0 16px; }
    p { color: #8A8A88; font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
    .score { font-size: 48px; font-weight: bold; color: #C9A227; margin: 32px 0; }
    .score-label { font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #4A4A48; }
    .cta { display: inline-block; background: #C9A227; color: #080808; font-weight: bold; font-size: 11px;
           letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 32px; text-decoration: none;
           margin-top: 24px; }
    .divider { border: none; border-top: 1px solid rgba(201,162,39,0.2); margin: 32px 0; }
    .note { font-size: 12px; color: #2A2A28; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">The Cognoscenti</div>
    <h1>You&rsquo;ve been challenged.</h1>
    <p>${challengeMessage}</p>
    <p>Their Benefactor IQ: <strong style="color:#E8D5A3;">${challengerScore}</strong></p>
    <p style="color:#605E5A;font-style:italic;">
      Most people who receive this email assume they&rsquo;d score higher.
      Most of them are right. Most of them still don&rsquo;t do anything about it.
    </p>
    <hr class="divider">
    <p>The Benefactor Assessment takes 3 minutes.</p>
    <a href="${appUrl}/quiz" class="cta">Take the Assessment →</a>
    <hr class="divider">
    <p class="note">
      100% of Cognoscenti donations go to NAMI, DonorsChoose, Khan Academy, and Crisis Text Line.
      You can read exactly how this works at ${appUrl}/about.
    </p>
  </div>
</body>
</html>
        `,
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Challenge error:", err);
    return Response.json({ error: "Failed to send challenge" }, { status: 500 });
  }
}
