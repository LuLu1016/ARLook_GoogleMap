import { setTimeout as delay } from 'node:timers/promises';

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  source: string;
  raw?: unknown;
  error?: string;
}

interface SearchOptions {
  numResults?: number;
  retries?: number;
}

const DEFAULT_RESULTS = 5;
const DEFAULT_RETRIES = 1;

/**
 * Perform a web search using one of the supported providers.
 * Currently supports SerpAPI, Serper, and Google Custom Search (CSE).
 * Gracefully falls back to returning an empty result set when no provider
 * credentials are configured.
 */
export async function performWebSearch(
  query: string,
  options: SearchOptions = {}
): Promise<WebSearchResponse> {
  const numResults = Math.max(1, Math.min(options.numResults ?? DEFAULT_RESULTS, 10));
  const retries = Math.max(0, options.retries ?? DEFAULT_RETRIES);

  const serpApiKey = process.env.SERPAPI_API_KEY;
  const serperApiKey = process.env.SERPER_API_KEY;
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_CX;

  const providers: Array<() => Promise<WebSearchResponse>> = [];

  if (serpApiKey) {
    providers.push(() =>
      searchWithSerpApi(query, numResults, serpApiKey)
    );
  }

  if (serperApiKey) {
    providers.push(() =>
      searchWithSerper(query, numResults, serperApiKey)
    );
  }

  if (googleApiKey && googleCx) {
    providers.push(() =>
      searchWithGoogleCse(query, numResults, googleApiKey, googleCx)
    );
  }

  if (providers.length === 0) {
    console.info('Web search skipped: no provider credentials configured');
    return {
      results: [],
      source: 'none',
      error: 'No web search provider configured',
    };
  }

  for (const provider of providers) {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await provider();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn('Web search provider failed, attempting fallback', {
          message,
          attempt,
          retries,
        });

        if (attempt < retries) {
          await delay(250 * (attempt + 1));
        }
      }
    }
  }

  console.error('All web search providers failed for query:', query);
  return {
    results: [],
    source: 'error',
    error: 'All web search providers failed',
  };
}

async function searchWithSerpApi(
  query: string,
  numResults: number,
  apiKey: string
): Promise<WebSearchResponse> {
  const params = new URLSearchParams({
    api_key: apiKey,
    q: query,
    num: String(numResults),
  });

  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`SerpAPI request failed with status ${response.status}`);
  }

  const data = await response.json();
  const organic = Array.isArray(data.organic_results) ? data.organic_results : [];

  const results: WebSearchResult[] = organic.slice(0, numResults).map((item: any) => ({
    title: item.title ?? item.snippet ?? 'Untitled result',
    url: item.link ?? item.url ?? '',
    snippet: item.snippet ?? item.summary ?? '',
    source: item.source ?? item.displayed_link ?? 'SerpAPI',
  }));

  return {
    results,
    source: 'serpapi',
    raw: sanitizeRawData(data),
  };
}

async function searchWithSerper(
  query: string,
  numResults: number,
  apiKey: string
): Promise<WebSearchResponse> {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({
      q: query,
      num: numResults,
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper request failed with status ${response.status}`);
  }

  const data = await response.json();
  const organic = Array.isArray(data.organic) ? data.organic : [];

  const results: WebSearchResult[] = organic.slice(0, numResults).map((item: any) => ({
    title: item.title ?? item.snippet ?? 'Untitled result',
    url: item.link ?? item.url ?? '',
    snippet: item.snippet ?? item.summary ?? '',
    source: item.source ?? 'Serper',
  }));

  return {
    results,
    source: 'serper',
    raw: sanitizeRawData(data),
  };
}

async function searchWithGoogleCse(
  query: string,
  numResults: number,
  apiKey: string,
  cx: string
): Promise<WebSearchResponse> {
  const params = new URLSearchParams({
    key: apiKey,
    cx,
    q: query,
    num: String(numResults),
  });

  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Google CSE request failed with status ${response.status}`);
  }

  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];

  const results: WebSearchResult[] = items.slice(0, numResults).map((item: any) => ({
    title: item.title ?? item.snippet ?? 'Untitled result',
    url: item.link ?? '',
    snippet: item.snippet ?? item.htmlSnippet ?? '',
    source: item.displayLink ?? 'Google CSE',
  }));

  return {
    results,
    source: 'google_cse',
    raw: sanitizeRawData(data),
  };
}

function sanitizeRawData(data: unknown) {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return undefined;
  }
}

