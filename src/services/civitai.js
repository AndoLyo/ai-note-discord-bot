import fetch from 'node-fetch';

/**
 * Civitai APIから人気の画像を取得
 */
export async function fetchCivitaiContent() {
  try {
    const url = 'https://civitai.com/api/v1/images?limit=20&sort=Most Reactions&period=Day';

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Civitai API error: ${response.status}`);
    }

    const data = await response.json();

    // データを整形
    const contents = data.items.map(item => {
      // プロンプト情報を取得
      const meta = item.meta || {};
      const prompt = meta.prompt || 'プロンプト情報なし';

      return {
        source: 'Civitai',
        url: `https://civitai.com/images/${item.id}`,
        title: `Civitai Image #${item.id}`,
        description: prompt.substring(0, 500), // プロンプトの最初の500文字
        imageUrl: item.url,
        score: item.stats?.likeCount || 0,
        metadata: {
          reactions: item.stats?.likeCount || 0,
          comments: item.stats?.commentCount || 0,
          model: meta.Model || 'Unknown',
          prompt: prompt
        }
      };
    });

    console.log(`[Civitai] ${contents.length}件のコンテンツを取得しました`);
    return contents;

  } catch (error) {
    console.error('[Civitai] エラー:', error.message);
    return [];
  }
}
