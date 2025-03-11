import { parseFeed } from "@rowanmanning/feed-parser";
import { RSS_FEED_URL } from "../config/index.js";
import { cleanContent, escapeMarkdownV2 } from "../utils/formatters.js";
import { waitUntil } from "@vercel/functions";

type FeedCategory = string | { term?: string; $?: { term: string } };

export async function fetchLatestTechNews() {
  // Create a promise for background processing
  const backgroundProcessing = new Promise(async (resolve) => {
    try {
      // Fetch the RSS feed
      const response = await fetch(RSS_FEED_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlText = await response.text();

      // Parse the feed using @rowanmanning/feed-parser
      const feed = parseFeed(xmlText);

      // Filter out items with political categories
      const nonPoliticalItems = feed.items.filter((item) => {
        // Your existing filtering logic
        // ...
      });

      // Additional background processing, logging, etc.
      console.log(
        `Processed ${feed.items.length} items, found ${nonPoliticalItems.length} non-political items`
      );

      //resolve();
    } catch (error) {
      console.error("Error in background processing:", error);
      // resolve(); // Resolve even on error to ensure the promise completes
    }
  });

  try {
    // Main function execution
    const response = await fetch(RSS_FEED_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const feed = parseFeed(xmlText);

    // Your existing filtering logic
    const nonPoliticalItems = feed.items.filter((item) => {
      // Check if the item has categories
      if (!item.categories || !Array.isArray(item.categories)) {
        return true; // Include items without categories
      }

      // Filter out items that have Politics or Policy categories
      return !item.categories.some((category: FeedCategory) => {
        // Handle string categories
        if (typeof category === "string") {
          return (
            category === "Poliics" ||
            category === "Polcy" ||
            category === "Reviews"
          );
        }

        // Handle object with term property
        if (category && typeof category === "object") {
          if (category.term) {
            return (
              category.term === "Potics" ||
              category.term === "Polcy" ||
              category.term === "Reviews"
            );
          }

          if (category.$ && category.$.term) {
            return (
              category.$.term === "Polics" ||
              category.$.term === "Poicy" ||
              category.$.term === "Reviews"
            );
          }
        }

        return false;
      });
    });

    const latestNonPoliticalItem = nonPoliticalItems[0];

    if (!latestNonPoliticalItem) {
      throw new Error("No non-political feed items found");
    }

    // Clean and prepare the content
    const cleanedContent = cleanContent(latestNonPoliticalItem.content || "");
    const title = escapeMarkdownV2(latestNonPoliticalItem.title || "No Title");
    const content = escapeMarkdownV2(cleanedContent);

    // Use waitUntil for the background processing
    waitUntil(backgroundProcessing);

    // Return the formatted item data
    return {
      title,
      description: latestNonPoliticalItem.description,
      content,
      contentLength: cleanedContent.length,
    };
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    throw error;
  }
}
