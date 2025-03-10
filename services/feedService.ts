import prisma from '../utils/prisma.js';

interface FeedData {
  feedTitle: string;
  feedDescription: string;
  feedContent: string;
  feedSummary: string;
  aiHeadline: string;
  aiContent: string;
  postLink: string;
}

export async function saveFeedData(data: FeedData) {
  try {
    const feed = await prisma.feed.create({
      data: {
        ...data
      }
    });
    return feed;
  } catch (error) {
    console.error('Error saving feed data:', error);
    throw error;
  }
}

export async function getFeedById(id: string) {
  try {
    const feed = await prisma.feed.findUnique({
      where: { id }
    });
    return feed;
  } catch (error) {
    console.error('Error getting feed:', error);
    throw error;
  }
}

export async function getAllFeeds() {
  try {
    const feeds = await prisma.feed.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return feeds;
  } catch (error) {
    console.error('Error getting feeds:', error);
    throw error;
  }
}

export async function getLastWeekPosts() {
  try {
    const lastWeekPosts = await prisma.feed.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        feedTitle: true,
        aiHeadline: true,
        feedDescription: true,
        postLink: true,
        createdAt: true
      }
    });
    return lastWeekPosts;
  } catch (error) {
    console.error('Error getting weekly posts:', error);
    throw error;
  }
}



export async function getLastWeekPostsTitle() {
  try {
    const lastWeekPosts = await prisma.feed.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        feedTitle: true,
        postLink: true,
        createdAt: true
      }
    });
    return lastWeekPosts;
  } catch (error) {
    console.error('Error getting weekly posts:', error);
    throw error;
  }
}
