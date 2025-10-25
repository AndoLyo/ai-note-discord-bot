import snoowrap from 'snoowrap';

/**
 * Reddit APIクライアントを初期化
 */
function createRedditClient() {
  return new snoowrap({
    userAgent: 'AI Content Discord Bot v1.0',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
  });
}

/**
 * Redditから人気の投稿を取得
 */
export async function fetchRedditContent() {
  try {
    const reddit = createRedditClient();

    // AI関連のサブレディット
    const subreddits = [
      'StableDiffusion',
      'midjourney',
      'AIArt',
      'dalle2',
      'ChatGPT'
    ];

    const allPosts = [];

    // 各サブレディットから人気投稿を取得
    for (const subreddit of subreddits) {
      try {
        const posts = await reddit
          .getSubreddit(subreddit)
          .getHot({ limit: 5, time: 'day' });

        for (const post of posts) {
          // 画像またはリンク投稿のみ
          if (post.url && !post.is_self) {
            allPosts.push({
              source: 'Reddit',
              url: `https://reddit.com${post.permalink}`,
              title: post.title,
              description: post.selftext || post.title,
              imageUrl: post.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? post.url : null,
              score: post.ups || 0,
              metadata: {
                subreddit: subreddit,
                upvotes: post.ups || 0,
                comments: post.num_comments || 0,
                author: post.author.name
              }
            });
          }
        }
      } catch (error) {
        console.error(`[Reddit] r/${subreddit} エラー:`, error.message);
      }
    }

    console.log(`[Reddit] ${allPosts.length}件のコンテンツを取得しました`);
    return allPosts;

  } catch (error) {
    console.error('[Reddit] エラー:', error.message);
    return [];
  }
}
