import prisma from '../utils/prisma.js';

export async function createSharedPost(postId: string, channelId: string) {
  try {
    const sharedPost = await prisma.sharedPost.create({
      data: {
        messageId: parseInt(postId),
        channelId,
        title: "" // Required field according to schema
      }
    });
    return sharedPost;
  } catch (error) {
    console.error('Error creating shared post:', error);
    throw error;
  }
}

export async function deleteSharedPost(id: string) {
  try {
    const deletedPost = await prisma.sharedPost.delete({
      where: { id }
    });
    return deletedPost;
  } catch (error) {
    console.error('Error deleting shared post:', error);
    throw error;
  }
}

export async function getSharedPostById(id: string) {
  try {
    const sharedPost = await prisma.sharedPost.findUnique({
      where: { id }
    });
    return sharedPost;
  } catch (error) {
    console.error('Error getting shared post:', error);
    throw error;
  }
}

export async function getAllSharedPosts() {
  try {
    const sharedPosts = await prisma.sharedPost.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return sharedPosts;
  } catch (error) {
    console.error('Error getting shared posts:', error);
    throw error;
  }
}

export async function getLatestSharedPost() {
  try {
    const latestPost = await prisma.sharedPost.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    console.log(latestPost)
    return latestPost;
  } catch (error) {
    console.error('Error getting latest shared post:', error);
    throw error;
  }
}



export async function getLatestFeedPost() {
  try {
    const latestPost = await prisma.feed.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    console.log(latestPost)
    const data = latestPost?.feedSummary || ''
    return data;
  } catch (error) {
    console.error('Error getting latest feed post:', error);
    throw error;
  }
}