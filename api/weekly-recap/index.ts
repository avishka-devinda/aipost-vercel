import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { TELEGRAM_CHANNEL_ID, CRONJOB_API_KEY } from "../../config/index.js";
import { bot } from "../../services/telegram.js";
import { getLastWeekPosts,getLastWeekPostsTitle } from "../../services/feedService.js";
import { escapeMarkdownV2 } from "../../utils/formatters.js";
import { chooseTop3WeeklyRecap } from '../../services/ai.js';

interface WeeklyPost {
  feedTitle: string;
  aiHeadline: string
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

app.get('/weekly-recap', async (c) => {
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
    const weeklyPostsTitle = await getLastWeekPostsTitle()

    if (!weeklyPosts || weeklyPosts.length === 0) {
      return c.json({
        success: false,
        message: "No posts found for the last week"
      }, 404);
    }

    // Format the weekly recap message
    const weeklyRecapTitle = "📱 Weekly Tech News Recap 🚀";
    let recapMessage = `*${escapeMarkdownV2(weeklyRecapTitle)}*\n\n`;

    // Add each post with its link and description
    weeklyPosts.forEach((post: WeeklyPost, index: number) => {
      const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      recapMessage += `${index + 1}\\. [${escapeMarkdownV2(post.aiHeadline)}](${post.postLink}) \n`;
    });


    weeklyPostsTitle.forEach((post: weeklyPostsTitle, index: number) => {
       return `${post.feedTitle}`;
    });

    

    // Get top 3 headlines for OG image
    const top3Posts = await chooseTop3WeeklyRecap(weeklyPostsTitle.map(post => ({ feedTitle: post.feedTitle })));
    const [englishTitle1, englishTitle2, englishTitle3] = top3Posts.headlines;
    
    // Use raw titles for OG image URL
    const encodedTitle1 = encodeURIComponent(englishTitle1);
    const encodedTitle2 = encodeURIComponent(englishTitle2);
    const encodedTitle3 = encodeURIComponent(englishTitle3);

    const ogurl = `https://techpost-og.vercel.app/weekly-recap?title1=${encodedTitle1}&title2=${encodedTitle2}&title3=${encodedTitle3}`;

console.log(ogurl)
    // Generate and add AI analysis

    // Send the recap message to Telegram
    // const sentMessage = await bot.api.sendMessage(TELEGRAM_CHANNEL_ID, recapMessage, {
    //   parse_mode: "MarkdownV2",
    //   //disable_web_page_preview: true
    // });

    const sentMessage = await bot.api.sendPhoto(TELEGRAM_CHANNEL_ID, ogurl, {
      caption: recapMessage,
      parse_mode: "MarkdownV2",
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
