import { Bot } from "grammy";
import { escapeMarkdownV2, cleanContent } from "../utils/formatters.js";
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID, ADMIN_ID } from "../config/index.js";
import Parser from "rss-parser";
import { RSS_FEED_URL } from "../config/index.js";
import { generateMockPost } from "../utils/helpers.js";

// Initialize bot
export const bot = new Bot(TELEGRAM_BOT_TOKEN);
const parser = new Parser();

// Bot command handlers
export function setupBotCommands() {
  // Handle /help command
  bot.command("help", async (ctx) => {
    if (ctx.from?.id.toString() !== ADMIN_ID) {
      await ctx.reply("Sorry, you are not authorized to use this bot.");
      return;
    }

    const helpMessage =
      "🤖 *Available Commands*\n\n" +
      "📝 *Commands List:*\n" +
      "/start \\- Start the bot and get welcome message\n" +
      "/help \\- Show this help message\n" +
      "/post \\- Generate and post mock content\n" +
      "/feedpost \\- Post latest tech news from RSS feed\n\n" +
      "ℹ️ Only authorized admin can use these commands\\.";

    await ctx.reply(helpMessage, { parse_mode: "MarkdownV2" });
  });

  // Handle /start command
  bot.command("start", async (ctx) => {
    if (ctx.from?.id.toString() !== ADMIN_ID) {
      await ctx.reply("Sorry, you are not authorized to use this bot.");
      return;
    }
    await ctx.reply(
      "Welcome! 👋\n\nI can help you post content to your channel.\nUse /post to create a new post."
    );
  });

  // Handle /post command
  bot.command("post", async (ctx) => {
    if (ctx.from?.id.toString() !== ADMIN_ID) {
      await ctx.reply("Sorry, you are not authorized to use this bot.");
      return;
    }

    try {
      const mockPost = generateMockPost();
      const message =
        "📢 *" + mockPost.title + "*\n\n" +
        "🏷 Topic: " + mockPost.topic + "\n" +
        "📝 " + mockPost.content + "\n\n" +
        "🕒 " + mockPost.timestamp;

      await bot.api.sendMessage(TELEGRAM_CHANNEL_ID, message, {
        parse_mode: "Markdown",
      });

      await ctx.reply("✅ Post has been successfully sent to the channel!");
    } catch (error) {
      console.error("Error posting to Telegram:", error);
      if (error instanceof Error) {
        await ctx.reply(`❌ Error: ${error.message}`);
      } else {
        await ctx.reply("❌ An unknown error occurred");
      }
    }
  });

  // Handle /feedpost command
  bot.command("feedpost", async (ctx) => {
    if (ctx.from?.id.toString() !== ADMIN_ID) {
      await ctx.reply("Sorry, you are not authorized to use this bot.");
      return;
    }

    const result = await postFeedToChannel();
    await ctx.reply(
      result.success ? `✅ ${result.message}` : `❌ ${result.message}`
    );
  });

  // Error handling
  bot.catch((err) => {
    console.error("Error in bot:", err);
  });

  return bot;
}

// Function to post RSS feed content to channel
export async function postFeedToChannel(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Fetch RSS feed from TechCrunch
    const feed = await parser.parseURL(RSS_FEED_URL);

    // Get the latest item
    const latestItem = feed.items[0];

    if (!latestItem) {
      return { success: false, message: "No feed items found." };
    }

    // Clean and format the content
    const cleanedContent = cleanContent(latestItem.content || "");

    // Format message with MarkdownV2 escape characters
    const title =
      latestItem.title?.replace(/([_*[\]()~>#+\-=|{}.!])/g, "\\$1") ||
      "No Title";
    const content = cleanedContent.replace(/([_*[\]()~>#+\-=|{}.!])/g, "\\$1");

    const message = `*${title}*\n\n${content}`;

    // Send to channel
    await bot.api.sendMessage(TELEGRAM_CHANNEL_ID, message, {
      parse_mode: "MarkdownV2",
    });

    return {
      success: true,
      message: "Latest tech news has been posted to the channel!",
    };
  } catch (error) {
    console.error("Error posting RSS feed:", error);
    if (error instanceof Error) {
      return { success: false, message: `Error: ${error.message}` };
    } else {
      return { success: false, message: "An unknown error occurred" };
    }
  }
}