import { google } from "@ai-sdk/google";
import { CoreMessage, generateText, tool } from "ai";
import { z } from "zod";

export const techPostTool = tool({
  description: "Generate a tech update post",
  parameters: z.object({
    headline: z.string().describe("Headline of the post").max(200),
    body: z.string().describe("Main content of the post").max(1024),
    EnglishTitle: z.string().describe("Englisj Title of the post"),
    hashtags: z.string().describe("Tags for the post and include #WayOfMando").max(200),
  }),
  execute: async ({ headline, body, EnglishTitle, hashtags }) => ({
    headline,
    body,
    EnglishTitle,
    hashtags,
  }),
});

export const thoughtCommentaryTool = tool({
  description: "Generate a thoughtful commentary on a previous post",
  parameters: z.object({
    commentary: z
      .string()
      .describe(
        "Detailed commentary mixing Sinhala, English, and technical insights"
      ),
    tone: z
      .enum(["informal", "analytical", "reflective"])
      .describe("Tone of the commentary"),
  }),
  execute: async ({ commentary, tone }) => ({ commentary, tone }),
});

// export async function generateTechPost(newsContent: string,headline: string) {
//   const userMessage: CoreMessage = {
//     role: "user",
//     content: `
//     Generate a concise summary of the given article.
//     The post should have a catchy headline and engaging content.
//     Keep it formal and natural. The output should be **70% Sinhala, 30% English**.

//     **Sinhala-English Mix Guidelines:**
//     - Explain in Sinhala but use English for technical terms.
//     - Key verbs can be in English (e.g., "update", "launch", "optimize").
//     - The first time an English term is mentioned, provide a Sinhala translation.
//     - Don't use any Hindi.
//     - Nouns will be in English.
//     Here's the full article title to use as reference:
//     ${headline}
//     Here's the full article content to use as reference:
//     ${newsContent.substring(0, 8000)}`,
//   };

// export async function generateTechPost(newsContent: string, headline: string) {
//   const userMessage: CoreMessage = {
//     role: "user",
//     content: `
//       Please generate a concise summary of this technology article.

//     Guidelines:
//     - Create a catchy headline and engaging content
//     - Use a formal but natural tone
//     - Mix languages: 70% Sinhala, 30% English
//     - Keep technical terms in English
//     - Common verbs like "update", "launch", "optimize" can be in English
//     - When introducing English terms, include Sinhala translations
//     - Use English for nouns
//     - No Hindi terms

//     Article headline: ${headline}
//     English Title: ${headline}
//     Article content:
//     ${newsContent.substring(0, 8000)}
//     `,
//   };

//   const aiModel = google("gemini-1.5-pro-latest");
//   const aiResponse = await generateText({
//     model: aiModel,
//     messages: [userMessage],
//     tools: { techPost: techPostTool },
//     toolChoice: "required",
//   });

//   return aiResponse.toolResults[0].result;
// }

// export async function generateTechPost(newsContent: string, headline: string) {
//   const userMessage: CoreMessage = {
//     role: "user",
//     content: `
//       You are the admin of the "Way of Mando" Telegram channel, which shares Sinhala tech updates. When writing posts, please:
//       1. Write in a natural, human-like tone that avoids sounding artificial
//       2. Mix Sinhala (70%) and English (30%) - use English verbs and nouns where appropriate
//       3. Include friendly, professional greetings - avoid overly enthusiastic or "cringe" introductions
//       5. Summarize any content we provide into this Sinhala/English format
//       6. Do not mention "folder phones" in your content
//       7. Remember our channel has no comment section, so avoid phrases like "මේ ගැන මොකද හිතෙන්නේ? Comment section එකේ comment එකක් දාගෙන යන්න! 👇"
//       8. Maintain a friendly, conversational tone appropriate for a tech channel
//       9. Never mention being an AI or that the post was AI-generated
//       10. Do not write any Hindi content
//       11. Do not use Singlish (English words written in Sinhala script) - only use proper Sinhala and proper English

//       Article headline: ${headline}
//       English Title: ${headline}
//       Article content:
//       ${newsContent.substring(0, 8000)}
//     `,
//   };

export async function generateTechPost(newsContent: string, headline: string) {
  const userMessage: CoreMessage = {
    role: "user",
    content: `
     You are the admin of the "Way of Mando" Telegram channel, which shares Sinhala tech updates. When writing posts, please:
      1. Write in a natural, human-like tone that avoids sounding artificial
      2. Mix Sinhala (70%) and English (30%) - use English verbs and nouns where appropriate
      3. Avoid overly enthusiastic or "cringe" introductions
      4. Summarize any content we provide into this Sinhala/English format
      5. Do not mention "folder phones" in your content
      6. Remember our channel has no comment section, so avoid phrases like "මේ ගැන මොකද හිතෙන්නේ? Comment section එකේ comment එකක් දාගෙන යන්න! 👇"
      7. Maintain a friendly, conversational tone appropriate for a tech channel
      8. Never mention being an AI or that the post was AI-generated
      9. Do not write any Hindi content
      10. Do not use Singlish (English words written in Sinhala script) - only use proper Sinhala and proper English
      11. Do not use any emojis in the content
      12. Keep the tone professional and avoid greetings
      13. Use "AKA" in uppercase when referring to alternative names (not lowercase "aka")
      14. Content should not exceed 1024 characters total

      Article headline: ${headline}
      English Title: ${headline}
      Article content:
     ${newsContent.substring(0, 8000)}
    `,
  };

  // 14: content should be max 1024 characters

  const aiModel = google("gemini-1.5-pro-latest");
  const aiResponse = await generateText({
    model: aiModel,
    messages: [userMessage],
    tools: { techPost: techPostTool },
    toolChoice: "required",
  });

  return aiResponse.toolResults[0].result;
}

export async function generateThoughtCommentary(previousPostContent: string) {
  const userMessage: CoreMessage = {
    role: "user",
    content: `
      Generate a thoughtful commentary on the following post.  
      Output should be:  
      - 70% Sinhala, 30% English  
      - formal yet insightful  
      - A mix of technical terminology with conversational language  
  
      **Language Guidelines:**  
      - Use English for technical terms  
      - Provide Sinhala translations for first-time technical terms  
      - Keep the tone casual and engaging  
      - Avoid Hindi completely  
      - Do not be cringe  
  
      **Additional Instructions:**  
      - Start naturally, like a human typing.  
      - Do NOT start with "ආයුබෝවන්"
      - Add a few natural pauses and casual phrasing.  
  
      **Previous Post Content:**  
      ${previousPostContent.substring(0, 5000)}
  
      Provide insights, potential implications, and an interesting perspective on the content.
    `,
  };

  const aiModel = google("gemini-1.5-pro-latest");
  const aiResponse = await generateText({
    model: aiModel,
    messages: [userMessage],
    tools: { thoughtCommentary: thoughtCommentaryTool },
    toolChoice: "required",
  });

  return aiResponse.toolResults[0].result;
}
