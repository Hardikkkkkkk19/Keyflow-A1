/**
 * KEYFLOW Email Templates Generator
 * Clean, modern HTML email templates matching KEYFLOW branding (#18C69A Emerald theme)
 */

export interface EmailTemplateData {
  type: "welcome" | "achievement" | "level_up" | "streak_milestone";
  displayName: string;
  badgeTitle?: string;
  badgeId?: string;
  rewardXp?: number;
  description?: string;
  previousLevel?: number;
  newLevel?: number;
  currentXp?: number;
  streakDays?: number;
}

const APP_URL = "https://ais-dev-hawz7zjafzv66zp3s32ysx-93288701512.asia-southeast1.run.app";

function wrapBaseLayout(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #050807;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #050807;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #0D1110;
      border: 1px solid #1A2320;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .header {
      padding: 32px 32px 24px;
      border-bottom: 1px solid #1A2320;
      text-align: center;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #FFFFFF;
      text-transform: uppercase;
      margin: 0;
    }
    .accent {
      color: #18C69A;
    }
    .content {
      padding: 32px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #FFFFFF;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #94A3B8;
      margin-bottom: 24px;
    }
    .card {
      background-color: #121816;
      border: 1px solid #1A2E28;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      text-align: center;
    }
    .card-metric {
      font-size: 28px;
      font-weight: 800;
      color: #18C69A;
      margin: 4px 0;
    }
    .card-label {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748B;
      margin: 0;
    }
    .btn-container {
      text-align: center;
      margin-top: 28px;
      margin-bottom: 12px;
    }
    .btn {
      display: inline-block;
      background-color: #18C69A;
      color: #050807 !important;
      font-weight: 700;
      font-size: 15px;
      padding: 14px 28px;
      border-radius: 10px;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .footer {
      padding: 24px 32px;
      border-top: 1px solid #1A2320;
      text-align: center;
      font-size: 12px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="logo-text">KEY<span class="accent">FLOW</span> ⌨️</h1>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} KEYFLOW AI Typing Platform. Built for precision & velocity.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function generateEmailContent(data: EmailTemplateData): { subject: string; html: string } {
  const name = data.displayName || "Typist";

  switch (data.type) {
    case "welcome": {
      const subject = "Welcome to KEYFLOW ⌨️";
      const html = wrapBaseLayout(
        subject,
        `
        <h2 class="title">Welcome to KEYFLOW, ${name}! 🎉</h2>
        <p class="text">Your KEYFLOW account is officially ready. Designed for developers and typists who demand precision, KEYFLOW combines real-time telemetry analytics with personalized AI coaching.</p>

        <div class="card">
          <p class="card-label">Account Status</p>
          <p class="card-metric">ACTIVE & READY</p>
          <p class="text" style="margin: 8px 0 0; font-size: 13px;">Level 1 Novice • 0 WPM Baseline</p>
        </div>

        <p class="text">Ready to establish your baseline speed? Complete your first 30-second practice session or target drill to unlock your custom AI Coach insights.</p>

        <div class="btn-container">
          <a href="${APP_URL}" class="btn">Start Your First Session ⚡</a>
        </div>
      `,
      );
      return { subject, html };
    }

    case "achievement": {
      const badgeTitle = data.badgeTitle || "Achievement Unlocked";
      const rewardXp = data.rewardXp || 50;
      const subject = `🏆 New KEYFLOW Achievement Unlocked: ${badgeTitle}`;
      const html = wrapBaseLayout(
        subject,
        `
        <h2 class="title">New Achievement Unlocked! 🏆</h2>
        <p class="text">Great work, <strong>${name}</strong>! Your dedication to precision and finger rhythm has earned you a new milestone badge.</p>

        <div class="card">
          <p class="card-label">Achievement Title</p>
          <p class="card-metric" style="font-size: 22px; color: #FFFFFF;">${badgeTitle}</p>
          <p class="card-metric" style="font-size: 20px; color: #18C69A; margin-top: 6px;">+${rewardXp} XP EARNED</p>
          ${data.description ? `<p class="text" style="margin: 8px 0 0; font-size: 13px;">${data.description}</p>` : ""}
        </div>

        <p class="text">Check your full badge collection on your profile to track your journey toward typing mastery.</p>

        <div class="btn-container">
          <a href="${APP_URL}" class="btn">View Your Achievements 🏅</a>
        </div>
      `,
      );
      return { subject, html };
    }

    case "level_up": {
      const newLevel = data.newLevel || 2;
      const prevLevel = data.previousLevel || newLevel - 1;
      const currentXp = data.currentXp || 0;
      const subject = `🚀 You reached Level ${newLevel} on KEYFLOW!`;
      const html = wrapBaseLayout(
        subject,
        `
        <h2 class="title">Level Up, ${name}! 🚀</h2>
        <p class="text">Outstanding progress! Your consistent practice and improving accuracy have propelled you to the next rank.</p>

        <div class="card">
          <p class="card-label">New Rank Reached</p>
          <p class="card-metric">LEVEL ${newLevel}</p>
          <p class="text" style="margin: 8px 0 0; font-size: 13px;">Advanced from Level ${prevLevel} • Total ${currentXp} XP</p>
        </div>

        <p class="text">Every level unlocks higher skill recognition on the global leaderboard. Keep pushing for peak speed!</p>

        <div class="btn-container">
          <a href="${APP_URL}" class="btn">Continue Training ⌨️</a>
        </div>
      `,
      );
      return { subject, html };
    }

    case "streak_milestone": {
      const streak = data.streakDays || 7;
      const subject = `🔥 ${streak}-Day KEYFLOW Streak!`;
      const html = wrapBaseLayout(
        subject,
        `
        <h2 class="title">${streak}-Day Practice Streak! 🔥</h2>
        <p class="text">Incredible consistency, <strong>${name}</strong>! You've officially logged practice sessions for <strong>${streak} consecutive days</strong>.</p>

        <div class="card">
          <p class="card-label">Current Practice Streak</p>
          <p class="card-metric">${streak} DAYS</p>
          <p class="text" style="margin: 8px 0 0; font-size: 13px;">Muscle memory locked in • Routine established</p>
        </div>

        <p class="text">Daily practice is the single most effective way to eliminate weak keys and maintain high velocity under pressure. Keep the streak alive today!</p>

        <div class="btn-container">
          <a href="${APP_URL}" class="btn">Maintain Your Streak ⚡</a>
        </div>
      `,
      );
      return { subject, html };
    }
  }
}
