import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { generateThoughtCommentary, generateWeeklyAnalysis, generateChannelShare } from '../../services/ai.js'
import { getLastWeekPosts, getLatestPost } from '../../services/feedService.js'
import { TELEGRAM_CHANNEL_ID } from "../../config/index.js"
import { bot } from "../../services/telegram.js"
import { escapeMarkdownTags, escapeMarkdownV2 } from "../../utils/formatters.js"
import { createSharedPost, deleteSharedPost, getLatestSharedPost } from '../../services/sharedPostService.js'

const TELEGRAM_CHANNEL_LINK = 't.me/WayOfMando';

const app = new Hono().basePath('/api')

app.get('/schedule', async (c) => {

    //check schedule

    const schedule = {
        monday: 'share',//'tech-news',
        tuesday: 'share-delete', //'tech-fun-facts',
        wednesday: 'share',//'industry-insights',
        thursday: 'share',//'tool-review',
        friday: 'myth',
        saturday: 'personal-story',
        sunday: 'weekly-think',
    }

    // Map numeric day to day name
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    
    //get today's schedule
    const today = new Date().getDay();
    const dayName = dayMap[today];
    const scheduleType = schedule[dayName];




const latestPost = await getLatestPost();
    if (!latestPost) {
        return c.json({ error: 'No posts found' }, 404);
    }
    
    const { feedTitle, feedDescription, aiContent, postLink, createdAt } = latestPost;
    
    
    try {
        let response;
        
        if (scheduleType === 'weekly-think') {
            const weeklyPosts = await getLastWeekPosts();
            const weeklyAnalysis = await generateWeeklyAnalysis(weeklyPosts);
            console.log('AI Generated Weekly Analysis:', weeklyAnalysis);
            response = { message: scheduleType, content: weeklyAnalysis.analysis };
        } else if (scheduleType === 'share') {
            // Share post on Wednesday
            const channelShare = await generateChannelShare(TELEGRAM_CHANNEL_LINK);
            const formattedMessage = escapeMarkdownV2(channelShare.message);
            const fullMessage = `${formattedMessage}\n\n${escapeMarkdownV2(TELEGRAM_CHANNEL_LINK)}\n\n${escapeMarkdownTags(`${channelShare.hashtags}`)}`;            
            const encodedTitle = encodeURIComponent(channelShare.englishTitle);
            const ogurl = `https://techpost-og.vercel.app/share?title=${encodedTitle}`;
            const sentMessage = await bot.api.sendPhoto(TELEGRAM_CHANNEL_ID, ogurl, {
                caption: fullMessage,
                parse_mode: "MarkdownV2",
            });
            // await createSharedPost({
            //     messageId: sentMessage.message_id,
            //     channelId: TELEGRAM_CHANNEL_ID,
            //     content: channelShare.message
            // });
            await createSharedPost(sentMessage.message_id.toString(), TELEGRAM_CHANNEL_ID);

            response = { message: scheduleType, content: "Post shared successfully" };
        } else if (scheduleType === 'share-delete') {
            // Delete post on Friday
            const latestPost = await getLatestSharedPost();
            if (latestPost) {
                await bot.api.deleteMessage(latestPost.channelId, latestPost.messageId);
                await deleteSharedPost(latestPost.id);
                response = { message: scheduleType, content: "Previous shared post deleted successfully" };
            } else {
                response = { message: scheduleType, content: "No shared posts found" };
            }
        } else {
            const thoughtai = await generateThoughtCommentary(aiContent);
            console.log('AI Generated Thought:', thoughtai);
            response = { message: scheduleType, content: thoughtai };
        }
        
        return c.json(response);
    } catch (error) {
        console.error('Error generating content:', error);
        return c.json({ error: 'Failed to generate content' }, 500);
    }
})

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;