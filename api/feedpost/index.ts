import { Hono } from "hono";
import { handle } from "hono/vercel";
import * as config from "../../config/index.js";
import { fetchLatestTechNews } from "../../services/rss.js";
import { generateTechPost } from "../../services/ai.js";
import {
  escapeMarkdownTags,
  escapeMarkdownV2,
} from "../../utils/formatters.js";
import { bot } from "../../services/telegram.js";
import { TELEGRAM_CHANNEL_ID, CRONJOB_API_KEY } from "../../config/index.js";
import { getTodayPostType } from "../../utils/helpers.js";
import { getLastWeekPosts, getLastWeekPostsTitle, saveFeedData } from "../../services/feedService.js";
import { generateWeeklyRecap } from "../../services/weeklyRecapService.js";

const app = new Hono().basePath("/api");

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});

app.get("/feedpost", async (c) => {
  const key = c.req.query("key");

  //  Validate the API key
  if (!key || key !== CRONJOB_API_KEY) {
    return c.json(
      {
        success: false,
        message: "Unauthorized: Invalid or missing API key",
      },
      401
    );
  }

  // Check if it's Sunday
  const today = new Date();
  if (today.getDay() === 0) { // 0 represents Sunday
    try {
      const weeklyPosts = await getLastWeekPosts();
      const weeklyPostsTitle = await getLastWeekPostsTitle();

      if (!weeklyPosts || weeklyPosts.length === 0) {
        return c.json({
          success: false,
          message: "No posts found for the last week"
        }, 404);
      }

      const result = await generateWeeklyRecap(weeklyPosts, weeklyPostsTitle);

      return c.json({ 
        success: true, 
        message: "Successfully sent the weekly recap",
        post_details: result
      }, 200);
    } catch (error) {
      console.error("Error:", error);
      return c.text("Error processing weekly recap", 500);
    }
  }

  const todayPostType = getTodayPostType();
  const techNews = await fetchLatestTechNews();

  if (!techNews.success) {
    return c.json({ success: false, message:techNews.message}, 500);
  }

  
  if (!techNews) {
    return c.json({ success: false, message: "Failed to fetch tech news" }, 500);
  }



  const content = techNews.content

  function extractSrcWithSyndicationRights(htmlContent: string) {
    // Match the img tag that contains data-has-syndication-rights="1" and extract the src
    const regex = /<img.*?data-has-syndication-rights="1".*?src="([^"]*)"/;
    const match = htmlContent.match(regex);
    
    if (match && match[1]) {
        return match[1];
    }
    return null;
}

const srcLink = extractSrcWithSyndicationRights(techNews.orignalContent || '');

console.log(srcLink)
 
  try {
    const toolResult = await generateTechPost(techNews.content, techNews.title);

    //mock data
    // const toolResult = {
    //   headline: 'apple realse new ai version of siri',
    //   EnglishTitle: 'apple realse new ai version of siri',
    //   body: 'you know apple has new ai version of siri, try it yourself, its amazing and useful',
    //   hashtags: '#apple #siri #ai #new',
    // }
    const escapedHeadline = escapeMarkdownV2(toolResult.headline);
    const englishTitle = toolResult.EnglishTitle;
    //   const escapedBody = escapeMarkdownV2(toolResult.body);

    // Add a character limit check before escaping
    const maxCharLimit = 1300;
    let truncatedBody = toolResult.body;

    // Check if the body plus the headline and hashtags would exceed the limit
    const totalLength =
      truncatedBody.length +
      toolResult.headline.length +
      toolResult.hashtags.length +
      10; // 10 for newlines and spaces

    if (totalLength > maxCharLimit) {
      // Calculate how many characters to keep from the body
      const charsToKeep =
        maxCharLimit -
        (toolResult.headline.length + toolResult.hashtags.length + 10);
      truncatedBody = truncatedBody.substring(0, charsToKeep) + "...";
    }

    const escapedBody = escapeMarkdownV2(truncatedBody);

    const escapedHashtags = toolResult.hashtags
      .split(" ")
      .map((tag) => {
        if (tag.startsWith("#")) {
          // Fully escape the hashtag, INCLUDING the # symbol
          return "\\" + tag.charAt(0) + escapeMarkdownTags(tag.substring(1));
        }
        return escapeMarkdownTags(tag);
      })
      .join(" ");

    const message = `*${escapedHeadline}*\n\n${escapedBody}\n\n${escapedHashtags}`;
    console.log({ englishTitle });

    const encodedTitle = encodeURIComponent(englishTitle);

    let ogurl;
    if (srcLink){
      ogurl = `https://techpost-og.vercel.app/tech-img-2?title=${encodedTitle}&image=${srcLink}`;

    }
    else{
    ogurl = `https://techpost-og.vercel.app/og?title=${encodedTitle}`;

    }
    // Send to channel
    // await bot.api.sendMessage(TELEGRAM_CHANNEL_ID, message, {
    //   parse_mode: "MarkdownV2",
    // });

    //send to channel with image
    const sentMessage = await bot.api.sendPhoto(TELEGRAM_CHANNEL_ID, ogurl, {
      caption: message,
      parse_mode: "MarkdownV2",
    });

    const postLink = `https://t.me/c/${TELEGRAM_CHANNEL_ID.toString().replace('-100', '')}/${sentMessage.message_id}`;

    await saveFeedData({
      feedTitle: techNews.title,
      feedDescription: techNews.description || '',
      feedContent: techNews.content,
      feedSummary: techNews.description || '',
      aiHeadline: escapedHeadline,
      aiContent: escapedBody,
      postLink: postLink
    });

    return c.json(
      { success: true, message: "Successfully sent the post" },
      200
    );
  } catch (error) {
    console.error("AI Generation Error:", error);
    return c.text("Error generating post", 500);
  }
});

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
