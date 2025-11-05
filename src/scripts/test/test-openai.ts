import OpenAI from 'openai';

/**
 * Test OpenAI API connection
 */
async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY 未配置');
    console.log('\n请按照以下步骤配置：');
    console.log('1. 访问 https://platform.openai.com/api-keys');
    console.log('2. 创建新的 API Key');
    console.log('3. 在 .env.local 文件中添加：OPENAI_API_KEY=sk-your-key-here');
    return false;
  }

  if (apiKey === 'sk-your-key-here' || apiKey.startsWith('sk-') === false) {
    console.error('❌ OPENAI_API_KEY 格式不正确');
    return false;
  }

  console.log('🔍 正在测试 OpenAI API...');
  console.log(`API Key: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`);

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

    if (response) {
      console.log('✅ OpenAI API 连接成功！');
      console.log(`测试回复: ${response}`);
      return true;
    } else {
      console.error('❌ OpenAI API 返回空回复');
      return false;
    }
  } catch (error: any) {
    console.error('❌ OpenAI API 连接失败:');
    console.error(`错误信息: ${error.message}`);
    
    if (error.status === 401) {
      console.error('\n💡 这通常是API Key无效或已过期。请检查：');
      console.error('1. API Key是否正确');
      console.error('2. API Key是否已启用');
      console.error('3. 账户是否有足够的余额');
    } else if (error.status === 429) {
      console.error('\n💡 API请求频率超限。请稍后再试。');
    } else if (error.status === 500) {
      console.error('\n💡 OpenAI服务器错误。请稍后再试。');
    }

    return false;
  }
}

// Run test
testOpenAI().then((success) => {
  process.exit(success ? 0 : 1);
});

