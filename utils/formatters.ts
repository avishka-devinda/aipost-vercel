export function escapeMarkdownV2(text: string) {
    return text.replace(/([_*[\]()~>#+\-=|{}.!])/g, "\\$1");
  }

  export function escapeMarkdownV2Recap(text: string) {
    return text.replace(/([_*\[\]()~`>#+\-=|{}!\\\.\/])/g, '\\$1');
 }
  
  export function cleanContent(content: string): string {
    if (!content) return "";
  
    // Remove HTML tags
    let cleanText = content.replace(/<[^>]*>/g, "");
  
    // Remove TechCrunch copyright notice
    cleanText = cleanText
      .replace(/\[&#8230;\]/g, "")
      .replace(
        /© \d{4} TechCrunch\. All rights reserved\. For personal use only\./g,
        ""
      )
      .trim();
  
    return cleanText;
  }
  

  export function escapeMarkdownTags(text: string) {
    // Characters that need escaping in MarkdownV2: _ * [ ] ( ) ~ ` > # + - = | { } . !
    return text.replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, '\\$1');
  }