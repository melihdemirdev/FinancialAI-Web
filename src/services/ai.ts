import { AI_CONFIG, CFO_ANALYSIS_PROMPT, CFO_CHAT_PROMPT } from '@/config/ai';
import type { CFOReportData, FinancialData } from '@/types';

const STORAGE_KEY = 'gemini_api_key';

export function saveApiKey(apiKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, apiKey);
  }
}

export function getApiKey(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY);
  }
  return null;
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

export function clearApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

export async function generateCFOReport(data: CFOReportData): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('API anahtarı bulunamadı. Lütfen ayarlardan API anahtarınızı girin.');
  }

  const prompt = `${CFO_ANALYSIS_PROMPT}

## Finansal Durum:
- **Net Değer:** ${data.netWorth.toLocaleString('tr-TR')} ${data.currency}
- **Toplam Varlık:** ${data.totalAssets.toLocaleString('tr-TR')} ${data.currency}
- **Toplam Borç:** ${data.totalLiabilities.toLocaleString('tr-TR')} ${data.currency}
- **Likit Varlık:** ${data.liquidAssets.toLocaleString('tr-TR')} ${data.currency}
- **Aylık Gelir:** ${data.monthlyIncome.toLocaleString('tr-TR')} ${data.currency}
- **Aylık Taksit:** ${data.monthlyInstallments.toLocaleString('tr-TR')} ${data.currency}
- **Finansal Sağlık Skoru:** ${data.healthScore}/100
${data.findeksScore ? `- **Findeks Skoru:** ${data.findeksScore}` : ''}

## Varlık Dağılımı:
${Object.entries(data.assetsByType)
  .map(([type, amount]) => `- ${type}: ${amount.toLocaleString('tr-TR')} ${data.currency}`)
  .join('\n')}

## Borç Durumu:
${Object.entries(data.liabilitiesByType)
  .map(([type, amount]) => `- ${type}: ${amount.toLocaleString('tr-TR')} ${data.currency}`)
  .join('\n')}

Yukarıdaki finansal verilere göre bir CFO analizi yap.`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: AI_CONFIG.gemini.temperature,
      maxOutputTokens: AI_CONFIG.gemini.maxTokens,
    },
  };

  let lastError: Error | null = null;
  const modelsToTry = [AI_CONFIG.gemini.model, ...AI_CONFIG.gemini.fallbackModels];

  for (const model of modelsToTry) {
    try {
      const url = `${AI_CONFIG.gemini.endpoint}/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `API isteği başarısız oldu: ${response.status}`
        );
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('API yanıt vermedi');
      }

      const text = data.candidates[0].content.parts[0].text;
      return text;
    } catch (error) {
      lastError = error as Error;
      console.error(`${model} modeli ile hata:`, error);
      // Try next model
      continue;
    }
  }

  throw lastError || new Error('Rapor oluşturulamadı');
}

export async function generateCFOConversation(
  message: string,
  data: FinancialData,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('API anahtarı bulunamadı. Lütfen ayarlardan API anahtarınızı girin.');
  }

  const systemPrompt = {
    role: 'user',
    parts: [
      {
        text: `${CFO_CHAT_PROMPT}
${JSON.stringify(data, null, 2)}`,
      },
    ],
  };

  const userMessage = {
    role: 'user',
    parts: [
      {
        text: message,
      },
    ],
  };

  const contents = [
    systemPrompt,
    { role: 'model', parts: [{ text: 'Anladım. Sorularınızı bekliyorum.' }] },
    ...history,
    userMessage,
  ];

  const requestBody = {
    contents: contents,
    generationConfig: {
      temperature: AI_CONFIG.gemini.temperature,
      maxOutputTokens: AI_CONFIG.gemini.maxTokens,
    },
  };

  const url = `${AI_CONFIG.gemini.endpoint}/models/${AI_CONFIG.gemini.model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API isteği başarısız oldu: ${response.status}`
      );
    }

    const responseData: GeminiResponse = await response.json();

    if (responseData.error) {
      throw new Error(responseData.error.message);
    }

    if (!responseData.candidates || responseData.candidates.length === 0) {
      throw new Error('API yanıt vermedi');
    }

    return responseData.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Sohbet yanıtı oluşturulurken hata:', error);
    throw error;
  }
}
