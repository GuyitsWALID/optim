"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOptim = initOptim;
exports.getConfig = getConfig;
exports.enqueueEvent = enqueueEvent;
exports.flushAll = flushAll;
let _config = null;
let _eventQueue = [];
let _flushTimer = null;
function log(...args) {
    if (_config?.debug) {
        console.log('[optim]', ...args);
    }
}
function initOptim(config) {
    if (!config.projectKey) {
        throw new Error('Optim: projectKey is required');
    }
    if (!config.projectKey.startsWith('opt_proj_')) {
        throw new Error('Optim: projectKey must start with opt_proj_');
    }
    _config = {
        baseUrl: 'https://optim.dev',
        batchSize: 10,
        flushInterval: 5000,
        debug: false,
        ...config,
    };
    log('Initialized with project key:', config.projectKey.slice(0, 16) + '...');
    // Start flush timer
    startFlushTimer();
}
function getConfig() {
    if (!_config) {
        throw new Error('Optim: call initOptim() before using the SDK');
    }
    return _config;
}
function enqueueEvent(event) {
    const config = getConfig();
    _eventQueue.push(event);
    log('Event queued:', event.model, `(${_eventQueue.length}/${config.batchSize})`);
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
            // Re-queue events on failure (up to 100)
            _eventQueue = [...events.slice(0, 100 - _eventQueue.length), ..._eventQueue];
        }
        else {
            log('Flush successful');
        }
    }
    catch (err) {
        log('Flush error:', err);
        // Re-queue on network error
        _eventQueue = [...events.slice(0, 100 - _eventQueue.length), ..._eventQueue];
    }
}
/**
 * Force flush all pending events. Call before process exit.
 */
async function flushAll() {
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