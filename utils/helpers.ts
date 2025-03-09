import { postSchedule } from "../config/index.js";


export function getTodayPostType(): string {
  const today = new Date()
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();
  return postSchedule[today as keyof typeof postSchedule] || "Tech Update";
}

export function generateMockPost() {
  const topics = [
    "Technology",
    "AI",
    "Web Development",
    "Cloud Computing",
    "Cybersecurity",
  ];
  const titles = [
    "Breaking News: New Framework Released",
    "Top 10 Programming Languages in 2025",
    "The Future of AI Development",
    "Cloud Computing Trends",
    "Security Best Practices",
  ];

  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    topic: topics[Math.floor(Math.random() * topics.length)],
    timestamp: new Date().toISOString(),
    content: `This is a mock post about ${
      topics[Math.floor(Math.random() * topics.length)]
    }. #tech #news`,
  };
}
