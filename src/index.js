import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { fetchNoteContent } from './services/note.js';
import { summarizeContent } from './services/gemini.js';
import { aggregateAndRankContent, markAsPosted, getPostedUrlsCount } from './utils/contentManager.js';

dotenv.config();

// Discord Clientの初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

/**
 * メイン処理: コンテンツを取得して投稿
 */
async function fetchAndPostContent() {
  try {
    console.log('\n========== コンテンツ収集開始 ==========');

    // Noteから人気のAI記事を取得
    const noteContent = await fetchNoteContent();

    // コンテンツをランキング
    const rankedContent = await aggregateAndRankContent([noteContent]);

    if (rankedContent.length === 0) {
      console.log('新しいコンテンツがありません');
      return;
    }

    // 投稿数の制限
    const maxPosts = parseInt(process.env.MAX_POSTS_PER_RUN || '5');
    const topContent = rankedContent.slice(0, maxPosts);

    console.log(`\n========== 投稿開始 (${topContent.length}件) ==========`);

    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);

    // 各コンテンツを投稿
    for (const content of topContent) {
      await postContent(channel, content);
      await markAsPosted(content.url);

      // レート制限対策: 投稿間に少し待機
      await sleep(3000);
    }

    const totalPosted = await getPostedUrlsCount();
    console.log(`\n========== 投稿完了 (累計: ${totalPosted}件) ==========\n`);

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

/**
 * Discordにコンテンツを投稿（2段階投稿）
 */
async function postContent(channel, content) {
  try {
    console.log(`\n[投稿] ${content.title}`);

    // === 第1投稿: URLのみ ===
    const urlMessage = `🔗 **${content.source}** から\n${content.url}`;
    const firstMessage = await channel.send(urlMessage);

    // 少し待機
    await sleep(1500);

    // === 第2投稿: Gemini要約 ===
    const summary = await summarizeContent(content);

    const embed = new EmbedBuilder()
      .setColor(getSourceColor(content.source))
      .setTitle('📝 要約')
      .setDescription(summary)
      .addFields(
        { name: '📊 人気度', value: `${content.score}`, inline: true },
        { name: '🌐 ソース', value: content.source, inline: true }
      )
      .setTimestamp();

    // 画像がある場合は追加
    if (content.imageUrl) {
      embed.setImage(content.imageUrl);
    }

    await channel.send({ embeds: [embed] });

    console.log(`[投稿完了] ${content.title}`);

  } catch (error) {
    console.error(`[投稿エラー] ${content.title}:`, error.message);
  }
}

/**
 * ソースごとの色を取得
 */
function getSourceColor(source) {
  const colors = {
    'Note': 0x41C9B4         // 緑（noteのブランドカラー）
  };
  return colors[source] || 0x5865F2;
}

/**
 * スリープ関数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * BOT起動時の処理
 */
client.once('ready', async () => {
  console.log(`✅ ログイン成功: ${client.user.tag}`);
  console.log(`📢 チャンネルID: ${process.env.DISCORD_CHANNEL_ID}`);

  // 初回実行
  await fetchAndPostContent();

  // 定期実行（環境変数で指定された間隔）
  const intervalMinutes = parseInt(process.env.POST_INTERVAL_MINUTES || '60');
  console.log(`⏰ ${intervalMinutes}分ごとに実行します`);

  setInterval(async () => {
    await fetchAndPostContent();
  }, intervalMinutes * 60 * 1000);
});

// BOTを起動
client.login(process.env.DISCORD_BOT_TOKEN);
