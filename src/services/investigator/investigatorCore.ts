// ============================================================
// THULIR AI — Investigator Core Server Execution Engine
// ============================================================
// Securely executes investigation via OpenRouter NVIDIA Nemotron 3 Ultra.

import {
  INVESTIGATOR_SYSTEM_PROMPT,
  buildInvestigatorUserPrompt,
} from './promptBuilder.ts';
import {
  type APODEvidencePackage,
  type InvestigationResponse,
  validateInvestigationResponse,
} from './investigatorTypes.ts';

export const OPENROUTER_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 18000;

/**
 * Strips markdown code block formatting (```json ... ```) if returned by model.
 */
function cleanJsonText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Core server-side runner to call OpenRouter and return validated investigation.
 */
export async function executeGroundInvestigation(
  pkg: APODEvidencePackage,
  apiKey: string | undefined
): Promise<InvestigationResponse> {
  const timestamp = new Date().toISOString();

  if (!apiKey || apiKey.trim().length === 0) {
    return {
      available: false,
      status: 'AI_UNAVAILABLE',
      reason: 'OPENROUTER_API_KEY is not configured on the server.',
      timestamp,
    };
  }

  // Basic payload validation
  if (!pkg || !pkg.eventId || !pkg.apodState) {
    return {
      available: false,
      status: 'AI_INVALID_RESPONSE',
      reason: 'Invalid A-POD evidence package format.',
      timestamp,
    };
  }

  const userPrompt = buildInvestigatorUserPrompt(pkg);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://thulir.ai',
        'X-Title': 'THULIR AI Ground Event Investigator',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: INVESTIGATOR_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.15,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      return {
        available: false,
        status: 'AI_RATE_LIMITED',
        reason: 'OpenRouter / Nemotron rate limit encountered. Please retry in a few moments.',
        model: OPENROUTER_MODEL,
        timestamp,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        available: false,
        status: 'AI_UNAVAILABLE',
        reason: 'Authentication failed with OpenRouter API provider.',
        model: OPENROUTER_MODEL,
        timestamp,
      };
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return {
        available: false,
        status: 'AI_ERROR',
        reason: `OpenRouter returned HTTP ${response.status}: ${errText.slice(0, 120)}`,
        model: OPENROUTER_MODEL,
        timestamp,
      };
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    const content = payload?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      return {
        available: false,
        status: 'AI_INVALID_RESPONSE',
        reason: 'Empty message content received from NVIDIA Nemotron.',
        model: OPENROUTER_MODEL,
        timestamp,
      };
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleanJsonText(content));
    } catch {
      return {
        available: false,
        status: 'AI_INVALID_RESPONSE',
        reason: 'Failed to parse model output as valid JSON.',
        model: OPENROUTER_MODEL,
        timestamp,
      };
    }

    const validated = validateInvestigationResponse(parsedJson);

    if (!validated) {
      return {
        available: false,
        status: 'AI_INVALID_RESPONSE',
        reason: 'Model output did not satisfy strict schema requirements.',
        model: OPENROUTER_MODEL,
        timestamp,
      };
    }

    return {
      available: true,
      status: 'AI_AVAILABLE',
      investigation: validated,
      model: OPENROUTER_MODEL,
      timestamp,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = (err as Error)?.name === 'AbortError';

    return {
      available: false,
      status: 'AI_ERROR',
      reason: isAbort
        ? 'OpenRouter request timed out after 18 seconds.'
        : `Network exception during AI inference: ${(err as Error)?.message || 'Unknown'}`,
      model: OPENROUTER_MODEL,
      timestamp,
    };
  }
}
