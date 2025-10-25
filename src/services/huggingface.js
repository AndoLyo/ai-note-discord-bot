import fetch from 'node-fetch';

/**
 * HuggingFace Spacesからトレンドを取得
 */
export async function fetchHuggingFaceContent() {
  try {
    const url = 'https://huggingface.co/api/spaces';

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const spaces = await response.json();

    // トレンドのスペースを抽出（likes順でソート）
    const trendingSpaces = spaces
      .filter(space => space.likes > 10) // 最低10いいね以上
      .sort((a, b) => b.likes - a.b.likes)
      .slice(0, 10);

    const contents = trendingSpaces.map(space => ({
      source: 'HuggingFace',
      url: `https://huggingface.co/spaces/${space.id}`,
      title: space.id.split('/')[1] || space.id,
      description: space.cardData?.title || space.id,
      imageUrl: null,
      score: space.likes || 0,
      metadata: {
        likes: space.likes || 0,
        author: space.author || 'Unknown',
        sdk: space.sdk || 'Unknown'
      }
    }));

    console.log(`[HuggingFace] ${contents.length}件のコンテンツを取得しました`);
    return contents;

  } catch (error) {
    console.error('[HuggingFace] エラー:', error.message);
    return [];
  }
}
