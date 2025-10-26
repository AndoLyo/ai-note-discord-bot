import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * コンテンツがAI・画像生成・プロンプト関連の記事かどうかを判定
 */
export async function isRelevantContent(content) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
以下の記事が、AI・画像生成AI・プロンプト・テクノロジー関連の記事かどうかを判定してください。

【判定基準】
- AI、画像生成AI（Stable Diffusion、Midjourney、DALL-E、Kandinsky など）、プロンプト、テクノロジーに関連する内容である
- 単にハッシュタグが付いているだけではなく、実際の記事内容が関連している
- 投資・副業・お金稼ぎ・宣伝・販売目的の記事は除外
- セミナー・講座・教材の営業記事は除外
- プログラミング・開発・技術解説の記事は対象

【記事情報】
タイトル: ${content.title}
説明: ${content.description}

以下の形式で回答してください：
"YES" または "NO"

理由:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text().trim();

    const isRelevant = answer.includes('YES') || answer.toLowerCase().includes('yes');
    
    if (isRelevant) {
      console.log(`[Gemini] 関連記事として判定: ${content.title.substring(0, 50)}...`);
    } else {
      console.log(`[Gemini] 関連外として除外: ${content.title.substring(0, 50)}...`);
    }

    return isRelevant;

  } catch (error) {
    console.error('[Gemini] 関連性判定エラー:', error.message);
    // エラー時は安全のためfalseを返す
    return false;
  }
}

/**
 * Gemini 2.5 Flashを使用してコンテンツを要約
 */
export async function summarizeContent(content) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // カスタムプロンプト - 観覧したくなる魅力的な要約を生成
    const prompt = `
以下のコンテンツを魅力的に要約してください。

【要約のルール】
1. 読者が「これは見たい！」と思う内容にする
2. 具体的で分かりやすい表現を使う
3. 3〜5文で簡潔にまとめる
4. 画像生成AIやテクノロジーの面白さを強調する
5. 専門用語は適度に説明を加える
6. 日本語で出力する

【コンテンツ情報】
タイトル: ${content.title}
説明: ${content.description}
ソース: ${content.source}
人気度: ${content.score}

魅力的な要約を生成してください:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    console.log(`[Gemini] 要約生成完了: ${content.title.substring(0, 50)}...`);
    return summary.trim();

  } catch (error) {
    console.error('[Gemini] 要約エラー:', error.message);
    // エラー時はデフォルトの説明を返す
    return `${content.source}から: ${content.title}\n\n${content.description.substring(0, 200)}...`;
  }
}
