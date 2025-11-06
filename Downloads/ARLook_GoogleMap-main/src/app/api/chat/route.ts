/**
 * ============================================================================
 * 主聊天 API - 整合所有组件
 * ============================================================================
 * 
 * 位置: src/app/api/chat/route.ts
 * 
 * 职责:
 * - 整合 RAG 系统、LLM Pipeline 和本地数据库
 * - 处理用户聊天消息
 * - 执行完整的 RAG 流程：检索 → 生成 → 验证
 * - 返回 AI 回复和匹配的房源
 * 
 * 完整流程:
 * 1. 接收用户消息和对话历史
 * 2. 初始化推理引擎和上下文助手
 * 3. 澄清用户需求（如果需要）
 * 4. 选择搜索策略
 * 5. RAG 检索相关房源
 * 6. 准备系统提示词（包含检索到的房源）
 * 7. 调用 OpenAI API 生成回复
 * 8. 解析 AI 回复
 * 9. 验证回复中的数据
 * 10. 返回结果给前端
 * 
 * 使用的组件:
 * - RentalReasoningEngine (reasoning.ts): 推理引擎
 * - HybridRetriever (retrieval.ts): 混合检索器
 * - verifyAndFilterProperties (verification.ts): 验证系统
 * - getAllProperties (csv-loader.ts): 数据加载器
 * - formatPropertiesForPrompt (openai.ts): OpenAI 服务
 * - ContextAwareAssistant (context-aware.ts): 上下文感知
 * 
 * API 端点: POST /api/chat
 * 
 * 请求格式:
 * {
 *   "message": "用户消息",
 *   "conversationHistory": [对话历史]
 * }
 * 
 * 响应格式:
 * {
 *   "response": "AI 回复",
 *   "properties": [房源列表],
 *   "filters": {过滤条件},
 *   "rag_metrics": {性能指标}
 * }
 * 
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Property, Message } from '@/shared/types';
import {
  formatPropertiesForPrompt,
  parseAIResponse,
  filterPropertiesByFilters,
} from '@/server/services/openai';
import { HybridRetriever } from '@/server/services/rag/retrieval';
import { getAllProperties } from '@/server/utils/csv-loader';
import { verifyAndFilterProperties, RAGMetrics } from '@/server/services/rag/verification';
import { RentalReasoningEngine, SearchContext } from '@/server/services/rag/reasoning';
import { ContextAwareAssistant } from '@/server/utils/context-aware';
import { filterPropertiesByMessage } from '@/shared/constants/properties';

/**
 * Get OpenAI API key from environment variables
 */
function getOpenAIApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured in environment variables');
  }
  return apiKey;
}

/**
 * Create system prompt for OpenAI with intent detection and next-step suggestions
 */
