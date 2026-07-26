export function getErrorMessage(payload, fallback = 'Something went wrong') {
    if (!payload) return fallback;
    if (typeof payload === 'string') return payload;
    if (payload instanceof Error) return payload.message || fallback;
    return payload.message || payload.error || payload.detail || fallback;
}

export async function readApiError(response, fallback = 'Request failed') {
    try {
        const data = await response.json();
        return getErrorMessage(data, fallback);
    } catch {
        return fallback;
    }
}
