import type { AIProviderConfig, AIConfig } from '../types/api';

function normalizeProviderItem(
  item: Record<string, unknown>,
  fallbackType?: AIProviderConfig['providerType'],
  fallbackId?: number,
): AIProviderConfig {
  const rawType = (item.providerType ?? item.provider_type ?? fallbackType ?? 'OPENAI') as string;
  const providerType: AIProviderConfig['providerType'] =
    String(rawType).toUpperCase() === 'GEMINI' ? 'GEMINI' : 'OPENAI';

  const hasId = item.id != null && item.id !== '';
  return {
    ...(hasId ? { id: Number(item.id) } : fallbackId != null ? { id: fallbackId } : {}),
    ...(item.name != null ? { name: String(item.name) } : {}),
    providerType,
    enabled: Boolean(item.enabled ?? true),
    apiKey: String(item.apiKey ?? item.api_key ?? ''),
    apiUrl: String(item.apiUrl ?? item.api_url ?? ''),
    model: String(item.model ?? ''),
  };
}

/** Normalize GET/PUT /admin/ai-config payloads (array or legacy object). */
export function normalizeAIConfig(raw: unknown): AIConfig {
  if (raw == null) return [];

  if (Array.isArray(raw)) {
    return raw
      .filter((item) => item && typeof item === 'object')
      .map((item) => normalizeProviderItem(item as Record<string, unknown>));
  }

  if (typeof raw !== 'object') return [];

  const obj = raw as Record<string, unknown>;

  const nested = obj.providers ?? obj.configurations ?? obj.items;
  if (nested != null) {
    return normalizeAIConfig(nested);
  }

  const list: AIProviderConfig[] = [];

  const legacyOpenai = obj.openai ?? obj.OPENAI;
  if (legacyOpenai && typeof legacyOpenai === 'object') {
    list.push(normalizeProviderItem(legacyOpenai as Record<string, unknown>, 'OPENAI', 1));
  }

  const legacyGemini = obj.gemini ?? obj.GEMINI;
  if (legacyGemini && typeof legacyGemini === 'object') {
    list.push(normalizeProviderItem(legacyGemini as Record<string, unknown>, 'GEMINI', 2));
  }

  if (list.length > 0) return list;

  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const record = value as Record<string, unknown>;
      if (
        'apiKey' in record ||
        'api_key' in record ||
        'providerType' in record ||
        'provider_type' in record
      ) {
        list.push(normalizeProviderItem(record));
      }
    }
  }

  return list;
}
