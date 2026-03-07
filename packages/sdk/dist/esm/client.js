const MAX_STRING_LENGTH = 256;
const MAX_METADATA_KEYS = 10;
const MAX_QUEUE_SIZE = 100;
let _config = null;
let _baseOrigin = '';
let _eventQueue = [];
let _flushTimer = null;
function log(...args) {
    if (_config?.debug) {
        console.log('[optim]', ...args);
    }
}
function validateBaseUrl(baseUrl) {
    let parsed;
    try {
        parsed = new URL(baseUrl);
    }
    catch {
        throw new Error('Optim: baseUrl is not a valid URL');
    }
    // Allow http only for localhost (local development)
    const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLocalhost)) {
        throw new Error('Optim: baseUrl must use HTTPS (http is only allowed for localhost)');
    }
    // Reject URLs with embedded credentials
    if (parsed.username || parsed.password) {
        throw new Error('Optim: baseUrl must not contain credentials');
    }
    // Return origin + pathname without trailing slash
    return parsed.origin + parsed.pathname.replace(/\/+$/, '');
}
function clampInt(value, min, max, fallback) {
    if (typeof value !== 'number' || !Number.isFinite(value))
        return fallback;
    return Math.max(min, Math.min(max, Math.floor(value)));
}
function sanitizeString(value, maxLen) {
    if (typeof value !== 'string')
        return '';
    return value.slice(0, maxLen);
}
function sanitizeMetadata(meta) {
    if (!meta || typeof meta !== 'object')
        return undefined;
    const entries = Object.entries(meta);
    const result = {};
    let count = 0;
    for (const [key, val] of entries) {
        if (count >= MAX_METADATA_KEYS)
            break;
        const safeKey = sanitizeString(key, MAX_STRING_LENGTH);
        const safeVal = sanitizeString(val, MAX_STRING_LENGTH);
        if (safeKey) {
            result[safeKey] = safeVal;
            count++;
        }
    }
    return count > 0 ? result : undefined;
}
export function initOptim(config) {
    if (!config.projectKey) {
        throw new Error('Optim: projectKey is required');
    }
    if (!config.projectKey.startsWith('opt_proj_')) {
        throw new Error('Optim: projectKey must start with opt_proj_');
    }
    if (!config.baseUrl) {
        throw new Error('Optim: baseUrl is required');
    }
    const sanitizedBaseUrl = validateBaseUrl(config.baseUrl);
    _baseOrigin = new URL(sanitizedBaseUrl).origin;
    _config = {
        ...config,
        baseUrl: sanitizedBaseUrl,
        batchSize: config.batchSize ?? 10,
        flushInterval: config.flushInterval ?? 5000,
        debug: config.debug ?? false,
    };
    log('Initialized with project key:', config.projectKey.slice(0, 16) + '...');
    // Start flush timer
    startFlushTimer();
}
export function getConfig() {
    if (!_config) {
        throw new Error('Optim: call initOptim() before using the SDK');
    }
    return _config;
}
export function enqueueEvent(event) {
    const config = getConfig();
    // Sanitize all fields before queuing
    const sanitized = {
        provider: sanitizeString(event.provider, MAX_STRING_LENGTH) || 'unknown',
        model: sanitizeString(event.model, MAX_STRING_LENGTH) || 'unknown',
        promptTokens: clampInt(event.promptTokens, 0, 1000000000, 0),
        completionTokens: clampInt(event.completionTokens, 0, 1000000000, 0),
        totalTokens: clampInt(event.totalTokens, 0, 1000000000, 0),
        latencyMs: event.latencyMs != null ? clampInt(event.latencyMs, 0, 3600000, 0) : undefined,
        isStreaming: typeof event.isStreaming === 'boolean' ? event.isStreaming : undefined,
        originalModel: event.originalModel ? sanitizeString(event.originalModel, MAX_STRING_LENGTH) : undefined,
        status: sanitizeString(event.status, 64) || 'success',
        feature: event.feature ? sanitizeString(event.feature, MAX_STRING_LENGTH) : undefined,
        metadata: sanitizeMetadata(event.metadata),
    };
    _eventQueue.push(sanitized);
    log('Event queued:', sanitized.model, `(${_eventQueue.length}/${config.batchSize})`);
    if (_eventQueue.length >= config.batchSize) {
        flush();
    }
}
function startFlushTimer() {
    if (_flushTimer)
        clearInterval(_flushTimer);
    const config = getConfig();
    _flushTimer = setInterval(() => {
        if (_eventQueue.length > 0) {
            flush();
        }
    }, config.flushInterval);
}
async function flush() {
    if (_eventQueue.length === 0)
        return;
    const config = getConfig();
    const events = [..._eventQueue];
    _eventQueue = [];
    log('Flushing', events.length, 'events');
    try {
        const url = `${config.baseUrl}/api/v1/ingest`;
        // Verify the request URL still matches the configured origin
        const requestOrigin = new URL(url).origin;
        if (requestOrigin !== _baseOrigin) {
            log('Flush blocked: URL origin mismatch');
            return;
        }
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.projectKey}`,
            },
            body: JSON.stringify({ events }),
        });
        if (!res.ok) {
            const text = await res.text();
            log('Flush failed:', res.status, text);
            // Re-queue events on failure (up to max queue size)
            const space = MAX_QUEUE_SIZE - _eventQueue.length;
            if (space > 0) {
                _eventQueue = [...events.slice(0, space), ..._eventQueue];
            }
        }
        else {
            log('Flush successful');
        }
    }
    catch (err) {
        log('Flush error:', err);
        // Re-queue on network error (up to max queue size)
        const space = MAX_QUEUE_SIZE - _eventQueue.length;
        if (space > 0) {
            _eventQueue = [...events.slice(0, space), ..._eventQueue];
        }
    }
}
/**
 * Force flush all pending events. Call before process exit.
 */
export async function flushAll() {
    if (_flushTimer) {
        clearInterval(_flushTimer);
        _flushTimer = null;
    }
    await flush();
}
// Flush on process exit (Node.js)
if (typeof process !== 'undefined' && process.on) {
    process.on('beforeExit', () => {
        flush();
    });
}
//# sourceMappingURL=client.js.map