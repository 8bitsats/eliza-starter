/**
 * Simple logger utility for the Ordinals Plugin
 */
export const logger = {
    info: (...args) => {
        console.info('[Ordinals]', ...args);
    },
    warn: (...args) => {
        console.warn('[Ordinals]', ...args);
    },
    error: (...args) => {
        console.error('[Ordinals]', ...args);
    },
    debug: (...args) => {
        if (process.env.DEBUG) {
            console.debug('[Ordinals]', ...args);
        }
    }
};
//# sourceMappingURL=logger.js.map