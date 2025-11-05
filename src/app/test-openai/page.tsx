'use client';

import { useState } from 'react';

export default function TestOpenAIPage() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);

  const testAPI = async () => {
    setStatus('testing');
    setResult(null);

    try {
      const response = await fetch('/api/test-openai');
      const data = await response.json();
      
      if (data.status === 'success') {
        setStatus('success');
        setResult(data);
      } else {
        setStatus('error');
        setResult(data);
      }
    } catch (error: any) {
      setStatus('error');
      setResult({ message: '测试失败', error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            OpenAI API 测试
          </h1>
          <p className="text-gray-600 mb-6">
            验证您的 OpenAI API Key 是否配置正确
          </p>

          <button
            onClick={testAPI}
            disabled={status === 'testing'}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl mb-6"
          >
            {status === 'testing' ? '测试中...' : '开始测试'}
          </button>

          {status === 'success' && result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    ✅ API 连接成功！
                  </h3>
                  <p className="text-sm text-green-700">
                    API Key: {result.apiKeyPreview}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>测试回复:</strong>
                </p>
                <p className="text-lg font-medium text-gray-900">
                  {result.testResponse}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && result && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    ❌ API 连接失败
                  </h3>
                  <p className="text-sm text-red-700 mb-4">{result.message}</p>
                  
                  {result.error && (
                    <div className="bg-white rounded-lg p-4 border border-red-200 mb-4">
                      <p className="text-xs font-mono text-red-800">
                        {result.error}
                      </p>
                    </div>
                  )}

                  {result.instructions && (
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        配置步骤：
                      </p>
                      <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                        {result.instructions.map((step: string, index: number) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {result.suggestions && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <p className="text-sm font-semibold text-yellow-900 mb-2">
                        建议：
                      </p>
                      <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                        {result.suggestions.map((suggestion: string, index: number) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📝 如何获取 OpenAI API Key
            </h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
              <li>
                访问{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  https://platform.openai.com/api-keys
                </a>
              </li>
              <li>登录您的 OpenAI 账户（如果没有账户需要先注册）</li>
              <li>点击 &quot;Create new secret key&quot; 按钮</li>
              <li>复制生成的 API Key（格式：sk-...）</li>
              <li>
                在项目根目录的 <code className="bg-gray-200 px-1 rounded">.env.local</code>{' '}
                文件中添加：
                <code className="block mt-2 bg-gray-200 px-2 py-1 rounded font-mono text-xs">
                  OPENAI_API_KEY=sk-your-actual-key-here
                </code>
              </li>
              <li>重启开发服务器 (Ctrl+C 然后 npm run dev)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

