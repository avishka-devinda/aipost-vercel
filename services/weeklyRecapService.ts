import { bot } from "./telegram.js";
import { escapeMarkdownV2 } from "../utils/formatters.js";
import { TELEGRAM_CHANNEL_ID } from "../config/index.js";

export async function generateWeeklyRecap(weeklyPosts: any[], weeklyPostsTitle: any[]) {
  if (!weeklyPosts || weeklyPosts.length === 0) {
    throw new Error("No posts found for the last week");
  }

  // Format the weekly recap message
  const weeklyRecapTitle = "📱 Weekly Tech News Recap 🚀";
  let recapMessage = `*${escapeMarkdownV2(weeklyRecapTitle)}*\n\n`;

  // Add each post with its link and description
  weeklyPosts.forEach((post, index) => {
    const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    recapMessage += `${index + 1}\\. [${escapeMarkdownV2(post.feedTitle)}](${post.postLink}) \n`;
  });

  // Get top 3 headlines for OG image
  const top3Posts = await chooseTop3WeeklyRecap(weeklyPostsTitle.map(post => ({ feedTitle: post.feedTitle })));
  const [englishTitle1, englishTitle2, englishTitle3] = top3Posts.headlines;
  
  // Use raw titles for OG image URL
  const encodedTitle1 = encodeURIComponent(englishTitle1);
  const encodedTitle2 = encodeURIComponent(englishTitle2);
  const encodedTitle3 = encodeURIComponent(englishTitle3);

  const ogurl = `https://techpost-og.vercel.app/weekly-recap?title1=${encodedTitle1}&title2=${encodedTitle2}&title3=${encodedTitle3}`;

  const sentMessage = await bot.api.sendPhoto(TELEGRAM_CHANNEL_ID, ogurl, {
    caption: recapMessage,
    parse_mode: "MarkdownV2",
  });

  const postLink = `https://t.me/c/${TELEGRAM_CHANNEL_ID.toString().replace('-100', '')}/${sentMessage.message_id}`;

  return {
    message_id: sentMessage.message_id,
    chat_id: sentMessage.chat.id,
    post_link: postLink
  };
}

export async function chooseTop3WeeklyRecap(posts: { feedTitle: string }[]) {
  // Implement the logic for choosing top 3 headlines
  // For now, just take the first 3 posts
  const headlines = posts.slice(0, 3).map(post => post.feedTitle);
  return { headlines };
}