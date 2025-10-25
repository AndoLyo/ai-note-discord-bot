import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTED_URLS_FILE = path.join(__dirname, '../../posted_urls.json');

/**
 * 投稿済みURLを読み込む
 */
async function loadPostedUrls() {
  try {
    const data = await fs.readFile(POSTED_URLS_FILE, 'utf-8');
    return new Set(JSON.parse(data));
  } catch (error) {
    // ファイルが存在しない場合は空のセットを返す
    return new Set();
  }
}

/**
 * 投稿済みURLを保存
 */
async function savePostedUrls(urls) {
  await fs.writeFile(POSTED_URLS_FILE, JSON.stringify([...urls], null, 2));
}

/**
 * 複数ソースからのコンテンツを統合し、スコアリングする
 */
export async function aggregateAndRankContent(contentArrays) {
  const postedUrls = await loadPostedUrls();

  // 全コンテンツを統合
  const allContent = contentArrays.flat();

  // 重複チェック（既に投稿済みのURLを除外）
  const newContent = allContent.filter(item => !postedUrls.has(item.url));

  // スコアリング: ソースごとに重み付け
  const scoredContent = newContent.map(item => {
    let finalScore = item.score;

    // ソースごとの重み付け
    switch (item.source) {
      case 'Civitai':
        finalScore *= 1.5; // Civitaiは画像生成AI専門なので優先度高
        break;
      case 'Reddit':
        finalScore *= 1.2;
        break;
      case 'HuggingFace':
        finalScore *= 1.0;
        break;
    }

    return {
      ...item,
      finalScore
    };
  });

  // スコア順でソート
  scoredContent.sort((a, b) => b.finalScore - a.finalScore);

  console.log(`[ContentManager] ${newContent.length}件の新規コンテンツ (重複除外後)`);

  return scoredContent;
}

/**
 * URLを投稿済みとしてマーク
 */
export async function markAsPosted(url) {
  const postedUrls = await loadPostedUrls();
  postedUrls.add(url);
  await savePostedUrls(postedUrls);
  console.log(`[ContentManager] 投稿済みURLを記録: ${url}`);
}

/**
 * 投稿済みURL数を取得
 */
export async function getPostedUrlsCount() {
  const postedUrls = await loadPostedUrls();
  return postedUrls.size;
}