function createSystemPrompt(properties: Property[], conversationHistory: Message[] = []): string {
  const propertiesText = formatPropertiesForPrompt(properties);
  
  // Analyze conversation context
  const hasPreviousMessages = conversationHistory.length > 0;
  const userMessages = conversationHistory.filter(m => m.role === 'user');
  const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
  
  // Detect conversation stage
  let conversationStage = 'initial';
  let detectedIntent = '';
  let suggestedNextSteps = '';
  
  if (!hasPreviousMessages) {
    conversationStage = 'initial';
    detectedIntent = 'User is starting their search';
    suggestedNextSteps = 'Introduce yourself briefly, ask about their key priorities (budget, location, amenities), or show them some popular options';
  } else if (lastUserMessage.toLowerCase().includes('wharton') || lastUserMessage.toLowerCase().includes('school')) {
    conversationStage = 'location_focused';
    detectedIntent = 'User is prioritizing location/proximity to Wharton';
    suggestedNextSteps = 'Ask about walking distance preference, budget range, and must-have amenities';
  } else if (lastUserMessage.toLowerCase().includes('price') || lastUserMessage.toLowerCase().includes('budget') || lastUserMessage.toLowerCase().includes('$')) {
    conversationStage = 'budget_focused';
    detectedIntent = 'User is prioritizing budget';
    suggestedNextSteps = 'Ask about location flexibility, preferred amenities, and room type (studio/1b1b)';
  } else if (lastUserMessage.toLowerCase().includes('laundry') || lastUserMessage.toLowerCase().includes('gym') || lastUserMessage.toLowerCase().includes('amenit')) {
    conversationStage = 'amenity_focused';
    detectedIntent = 'User is prioritizing specific amenities';
    suggestedNextSteps = 'Ask about budget range, location preference, and if there are other amenities they need';
  } else if (lastUserMessage.toLowerCase().includes('more') || lastUserMessage.toLowerCase().includes('other') || lastUserMessage.toLowerCase().includes('show')) {
    conversationStage = 'exploring';
    detectedIntent = 'User wants to see more options or explore further';
    suggestedNextSteps = 'Offer alternative properties, suggest refining filters, or ask what specific aspect they want to explore';
  } else if (lastUserMessage.toLowerCase().includes('compare') || lastUserMessage.toLowerCase().includes('difference')) {
    conversationStage = 'comparing';
    detectedIntent = 'User wants to compare properties';
    suggestedNextSteps = 'Highlight key differences in price, location, amenities, or other factors';
  } else {
    conversationStage = 'refining';
    detectedIntent = 'User is refining their search';
    suggestedNextSteps = 'Acknowledge their refinement, provide updated results, and ask if they need any clarification';
  }

  return `You are ARLook, a professional rental consultant assistant specializing in University City, Philadelphia. Your core mission is to understand users' rental needs, intelligently match them with properties from the database, and guide them through their search journey with proactive suggestions.

### Property Database
${propertiesText}

### Conversation Context
Current Stage: ${conversationStage}
Detected Intent: ${detectedIntent}
Suggested Next Steps: ${suggestedNextSteps}
${hasPreviousMessages ? `Previous messages: ${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content.substring(0, 50)}...`).join(' | ')}` : 'This is the first message'}

### Your Core Capabilities
1. **Intent Detection**: Understand what the user is really looking for (budget, location, amenities, room type, lifestyle preferences)
2. **Intelligent Matching**: Filter and rank properties from the database based on user needs
3. **Proactive Guidance**: Anticipate user's next steps and provide helpful suggestions
4. **Conversation Flow**: Guide users through a natural conversation journey from initial search to final decision

### Response Structure (present naturally, no format markers)
Your response MUST be complete and include ALL of the following:

1. **Acknowledgment**: Briefly acknowledge what the user said or what you found
   Example: "Based on your search for properties near Wharton, I found 3 excellent options..."

2. **Property Recommendations** (CRITICAL - MUST list ALL properties you mention):
   If you say "I found X properties" or "X excellent options", you MUST list ALL X properties.
   For EACH property, you MUST include ALL of the following details COMPLETELY:
   - Property name (full name)
   - Complete address (full street address, city, state)
   - Price per person and room type (e.g., $1850 per person, 1b1b)
   - Walking distance to Wharton School (if available, e.g., "8 minutes walk")
   - Key amenities (at least 3-4 amenities, comma-separated)
   - Brief highlight (1 sentence describing unique feature)
   
   CRITICAL RULES:
   - If you mention "3 options", list ALL 3 properties completely
   - Do NOT stop mid-property-description
   - Do NOT list only 1 property if you said there are multiple
   - Each property should have: name, address, price, walking distance, amenities, highlight
   - Complete ALL property details before moving to next steps

3. **Next Step Suggestions** (CRITICAL - MUST include):
   After presenting ALL properties, ALWAYS suggest 2-3 natural next steps based on:
   - What the user might want to know next
   - Common questions users ask at this stage
   - Ways to refine or expand their search
   
   Examples:
   - "Would you like to see more options in a different price range?"
   - "I can help you compare these properties side by side if you'd like."
   - "If you're interested in any of these, I can provide more details about the neighborhood or nearby amenities."
   
   DO NOT end your response abruptly. Always include next-step suggestions.

