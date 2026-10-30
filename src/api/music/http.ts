const DEFAULT_TIMEOUT = 8000;

/**
 * 带超时的 fetch：音乐源接口在弱网下可能长时间不返回，
 * 不设上限会让页面一直停在加载态。
 */
export async function fetchWithTimeout(url: string, timeoutMs = DEFAULT_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error('网络超时，请检查网络后重试');
    }
    throw new Error(err instanceof Error ? err.message : '网络请求失败');
  } finally {
    clearTimeout(timer);
  }
}