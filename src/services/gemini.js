import { GoogleGenerativeAI } from '@google/generative-ai';

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
