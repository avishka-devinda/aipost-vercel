import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import * as config from '../config/index.js';
import { fetchLatestTechNews } from "../services/rss.js";
import { generateTechPost } from "../services/ai.js";
import { escapeMarkdownV2 } from "../utils/formatters.js";
import { bot } from "../services/telegram.js";
import { TELEGRAM_CHANNEL_ID, CRONJOB_API_KEY } from "../config/index.js";
import { getTodayPostType } from "../utils/helpers.js";


const app = new Hono().basePath('/api')

app.get('/', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

// app.get('/feed', async (c) => {
//   const key = c.req.query("key");

//     // Validate the API key
//     // if (!key || key !== CRONJOB_API_KEY) {
//     //   return c.json(
//     //     {
//     //       success: false,
//     //       message: "Unauthorized: Invalid or missing API key",
//     //     },
//     //     401
//     //   );
//     // }

//     const todayPostType = getTodayPostType();
//    const techNews = await fetchLatestTechNews();

//     if (!techNews) {
//       return c.text("Failed to fetch tech news", 500);
//     }

//     try {
//       const toolResult = await generateTechPost(techNews.content);
//       const escapedHeadline = escapeMarkdownV2(toolResult.headline);
//       const escapedBody = escapeMarkdownV2(toolResult.body);

//       const message = `*${escapedHeadline}*\n\n${escapedBody}`;

//       // Send to channel
//       await bot.api.sendMessage(TELEGRAM_CHANNEL_ID, message, {
//         parse_mode: "MarkdownV2",
//       });

//       return c.json({ success: true, message: "Successfully sent the post" }, 200);
//     } catch (error) {
//       console.error("AI Generation Error:", error);
//       return c.text("Error generating post", 500);
//     }
//     return c.json({ message: 'feed post' })

// })

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;