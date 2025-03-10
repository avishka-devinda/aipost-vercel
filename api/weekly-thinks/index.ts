import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { TELEGRAM_CHANNEL_ID, CRONJOB_API_KEY } from "../../config/index.js";
import { bot } from "../../services/telegram.js";
import { getLastWeekPosts,getLastWeekPostsTitle } from "../../services/feedService.js";
import { escapeMarkdownV2 } from "../../utils/formatters.js";
import { chooseTop3WeeklyRecap } from '../../services/ai.js';
import { generateWeeklyAnalysis } from "../../services/ai.js";

interface WeeklyPost {
  feedTitle: string;
  feedDescription: string;
  postLink: string;
  createdAt: Date;
}


interface weeklyPostsTitle {
  feedTitle: string;
  postLink: string;
  createdAt: Date;
}

const app = new Hono().basePath('/api');

app.get('/weekly-thinks', async (c) => {
  const key = c.req.query("key");

  // Validate the API key
  if (!key || key !== CRONJOB_API_KEY) {
    return c.json(
      {
        success: false,
        message: "Unauthorized: Invalid or missing API key",
      },
      401
    );
  }

  try {
    // Get last week's posts
    const weeklyPosts = await getLastWeekPosts();
    const weeklyPostsTitle = await getLastWeekPostsTitle();
    
    // Generate weekly analysis
    const weeklyAnalysis = await generateWeeklyAnalysis(weeklyPosts);
    const formattedAnalysis = escapeMarkdownV2(weeklyAnalysis.analysis);
    
    // Send the recap message to Telegram
    const sentMessage = await bot.api.sendMessage(TELEGRAM_CHANNEL_ID, formattedAnalysis, {
      parse_mode: "MarkdownV2",
     // disable_web_page_preview: true
    });



    const postLink = `https://t.me/c/${TELEGRAM_CHANNEL_ID.toString().replace('-100', '')}/${sentMessage.message_id}`;

    return c.json({
      success: true,
      message: "Weekly recap sent successfully",
      post_details: {
        message_id: sentMessage.message_id,
        chat_id: sentMessage.chat.id,
        post_link: postLink,
        post_count: weeklyPosts.length
      }
    }, 200);

  } catch (error) {
    console.error("Error generating weekly recap:", error);
    return c.json({
      success: false,
      message: "Error generating weekly recap"
    }, 500);
  }
});

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
