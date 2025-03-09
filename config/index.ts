// /config/index.ts
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
export const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "";
export const ADMIN_ID = process.env.ADMIN_ID || "";
export const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY || "123476";
export const RSS_FEED_URL = "https://www.theverge.com/rss/index.xml";

export const postSchedule = {
  monday: "Tech News & Analysis",
  tuesday: "Tech Tips & Tricks",
  wednesday: "Deep Dive & Explanation",
  thursday: "Opinion & Commentary",
  friday: "Tech Discussion",
  saturday: "Personal Story / Behind-the-Scenes",
  sunday: "Weekly Recap & Recommendations",
};