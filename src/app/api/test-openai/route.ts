// 简单的API测试端点
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_key_here') {
    return NextResponse.json({
      status: 'error',
      message: 'OPENAI_API_KEY 未配置或使用占位符',
      instructions: [
        '1. 访问 https://platform.openai.com/api-keys',
        '2. 登录并创建新的 API Key',
        '3. 复制 API Key（格式：sk-...）',
        '4. 在 .env.local 文件中更新：OPENAI_API_KEY=sk-your-actual-key',
        '5. 重启开发服务器 (npm run dev)',
      ],
    });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: 'Say "Hello" in one word.',
        },
      ],
      max_tokens: 10,
    });

    const response = completion.choices[0]?.message?.content;

    return NextResponse.json({
      status: 'success',
      message: 'OpenAI API 连接成功！',
      testResponse: response,
      apiKeyPreview: `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'OpenAI API 连接失败',
      error: error.message,
      statusCode: error.status,
      suggestions: getErrorSuggestions(error.status),
    });
  }
}

function getErrorSuggestions(status?: number): string[] {
  if (status === 401) {
    return [
      'API Key 无效或已过期',
      '请检查 API Key 是否正确',
      '确认账户是否有足够的余额',
      '访问 https://platform.openai.com/api-keys 重新创建 API Key',
    ];
  } else if (status === 429) {
    return ['API 请求频率超限，请稍后再试'];
  } else if (status === 500) {
    return ['OpenAI 服务器错误，请稍后再试'];
  }
  return ['请检查网络连接', '确认 API Key 是否正确'];
}

