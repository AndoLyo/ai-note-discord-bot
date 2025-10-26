import fetch from 'node-fetch';

/**
 * note.comからAI・プロンプト関連のトレンド記事を取得
 */
export async function fetchNoteContent() {
  try {
    // AI関連のハッシュタグで検索（主要なもののみ）
    const hashtags = ['StableDiffusion', '画像生成AI', 'プロンプト', 'ChatGPT', 'Gemini', 'Claude'];
    const allArticles = [];
    const seenUrls = new Set();

    // 各ハッシュタグから人気記事を取得
    for (const hashtag of hashtags) {
      const articles = await fetchHashtagTrendingNotes(hashtag);

      // 重複URLを除外しながら追加
      for (const article of articles) {
        if (!seenUrls.has(article.url)) {
          seenUrls.add(article.url);
          allArticles.push(article);
        }
      }
    }

    // スキ数でソート
    const sortedArticles = allArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    console.log(`[Note] ${sortedArticles.length}件のトレンドコンテンツを取得しました`);
    return sortedArticles;

  } catch (error) {
    console.error('[Note] エラー:', error.message);
    return [];
  }
}

/**
 * 特定のハッシュタグのトレンド記事を取得
 */
async function fetchHashtagTrendingNotes(hashtag) {
  try {
    const url = `https://note.com/api/v3/searches?context=note&q=${encodeURIComponent(hashtag)}&sort=trend`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`[Note] HTTP Error for #${hashtag}: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.data || !data.data.notes || !data.data.notes.contents) {
      return [];
    }

    const articles = data.data.notes.contents
      .filter(note => note && note.key && (note.name || note.body))
      .slice(0, 2) // 各ハッシュタグから5件
      .map(note => {
        const userUrlname = note.user ? note.user.urlname : 'unknown';
        return {
          title: note.name || note.body?.substring(0, 50) || 'タイトルなし',
          url: `https://note.com/${userUrlname}/n/${note.key}`,
          description: note.body ? note.body.substring(0, 200) : note.description || '',
          score: note.like_count || 0,
          source: 'Note',
          imageUrl: note.eyecatch_url || note.sp_eyecatch_url || null,
          author: note.user ? note.user.nickname : '不明',
          publishedAt: note.publish_at || note.created_at,
          likeCount: note.like_count || 0,
          hashtag: hashtag
        };
      });

    return articles;

  } catch (error) {
    console.error(`[Note] ハッシュタグ ${hashtag} のエラー:`, error.message);
    return [];
  }
}

