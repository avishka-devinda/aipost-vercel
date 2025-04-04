import { parseFeed } from "@rowanmanning/feed-parser";
import { RSS_FEED_URL } from "../config/index.js";
import { cleanContent, escapeMarkdownV2 } from "../utils/formatters.js";
import { waitUntil } from "@vercel/functions";

type FeedCategory = string | { term?: string; $?: { term: string } };

export async function fetchLatestTechNews() {
  // Background processing promise

  try {
    const response = await fetch(RSS_FEED_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const xmlText = await response.text();
    const feed = parseFeed(xmlText);

    // Step 1: Remove Politics & Policy categories
    const filteredItems = feed.items.filter((item) => {
      if (!item.categories || !Array.isArray(item.categories)) return true;

      return !item.categories.some((category: FeedCategory) => {
        if (typeof category === "string") {
          return (
            category === "Politics" ||
            category === "Policy" ||
            category === "Movie Review" ||
            category === "Buying Guide" ||
            category === "Deals" ||
            category === "Gadgets" ||
            category === "Smart Home" ||
            category === "Reviews"
          );
        }
        if (category && typeof category === "object") {
          return (
            category.term === "Politics" ||
            category.term === "Policy" ||
            category.term === "Movie Review" ||
            category.term === "Buying Guide" ||
            category.term === "Deals" ||
            category.term === "Gadgets" ||
            category.term === "Smart Home" ||
            category.term === "Reviews" ||
            (category.$ &&
              (category.$.term === "Politics" ||
                category.$.term === "Policy" ||
                category.$.term === "Movie Review" ||
                category.$.term === "Buying Guide" ||
                category.$.term === "Deals" ||
                category.$.term === "Gadgets" ||
                category.$.term === "Smart Home" ||
                category.$.term === "Reviews"))
          );
        }
        return false;
      });
    });

    // Step 2: Include if category is Tech OR News (or both)
    const techNewsItems = filteredItems.filter((item) => {
      if (!item.categories || !Array.isArray(item.categories)) return false;

      return item.categories.some((category: FeedCategory) => {
        if (typeof category === "string") {
          return category === "Tech" || category === "News"; // Accept if either is present
        }
        if (category && typeof category === "object") {
          return (
            category.term === "Tech" ||
            category.term === "News" ||
            (category.$ &&
              (category.$.term === "Tech" || category.$.term === "News"))
          );
        }
        return false;
      });
    });

    const latestTechNewsItem = techNewsItems[0];

    if (!latestTechNewsItem) {
      return {
        success: false,
        message: "No Tech/News feed items found",
        title: "",
        description: "",
        content: "",
        contentLength: "",
        orignalContent: "",
      };
    }

    // Clean and prepare the content
    const cleanedContent = cleanContent(latestTechNewsItem.content || "");
    const title = escapeMarkdownV2(latestTechNewsItem.title || "No Title");
    const content = escapeMarkdownV2(cleanedContent);

    // Use waitUntil for background processing
    // waitUntil(backgroundProcessing);

    return {
      title,
      description: latestTechNewsItem.description,
      content,
      contentLength: cleanedContent.length,
      orignalContent: techNewsItems[0].content,
    };
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    throw error;
  }
}