4. **Data Tag**: At the very end, on a separate line, add JSON filter format (DO NOT mention this in your response):
[DATA]{"filters": {"maxPrice": 2000, "amenities": ["In-unit laundry", "Gym"], "maxWalkingDistance": 10}}

### Response Length Requirements
- Your response should be comprehensive and detailed
- Minimum length: At least 400-500 words for 3 properties
- Include complete information for each property mentioned
- Always end with helpful next-step suggestions
- Do NOT truncate mid-sentence or mid-property-description
- If you say "X properties", list ALL X properties completely

### Response Validation Checklist
Before ending your response, verify:
- [ ] Did I mention a number of properties? (e.g., "3 options")
- [ ] Did I list ALL of them completely?
- [ ] Each property has: name, address, price, walking distance, amenities, highlight?
- [ ] Did I include next-step suggestions?
- [ ] Is my response complete and helpful?

### Response Guidelines
- Use natural, conversational English (or Chinese if user uses Chinese)
- Do NOT use markdown formatting (no **, ###, -, etc.)
- Do NOT use emoji
- Be accurate, concise, and helpful
- Be professional, friendly, and eager to help
- If user needs are unclear, politely ask about key information (budget, room type, must-have amenities)
- Always end with helpful next-step suggestions or questions

### Critical Rules - Prevent Hallucinations
- **Strict Constraint**: You can ONLY reference properties listed in the database above. NEVER invent or fabricate property information.
- **Data Accuracy**: All prices, addresses, amenities mentioned must match the database exactly.
- **If no matching properties**: Honestly tell the user, don't make up properties.
- **Verification**: The system automatically verifies every property you mention exists in the database.
- Must include [DATA] JSON object at the end for frontend map filtering
- Filters in JSON should contain specific filter conditions
- If user didn't specify certain conditions, infer reasonably from context
- Always respond in the same language as the user (English or Chinese)

### Intent Detection & Next Steps
Based on the conversation stage and detected intent, proactively suggest:
- **Initial Stage**: Ask about priorities, show popular options, explain your capabilities
- **Location-Focused**: Ask about walking distance tolerance, budget flexibility, amenities needed
- **Budget-Focused**: Ask about location flexibility, room type preference, must-have amenities
- **Amenity-Focused**: Ask about budget range, location preference, other amenities
- **Exploring**: Offer alternatives, suggest filter refinements, ask what to explore next
- **Comparing**: Highlight differences, offer more comparison details, suggest visiting properties
- **Refining**: Acknowledge refinement, provide updated results, ask for clarification`;
}

/**
 * POST /api/chat
 * Handle chat messages using OpenAI GPT-3.5-turbo
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body: any;
    try {
      body = await request.json();
    } catch (error: any) {
      console.error('❌ Invalid JSON in request body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON format in request body' },
        { status: 400 }
      );
    }
    
    const { message, conversationHistory } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate and sanitize message input
    const trimmedMessage = message.trim();
    
    // Validate message length (prevent extremely long inputs)
    if (trimmedMessage.length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }
    
    if (trimmedMessage.length > 5000) {
      return NextResponse.json(
        { error: 'Message is too long. Please keep it under 5000 characters.' },
        { status: 400 }
      );
    }

    // Validate conversationHistory format if provided
    if (conversationHistory !== undefined && conversationHistory !== null) {
      if (!Array.isArray(conversationHistory)) {
        return NextResponse.json(
          { error: 'conversationHistory must be an array' },
          { status: 400 }
        );
      }
      
      // Validate each message in history
      for (let i = 0; i < conversationHistory.length; i++) {
        const msg = conversationHistory[i];
        if (!msg || typeof msg !== 'object') {
          return NextResponse.json(
            { error: `Invalid message format at index ${i}` },
            { status: 400 }
          );
        }
        if (!msg.role || (msg.role !== 'user' && msg.role !== 'assistant')) {
          return NextResponse.json(
            { error: `Invalid message role at index ${i}. Must be 'user' or 'assistant'` },
            { status: 400 }
          );
        }
        if (!msg.content || typeof msg.content !== 'string') {
          return NextResponse.json(
            { error: `Invalid message content at index ${i}` },
            { status: 400 }
          );
        }
      }
    }

    // Check if OpenAI API key is configured
    let openai: OpenAI | undefined;
    try {
      const apiKey = getOpenAIApiKey();
      openai = new OpenAI({ apiKey });
    } catch (error: any) {
      console.error('OpenAI API key not configured:', error.message);
      // Fallback to local filtering if OpenAI is not configured
      return fallbackToLocalFiltering(message);
    }

    // Step 1: Initialize reasoning engine and context-aware assistant
    let reasoningEngine: RentalReasoningEngine;
    let contextAssistant: ContextAwareAssistant;
    
    try {
      reasoningEngine = new RentalReasoningEngine(openai);
      contextAssistant = new ContextAwareAssistant();
    } catch (error: any) {
      console.error('❌ Failed to initialize reasoning engine:', error);
      return fallbackToLocalFiltering(trimmedMessage);
    }
    
    // Step 2: Clarify user needs (if needed)
    let clarificationResult;
    try {
      clarificationResult = await reasoningEngine.clarifyNeeds(
        trimmedMessage,
        conversationHistory || []
      );
    } catch (error: any) {
      console.error('❌ Error in clarification step:', error);
      // Continue with original message if clarification fails
      clarificationResult = {
        needsClarification: false,
        clarifiedQuery: trimmedMessage,
        missingInfo: [],
      };
    }
    
    // If clarification is needed, return clarification questions
    if (clarificationResult.needsClarification && clarificationResult.clarificationQuestions) {
      return NextResponse.json({
        response: `To help you find the best match, I need a bit more information:\n\n${clarificationResult.clarificationQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nPlease provide these details so I can tailor my recommendations.`,
        properties: [],
        count: 0,
        needsClarification: true,
      });
    }
    
    // Use clarified query
    const clarifiedQuery = clarificationResult?.clarifiedQuery || trimmedMessage;
    
    // Step 3: Select search strategy
    let searchStrategy: 'keyword' | 'semantic' | 'hybrid';
    try {
      searchStrategy = await reasoningEngine.selectSearchStrategy(clarifiedQuery);
    } catch (error: any) {
      console.error('❌ Error selecting search strategy:', error);
      searchStrategy = 'hybrid'; // Default fallback
    }
    
    // Step 4: Use HybridRetriever to perform RAG retrieval
    let retriever: HybridRetriever;
    let allProperties: Property[];
    let retrievalResult;
    
    try {
      retriever = new HybridRetriever();
      allProperties = getAllProperties();
      
      // Ensure we have properties
      if (!allProperties || allProperties.length === 0) {
        console.warn('⚠️ No properties loaded from database');
        allProperties = []; // Empty array as fallback
      }
      
      retrievalResult = await retriever.retrieve(clarifiedQuery, allProperties, openai);
    } catch (error: any) {
      console.error('❌ Error in RAG retrieval:', error);
      // Return fallback response
      return fallbackToLocalFiltering(trimmedMessage);
    }
    
    console.log('RAG Retrieval Result:', {
      strategy: retrievalResult.strategy,
      confidence: retrievalResult.confidence,
      propertyCount: retrievalResult.properties.length,
      searchStrategy,
    });

    // Step 5: Prepare conversation messages with retrieved properties
    // Use retrieved properties instead of all properties for better context
    const retrievedProperties = (retrievalResult?.properties && retrievalResult.properties.length > 0)
      ? retrievalResult.properties 
      : (allProperties.length > 0 ? allProperties : []); // Fallback to all if retrieval returns empty
    
    // Ensure we have at least some properties
    if (retrievedProperties.length === 0) {
      console.warn('⚠️ No properties retrieved, using fallback');
      return fallbackToLocalFiltering(trimmedMessage);
    }
    
    let systemPrompt: string;
    try {
      systemPrompt = createSystemPrompt(retrievedProperties, conversationHistory || []);
    } catch (error: any) {
      console.error('❌ Error creating system prompt:', error);
      return fallbackToLocalFiltering(trimmedMessage);
    }
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Add conversation history (last 10 messages to avoid token limit)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        // Validate message format before adding
        if (msg && msg.role && msg.content && typeof msg.content === 'string') {
          try {
            messages.push({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: String(msg.content).substring(0, 2000), // Limit individual message length
            });
          } catch (error: any) {
            console.warn('⚠️ Skipping invalid message in history:', error);
          }
        }
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: trimmedMessage,
    });

    // Call OpenAI API with retry logic for incomplete responses
    let aiResponse: string = '';
    let finishReason: string | undefined;
    let tokensUsed: number | undefined;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.7,
          max_tokens: 4000, // Increased to 4000 to ensure complete responses
          stop: undefined, // Don't stop prematurely
        });

        const responseContent = completion.choices[0]?.message?.content || '';
        finishReason = completion.choices[0]?.finish_reason;
        tokensUsed = completion.usage?.total_tokens;
        
        if (!responseContent) {
          throw new Error('Empty response from OpenAI');
        }
        
        // Accumulate response if continuing
        if (aiResponse) {
          aiResponse += ' ' + responseContent; // Continue from where we left off
        } else {
          aiResponse = responseContent;
        }
        
        // Check if response was truncated
        if (finishReason === 'length') {
          console.warn(`⚠️ Response was truncated (attempt ${retryCount + 1}/${maxRetries + 1})!`, {
            responseLength: aiResponse.length,
            tokensUsed,
            completionTokens: completion.usage?.completion_tokens,
          });
          
          // If truncated and we haven't retried yet, continue the conversation
          if (retryCount < maxRetries) {
            retryCount++;
            // Add the incomplete response as assistant message and continue
            messages.push({
              role: 'assistant',
              content: aiResponse,
            });
            messages.push({
              role: 'user',
              content: 'CRITICAL: Your response was incomplete. You mentioned multiple properties but only listed some. Please continue and list ALL remaining properties with complete details (full address, price, walking distance, amenities, highlight). Then add next-step suggestions. Do NOT stop until ALL properties are listed completely.',
            });
            continue; // Retry with continuation
          }
        }
        
        // Check if response mentions properties but doesn't list them all
        const mentionedCountMatch = responseContent.match(/(\d+)\s*(?:excellent\s+)?(?:options?|properties?|matches?)/i);
        const mentionedCount = mentionedCountMatch ? parseInt(mentionedCountMatch[1]) : null;
        const propertyListPattern = /^\d+\.\s+/gm;
        const listedProperties = (responseContent.match(propertyListPattern) || []).length;
        
        // If response mentions multiple properties but doesn't list all, and we haven't retried
        if (mentionedCount !== null && listedProperties < mentionedCount && retryCount < maxRetries && finishReason !== 'length') {
          console.warn(`⚠️ Response mentions ${mentionedCount} properties but only lists ${listedProperties}!`, {
            mentionedCount,
            listedProperties,
            responseLength: aiResponse.length,
          });
          
          retryCount++;
          messages.push({
            role: 'assistant',
            content: aiResponse,
          });
          messages.push({
            role: 'user',
            content: `You mentioned ${mentionedCount} properties but only listed ${listedProperties}. Please continue and list ALL remaining properties (${mentionedCount - listedProperties} more) with complete details. Each property must include: name, full address, price per person, walking distance, amenities, and a highlight.`,
          });
          continue; // Retry to complete the list
        }
        
        console.log('📨 OpenAI Response:', {
          length: aiResponse.length,
          finishReason,
          tokensUsed,
          completionTokens: completion.usage?.completion_tokens,
          promptTokens: completion.usage?.prompt_tokens,
          preview: aiResponse.substring(0, 200),
        });
        
        break; // Success, exit retry loop
      } catch (error: any) {
        if (retryCount >= maxRetries) {
          console.error('OpenAI API error after retries:', error);
          // If we have partial response, use it; otherwise fallback
          if (!aiResponse) {
            return fallbackToLocalFiltering(message);
          }
          break; // Use partial response
        }
        retryCount++;
        console.warn(`⚠️ OpenAI API error, retrying (${retryCount}/${maxRetries + 1})...`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }
    
    // Ensure we have a response
    if (!aiResponse) {
      return fallbackToLocalFiltering(trimmedMessage);
    }

    // Parse and clean AI response
    let reply: string;
    let filters: any;
    
    try {
      const parsed = parseAIResponse(aiResponse);
      reply = parsed.reply || aiResponse; // Fallback to original if parsing fails
      filters = parsed.filters;
    } catch (error: any) {
      console.error('❌ Error parsing AI response:', error);
      // Use original response as fallback
      reply = aiResponse.replace(/\[DATA\][\s\S]*$/, '').trim() || 'I found some properties for you. Please check the map for details.';
      filters = undefined;
    }
    
    // Validate response completeness - check if all mentioned properties are listed
    const mentionedCountMatch = reply.match(/(\d+)\s*(?:excellent\s+)?(?:options?|properties?|matches?)/i);
    const mentionedCount = mentionedCountMatch ? parseInt(mentionedCountMatch[1]) : null;
    
    // Count how many properties are actually listed in the response
    const propertyListPattern = /^\d+\.\s+/gm;
    const listedProperties = (reply.match(propertyListPattern) || []).length;
    
    // Check if response mentions a number but doesn't list all properties
    if (mentionedCount !== null && listedProperties < mentionedCount) {
      console.warn('⚠️ Response mentions multiple properties but only lists some!', {
        mentionedCount,
        listedProperties,
        replyLength: reply.length,
        finishReason,
      });
      
      // If response was truncated and we haven't retried yet, continue
      if (finishReason === 'length' && retryCount < maxRetries) {
        // This should have been handled in the retry logic above
        // But if we're here, we'll log a warning
        console.warn('⚠️ Response incomplete - properties not fully listed');
      }
    }
    
    // Validate response completeness
    if (reply.length < 100) {
      console.warn('⚠️ Response seems too short!', {
        replyLength: reply.length,
        originalLength: aiResponse.length,
        finishReason,
      });
    }
    
    // Check if response ends abruptly (doesn't end with proper punctuation)
    const lastChar = reply.trim().slice(-1);
    const endsProperly = ['.', '!', '?'].includes(lastChar);
    
    if (!endsProperly && finishReason === 'length') {
      console.error('❌ Response was truncated and does not end properly!', {
        replyLength: reply.length,
        lastChars: reply.slice(-50),
        finishReason,
      });
    }
    
    // Log full response for debugging
    console.log('🔍 Full AI Response:', {
      originalLength: aiResponse.length,
      cleanedLength: reply.length,
      finishReason,
      preview: aiResponse.substring(0, 300),
      endsWith: aiResponse.slice(-100),
      hasDataTag: aiResponse.includes('[DATA]'),
      replyPreview: reply.substring(0, 300),
      replyEndsWith: reply.slice(-100),
    });

    // CRITICAL: Verify and filter properties to prevent hallucinations
    let verificationResult;
    try {
      verificationResult = verifyAndFilterProperties(
        reply,
        retrievalResult?.properties || [],
        filters
      );
    } catch (error: any) {
      console.error('❌ Error in verification:', error);
      // Create a safe fallback verification result
      verificationResult = {
        verifiedProperties: retrievalResult?.properties || [],
        metrics: {
          retrievalAccuracy: 0.5,
          responseAccuracy: 0.5,
          hallucinationScore: 0,
          propertyMentionedCount: 0,
          propertyVerifiedCount: 0,
          dataConsistency: 0.5,
          warnings: ['Verification failed, using retrieved properties'],
        },
        sanitizedResponse: reply,
      };
    }

    // Log RAG metrics for monitoring
    console.log('📊 RAG Metrics:', {
      retrievalAccuracy: verificationResult.metrics.retrievalAccuracy.toFixed(2),
      responseAccuracy: verificationResult.metrics.responseAccuracy.toFixed(2),
      hallucinationScore: verificationResult.metrics.hallucinationScore.toFixed(2),
      propertyMentioned: verificationResult.metrics.propertyMentionedCount,
      propertyVerified: verificationResult.metrics.propertyVerifiedCount,
      dataConsistency: verificationResult.metrics.dataConsistency.toFixed(2),
      warnings: verificationResult.metrics.warnings,
    });

    // Warn if hallucinations detected
    if (verificationResult.metrics.hallucinationScore > 0) {
      console.warn('⚠️ Hallucination detected!', {
        invalidMentions: verificationResult.metrics.warnings,
        removedMentions: verificationResult.sanitizedResponse !== reply ? 'Response sanitized' : 'None',
      });
    }

    // Filter properties based on filters from AI response
    // Use verified properties as base, then apply AI filters if available
    let filteredProperties: Property[] = verificationResult.verifiedProperties;
    if (filters) {
      // Handle both {"filters": {...}} and direct {...} formats
      const actualFilters = (filters as any).filters || filters;
      // Apply filters to verified properties
      const baseProperties = verificationResult.verifiedProperties.length > 0 
        ? verificationResult.verifiedProperties 
        : retrievalResult.properties;
      filteredProperties = filterPropertiesByFilters(actualFilters, baseProperties);
    }

    // If no properties found after filtering, use verified properties
    if (filteredProperties.length === 0) {
      filteredProperties = verificationResult.verifiedProperties.length > 0 
        ? verificationResult.verifiedProperties 
        : retrievalResult.properties;
    }

    // Step 6: Rank and explain using reasoning engine
    let rankedResults;
    try {
      rankedResults = reasoningEngine.rankAndExplain(filteredProperties);
    } catch (error: any) {
      console.error('❌ Error in ranking:', error);
      // Fallback: just use filtered properties as-is
      rankedResults = filteredProperties.map(p => ({ ...p, matchScore: 50, explanation: 'Property matches your criteria' }));
    }
    
    // Step 7: Generate contextual suggestions
    let proactiveSuggestions: string[] = [];
    try {
      const context = contextAssistant.understandContext();
      proactiveSuggestions = contextAssistant.provideProactiveSuggestions(
        context,
        rankedResults.map(r => ({ ...r, matchScore: r.matchScore || 50, explanation: r.explanation || 'Property matches your criteria' }))
      );
    } catch (error: any) {
      console.error('❌ Error generating proactive suggestions:', error);
      // Continue without suggestions
    }
    
    // Step 8: Generate comparative analysis if multiple properties
    let comparativeAnalysis = '';
    try {
      if (rankedResults.length > 1) {
        comparativeAnalysis = contextAssistant.generateComparativeAnalysis(rankedResults);
      }
    } catch (error: any) {
      console.error('❌ Error generating comparative analysis:', error);
      // Continue without analysis
    }

    // Use sanitized response ONLY if hallucinations are severe
    // Otherwise use the cleaned reply to preserve full content
    let finalResponse = verificationResult.metrics.hallucinationScore > 0.5
      ? verificationResult.sanitizedResponse
      : reply;
    
    // Enhance response with contextual information if response is complete
    if (finalResponse.length > 200 && proactiveSuggestions.length > 0) {
      finalResponse += '\n\n💡 Proactive Tips:\n';
      proactiveSuggestions.forEach((suggestion, i) => {
        finalResponse += `${i + 1}. ${suggestion}\n`;
      });
    }
    
    // Add comparative analysis if available
    if (comparativeAnalysis && finalResponse.length > 200) {
      finalResponse += '\n\n' + comparativeAnalysis;
    }
    
    // Log final response for debugging - ensure it's complete
    console.log('✅ Final Response:', {
      length: finalResponse.length,
      preview: finalResponse.substring(0, 200),
      endsWith: finalResponse.slice(-100),
      lastSentence: finalResponse.split('.').slice(-2).join('.'), // Last 2 sentences
      hallucinationScore: verificationResult.metrics.hallucinationScore,
      usingSanitized: verificationResult.metrics.hallucinationScore > 0.5,
      finishReason,
      isComplete: finishReason !== 'length', // Check if response was complete
    });
    
    // If response was truncated, log a warning
    if (finishReason === 'length') {
      console.warn('⚠️ WARNING: AI response may be incomplete due to token limit!', {
        responseLength: finalResponse.length,
        recommendation: 'Consider increasing max_tokens or using GPT-4',
      });
    }

    return NextResponse.json({
      response: finalResponse,
      properties: filteredProperties,
      count: filteredProperties.length,
      filters: filters ? ((filters as any).filters || filters) : undefined,
      // RAG metadata
      retrieved_properties: retrievalResult.properties,
      verified_properties: verificationResult.verifiedProperties,
      search_strategy: retrievalResult.strategy,
      confidence: retrievalResult.confidence,
      // RAG Performance metrics
      rag_metrics: verificationResult.metrics,
    });
  } catch (error: any) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Fallback function when OpenAI is not available
 */
async function fallbackToLocalFiltering(message: string) {
  try {
    const allProperties = getAllProperties();
    const filteredProperties = filterPropertiesByMessage(message, allProperties);

  const lowerMessage = message.toLowerCase();
  let responseMessage = '';

  if (lowerMessage.includes('wharton') || lowerMessage.includes('附近')) {
    responseMessage = `Found ${filteredProperties.length} properties near Wharton, highlighted on the map`;
  } else if (lowerMessage.includes('洗烘') || lowerMessage.includes('laundry')) {
    responseMessage = `Found ${filteredProperties.length} properties with in-unit laundry, highlighted on the map`;
  } else if (
    lowerMessage.includes('1500') ||
    lowerMessage.includes('2000') ||
    lowerMessage.includes('预算')
  ) {
    responseMessage = `Found ${filteredProperties.length} properties in your price range, highlighted on the map`;
  } else {
    responseMessage = `Found ${filteredProperties.length} matching properties, highlighted on the map`;
  }

    // Use HybridRetriever for fallback as well
    const retriever = new HybridRetriever();
    const retrievalResult = await retriever.retrieve(message, allProperties);

    return NextResponse.json({
      response: responseMessage,
      properties: filteredProperties,
      count: filteredProperties.length,
      // RAG metadata (even in fallback mode)
      retrieved_properties: retrievalResult.properties,
      search_strategy: retrievalResult.strategy,
      confidence: retrievalResult.confidence,
    });
  } catch (error: any) {
    console.error('Error in fallback filtering:', error);
    // Return safe fallback response
    const allProperties = getAllProperties();
    return NextResponse.json({
      response: 'I encountered an error processing your request. Here are all available properties.',
      properties: allProperties.slice(0, 10), // Limit to first 10 for safety
      count: Math.min(allProperties.length, 10),
      retrieved_properties: allProperties.slice(0, 10),
      search_strategy: 'fallback',
      confidence: 0.5,
    });
  }
}
