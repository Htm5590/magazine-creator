/**
 * AI Service for Tahwas Presse Studio
 * Supports Google Gemini Free API & Groq Cloud API
 * Allows users to easily enter and manage their own API keys
 */

export type AIProvider = 'gemini' | 'groq';

export interface AIConfig {
  provider: AIProvider;
  geminiKey: string;
  groqKey: string;
}

const STORAGE_KEY = 'tahwas_ai_config_v1';

export const getAIConfig = (): AIConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        provider: parsed.provider === 'groq' ? 'groq' : 'gemini',
        geminiKey: parsed.geminiKey || '',
        groqKey: parsed.groqKey || '',
      };
    }
  } catch (e) {
    console.error('Failed to read AI config from localStorage', e);
  }
  return {
    provider: 'gemini',
    geminiKey: '',
    groqKey: '',
  };
};

export const saveAIConfig = (config: AIConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save AI config to localStorage', e);
  }
};

export const getActiveKey = (config: AIConfig): string => {
  return config.provider === 'groq' ? config.groqKey : config.geminiKey;
};

/**
 * Universal call to either Gemini or Groq
 */
export async function callAI(
  prompt: string,
  systemInstruction?: string,
  config?: AIConfig
): Promise<string> {
  const currentConfig = config || getAIConfig();
  const activeKey = getActiveKey(currentConfig).trim();

  if (!activeKey) {
    throw new Error(
      `لم تقم بإدخال مفتاح API لمزود ${
        currentConfig.provider === 'groq' ? 'Groq' : 'Google Gemini'
      }. يرجى إضافة مفتاحك في إعدادات الذكاء الاصطناعي أولاً.`
    );
  }

  if (currentConfig.provider === 'groq') {
    return callGroqAPI(prompt, activeKey, systemInstruction);
  } else {
    return callGeminiAPI(prompt, activeKey, systemInstruction);
  }
}

/**
 * Call Google Gemini Free API directly via v1beta endpoint
 */
async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  systemInstruction?: string
): Promise<string> {
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents: any[] = [];
  if (systemInstruction) {
    contents.push({
      role: 'user',
      parts: [{ text: `تعليمات المحرر الرئيسية: ${systemInstruction}` }],
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'مفهوم، أنا جاهز للالتزام بهذه التعليمات الصحفية الدقيقة.' }],
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2500,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `فشل الاتصال بـ Gemini (${response.status})`;
    try {
      const errJson = JSON.parse(errorBody);
      if (errJson.error?.message) {
        message = `خطأ Gemini: ${errJson.error.message}`;
      }
    } catch (_) {}
    throw new Error(message);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('لم يتم استلام أي رد من Gemini');
  }

  return text;
}

/**
 * Call Groq Cloud API (Llama 3.3 70B / 8B)
 */
async function callGroqAPI(
  prompt: string,
  apiKey: string,
  systemInstruction?: string
): Promise<string> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const model = 'llama-3.3-70b-versatile';

  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({
      role: 'system',
      content: systemInstruction,
    });
  } else {
    messages.push({
      role: 'system',
      content: 'أنت محرر صحفي خبير في مجلة تحواس براس السياحية الجزائرية.',
    });
  }

  messages.push({
    role: 'user',
    content: prompt,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `فشل الاتصال بـ Groq (${response.status})`;
    try {
      const errJson = JSON.parse(errorBody);
      if (errJson.error?.message) {
        message = `خطأ Groq: ${errJson.error.message}`;
      }
    } catch (_) {}
    throw new Error(message);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('لم يتم استلام أي رد من Groq');
  }

  return content;
}

/**
 * Test AI Connection
 */
export async function testConnection(provider: AIProvider, key: string): Promise<boolean> {
  if (!key.trim()) return false;
  const testConfig: AIConfig = {
    provider,
    geminiKey: provider === 'gemini' ? key : '',
    groqKey: provider === 'groq' ? key : '',
  };

  const reply = await callAI(
    'أجب فقط بالكلمة التالية للتأكد من الاتصال: "جاهز"',
    'اختبار اتصال برمجي سريع',
    testConfig
  );
  return reply.length > 0;
}

/**
 * Structured Generation for a Complete Magazine Article
 */
export interface GeneratedArticleData {
  category: string;
  kicker: string;
  title: string;
  subtitle: string;
  byline: string;
  body: string;
  pullQuote: string;
  facts: {
    destination: string;
    region: string;
    bestTime: string;
    duration: string;
    budget: 'budget' | 'medium' | 'luxury';
    howToReach: string;
    climateTip: string;
    currency: string;
    languages: string;
  };
}

