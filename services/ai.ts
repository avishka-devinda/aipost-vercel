import { google } from "@ai-sdk/google";
import { CoreMessage, generateText, tool } from "ai";
import { z } from "zod";

export const techPostTool = tool({
  description: "Generate a tech update post",
  parameters: z.object({
    headline: z.string().describe("Headline of the post").max(200),
    body: z.string().describe("Main content of the post Mix Sinhala (70%) and English (30%) - use English verbs and nouns where appropriate").max(1024),
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


export const weeklyAnalysisTool = tool({
  description: "Generate a weekly tech news analysis",
  parameters: z.object({
    analysis: z.string().describe("Analysis of the week's tech news trends and insights"),
  }),
  execute: async ({ analysis }) => ({ analysis }),
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
      9. Do not write any Hindi content or tamil content
      10. Do not use Singlish (English words written in Sinhala script) - only use proper Sinhala and proper English
      11. Do not use any emojis in the content
      12. Keep the tone professional and avoid greetings
      13. Use "AKA" in uppercase when referring to alternative names (not lowercase "aka")
      14. Content should not exceed 1024 characters total
      15. Do not use singlish
      16. Avoid using hashtags

      Article headline: ${headline}
      English Title: ${headline}
      Article content:
     ${newsContent.substring(0, 8000)}
    `,
  };

  // 14: content should be max 1024 characters
//"gemini-2.0-flash-001"
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



export async function generateWeeklyAnalysis(weeklyPosts: { feedTitle: string; feedDescription: string }[]) {
  const combinedContent = weeklyPosts
    .map(post => `Title: ${post.feedTitle}\nDescription: ${post.feedDescription}`)
    .join('\n\n');

  //  console.log({combinedContent})

  // const userMessage: CoreMessage = {
  //   role: "user",
  //   content: `
  //     Analyze these tech news posts from the past week and provide insights.

  //     Guidelines:
  //     - Mix languages: 70% Sinhala, 30% English
  //     - Identify key trends and patterns
  //     - Highlight the most significant developments
  //     - Add thoughtful predictions or implications
  //     - Keep technical terms in English
  //     - Provide Sinhala translations for technical terms
  //     - Make it engaging and insightful
  //     - No Hindi terms

  //     Weekly Posts:
  //     ${combinedContent}
  //   `,

  const userMessage: CoreMessage = {
    role: "user",
    content: `
 You are the admin of the "Way of Mando" Telegram channel, which shares Sinhala tech updates. When writing weekly analysis posts, please:

1. Write in a natural, human-like tone that avoids sounding artificial
2. Mix Sinhala (70%) and English (30%) - use English verbs and nouns where appropriate
3. Avoid overly enthusiastic or "cringe" introductions
4. Summarize any content we provide into this Sinhala/English format
5. Do not mention "folder phones" in your content
6. We don't have a discussion area, so never ask communication questions like "මේ ගැන ඔයාලගේ අදහස් මොනවද?" or "මේක ගැන මොකද හිතන්නේ? 🤔" or "Comment section එකේ comment එකක් දාගෙන යන්න! 👇"
7. Maintain a friendly, conversational tone appropriate for a tech channel
8. Never mention being an AI or that the post was AI-generated
9. Do not write any Hindi content
10. Do not use Singlish (English words written in Sinhala script) - only use proper Sinhala and proper English
11. Do not use any emojis in the content
12. Keep the tone professional and avoid greetings
13. Use "AKA" in uppercase when referring to alternative names (not lowercase "aka")
14. Content should not exceed 3024 characters total
15. Include a weekly analysis summarizing what happened this week in tech and your thoughts about these developments

Weekly Posts:
${combinedContent}

    `,
  };

  const aiModel = google("gemini-1.5-pro-latest");
  const aiResponse = await generateText({
    model: aiModel,
    messages: [userMessage],
    tools: { weeklyAnalysis: weeklyAnalysisTool },
    toolChoice: "required",
  });

  return aiResponse.toolResults[0].result;
}



export const top3HeadlinesTool = tool({
  description: "Select top 3 most significant tech headlines",
  parameters: z.object({
    headlines: z.array(z.string()).describe("Top 3 selected headlines with brief justification in English Only"),
  }),
  execute: async ({ headlines }) => ({ headlines }),
});

export async function chooseTop3WeeklyRecap(weeklyPosts: { feedTitle: string }[]) {
  const userMessage: CoreMessage = {
    role: "user",
    content: `
      Analyze these tech headlines and select the top 3 most significant ones.
      
      Guidelines:
      - Choose based on:
        1. Technological impact and innovation
        2. Market significance and industry influence
        3. User/consumer relevance
      - languages English
      - Provide Sinhala translations for technical terms
      - Make it engaging and insightful
      - No Hindi terms
      
      Weekly Headlines:
      ${weeklyPosts.map(post => post.feedTitle).join('\n')}
    `,
  };

  const aiModel = google("gemini-2.0-flash-001");
  const aiResponse = await generateText({
    model: aiModel,
    messages: [userMessage],
    tools: { top3Headlines: top3HeadlinesTool },
    toolChoice: "required",
  });

  return aiResponse.toolResults[0].result;
}

export const channelShareTool = tool({
  description: "Generate a channel sharing post",
  parameters: z.object({
    englishTitle: z.string().describe("Engaging English title for the channel share and Avoid using '&'"),
    message: z.string().describe("Channel sharing message with call-to-action"),
    hashtags: z.string().describe("Hashtags for the channel share include #WayOfMando #Share #Tech #Srilanka #AI too"),
  }),
  execute: async ({ englishTitle, message, hashtags }) => ({ englishTitle, message, hashtags }),
});
export async function generateChannelShare(channelLink: string) {
  const aiModel = google("gemini-1.5-pro-latest");

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: `
        Create an engaging announcement for Sri Lanka's first AI-powered Telegram tech channel, 'Way of Mando.' The post should:
        
        1. Mix languages: 70% Sinhala, 30% English (use English primarily for tech terms)
        2. Highlight that the channel is fully automated, providing tech updates, weekly recaps, and AI insights
        3. Use an informal, conversational tone throughout - write like you're messaging a friend
        4. Avoid overly enthusiastic or "cringe" introductions
        5. Include some personality and humor where appropriate
        6. Explain the value of accessing tech content in Sinhala
        7. Emphasize the community aspect and encourage discussions
        8. Include a clear call-to-action to join and share with friends
        9. Use 2-3 appropriate emojis (but don't overdo it)
        10. Keep content under 1024 characters
        11. Avoid Singlish (English words written in Sinhala script)
        12. Avoid using the words: "මචංලා", "ආයුබෝවන්", "හලෝ යාළුවනේ", "හලෝ", "යාළුවනේ"
        13. Use an energetic and modern tone that feels genuine, not corporate
        14. Don't include "Join now: [Telegram Channel Link]"
        15. Avoid using '&' in the englishTitle
        16. Don't include hashtags in content
        17. **Avoid generic intros** – Start directly with an engaging message instead of a typical greeting.

        The post should feel like it's coming from a real tech enthusiast inviting friends to join a cool community.
      `,
    },
    {
      role: "user",
      content: "Generate a post following the above rules.",
    },
  ];

  const aiResponse = await generateText({
    model: aiModel,
    messages: messages, // Ensure messages is properly structured
    tools: { channelShare: channelShareTool },
    toolChoice: "required",
  });

  return aiResponse.toolResults[0]?.result;
}