export async function generateFullArticleWithAI(params: {
  topic: string;
  category: string;
  destination?: string;
  customNotes?: string;
}): Promise<GeneratedArticleData> {
  const systemInstruction = `أنت رئيس قسم التحرير في مجلة "تحواس براس - TAHWAS PRESSE" الجزائرية العريقة.
مهمتك كتابة مقالات وتحقيقات صحفية سياحية عالية الجودة تتسم بالأسلوب الأدبي والتوثيقي الراقي، مع إبراز سحر المعالم والتراث الجزائري وشعار "حوس بلادك !".
يجب أن ترجع النتيجة بصيغة JSON نظيفة فقط دون أي نصوص إضافية أو كود markdown خارج كتلة JSON.`;

  const prompt = `المطلوب كتابة مقال صحفي متكامل لمجلة تحواس براس بالمعطيات التالية:
- موضوع أو عنوان الفكرة: "${params.topic}"
- التصنيف المعتمد: "${params.category}"
${params.destination ? `- الوجهة السياحية: "${params.destination}"` : ''}
${params.customNotes ? `- ملاحظات إضافية: "${params.customNotes}"` : ''}

قم بإنشاء المقال وتنسيقه ككائن JSON بالبنية التالية تماماً:
{
  "category": "${params.category}",
  "kicker": "عبارة ترويسية قصيرة جذابة تعكس التصنيف (مثال: سياحة داخلية • استكشاف)",
  "title": "عنوان المقال الرئيسي بصياغة صحفية شيقة وقوية",
  "subtitle": "عنوان فرعي يمهد للمقال ويكشف زاوية التناول",
  "byline": "بقلم: صحفي تحواس براس",
  "body": "نص المقال الصحفي الكامل (من 3 إلى 5 فقرات ثرية بالمعلومات التوثيقية والوصف البصري والروائح والمشاعر والتاريخ المحلي)",
  "pullQuote": "اقتباس بليغ ومؤثر جداً من نص المقال يصلح للعرض بخط عريض",
  "facts": {
    "destination": "اسم الوجهة والمنطقة",
    "region": "الولاية أو الإقليم الجزائري",
    "bestTime": "أفضل وقت للزيارة فصلياً",
    "duration": "المدة المقترحة للرحلة (مثال: 3 إلى 5 أيام)",
    "budget": "medium",
    "howToReach": "طريقة الوصول والتنقل",
    "climateTip": "نصيحة مناخية ومعدات ضرورية",
    "currency": "الدينار الجزائري (DZD)",
    "languages": "العربية، الأمازيغية، الفرنسية"
  }
}
أجب فقط بـ JSON صالح ومكتمل.`;

  const raw = await callAI(prompt, systemInstruction);

  // Extract JSON from response (clean markdown fences if present)
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      category: parsed.category || params.category || 'سياحة داخلية',
      kicker: parsed.kicker || params.category || 'تحقيق سياحي',
      title: parsed.title || params.topic,
      subtitle: parsed.subtitle || '',
      byline: parsed.byline || 'بقلم: صحفي تحواس براس',
      body: parsed.body || '',
      pullQuote: parsed.pullQuote || '',
      facts: {
        destination: parsed.facts?.destination || params.destination || 'الوجهة السياحية',
        region: parsed.facts?.region || 'الجزائر',
        bestTime: parsed.facts?.bestTime || 'الربيع والخريف',
        duration: parsed.facts?.duration || '3 إلى 4 أيام',
        budget: parsed.facts?.budget || 'medium',
        howToReach: parsed.facts?.howToReach || 'رحلات جوية وسيارات دفع رباعي',
        climateTip: parsed.facts?.climateTip || 'احرص على ملابس مريحة مناسبة للطقس',
        currency: 'الدينار الجزائري (DZD)',
        languages: 'العربية، الأمازيغية، الفرنسية',
      },
    };
  } catch (err) {
    console.error('Failed to parse JSON from AI response:', raw);
    throw new Error('حدث خطأ أثناء قراءة بيانات المقال المولدة من الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.');
  }
}

/**
 * Polish & Improve existing article text
 */
export async function polishArticleWithAI(params: {
  title: string;
  body: string;
  category?: string;
}): Promise<{ title: string; body: string; pullQuote: string }> {
  const prompt = `أنت مدقق لغوي ومحرر أول في مجلة تحواس براس السياحية الجزائرية.
المطلوب مراجعة وتحسين وتدقيق نص المقال التالي لجعله أكثر ألقاً ورونقاً صحفياً مع الحفاظ الصارم على فكرة الكاتب وحقائقه وتنسيق الفقرات.
العنوان الحالي: "${params.title}"
التصنيف: "${params.category || 'سياحة داخلية'}"
نص المقال:
"""
${params.body}
"""

أعد النتيجة فقط كـ JSON على الشكل التالي:
{
  "title": "العنوان المحسن (إن لزم)",
  "body": "النص المحسن والمنسق بفقرات متماسكة وأسلوب صحفي سياحي جذاب",
  "pullQuote": "أفضل اقتباس ملهم ومختصر من النص"
}`;

  const raw = await callAI(prompt);
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      title: parsed.title || params.title,
      body: parsed.body || params.body,
      pullQuote: parsed.pullQuote || '',
    };
  } catch (err) {
    return {
      title: params.title,
      body: raw.trim(),
      pullQuote: '',
    };
  }
}
