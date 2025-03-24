import axios from 'axios';
/**
 * OrdinalsAPI - A wrapper for both local and Hiro Ordinals APIs
 * This class provides methods to interact with both a local Ordinals API
 * and the Hiro Ordinals API, with fallback mechanisms.
 */
export class OrdinalsAPI {
    /**
     * Constructor for the OrdinalsAPI class
     * @param hiroApiKey - API key for the Hiro API
     * @param localApiUrl - URL for the local Ordinals API (optional)
     * @param useLocalApiFirst - Whether to try the local API before falling back to Hiro (default: true)
     */
    constructor(hiroApiKey, localApiUrl, useLocalApiFirst = true) {
        this.hiroApiKey = hiroApiKey;
        this.localApiUrl = localApiUrl || 'http://localhost:3000';
        this.useLocalApiFirst = useLocalApiFirst;
    }
    /**
     * Get a list of inscriptions with optional filtering
     * @param options - Query parameters for filtering inscriptions
     * @returns Promise with the inscriptions data
     */
    async getInscriptions(options) {
        const { limit = 20, offset = 0 } = options;
        let queryParams = `limit=${limit}&offset=${offset}`;
        // Add optional parameters
        if (options.mime_type?.length) {
            options.mime_type.forEach(type => {
                queryParams += `&mime_type=${encodeURIComponent(type)}`;
            });
        }
        if (options.address?.length) {
            options.address.forEach(addr => {
                queryParams += `&address=${encodeURIComponent(addr)}`;
            });
        }
        if (options.genesis_address?.length) {
            options.genesis_address.forEach(addr => {
                queryParams += `&genesis_address=${encodeURIComponent(addr)}`;
            });
        }
        if (options.rarity?.length) {
            options.rarity.forEach(r => {
                queryParams += `&rarity=${encodeURIComponent(r)}`;
            });
        }
        return this.makeRequest(`/inscriptions?${queryParams}`);
    }
    /**
     * Get details about a specific inscription by ID
     * @param id - The inscription ID
     * @returns Promise with the inscription data
     */
    async getInscription(id) {
        return this.makeRequest(`/inscriptions/${id}`);
    }
    /**
     * Get the content of a specific inscription
     * @param id - The inscription ID
     * @returns Promise with the inscription content
     */
    async getInscriptionContent(id) {
        return this.makeRequest(`/inscriptions/${id}/content`, true);
    }
    /**
     * Get information about a specific satoshi by its ordinal number
     * @param ordinal - The ordinal number of the satoshi
     * @returns Promise with the satoshi data
     */
    async getSatoshi(ordinal) {
        return this.makeRequest(`/sats/${ordinal}`);
    }
    /**
     * Get inscriptions associated with a specific satoshi
     * @param ordinal - The ordinal number of the satoshi
     * @param options - Query parameters for pagination
     * @returns Promise with the inscriptions data
     */
    async getSatoshiInscriptions(ordinal, options = {}) {
        const { limit = 20, offset = 0 } = options;
        return this.makeRequest(`/sats/${ordinal}/inscriptions?limit=${limit}&offset=${offset}`);
    }
    /**
     * Get transfers for a specific inscription
     * @param id - The inscription ID
     * @param options - Query parameters for pagination
     * @returns Promise with the transfers data
     */
    async getInscriptionTransfers(id, options = {}) {
        const { limit = 20, offset = 0 } = options;
        return this.makeRequest(`/inscriptions/${id}/transfers?limit=${limit}&offset=${offset}`);
    }
    /**
     * Make a request to either the local or Hiro API with fallback
     * @param endpoint - API endpoint to request
     * @param isContent - Whether this is a content request (affects response handling)
     * @returns Promise with the API response
     */
    async makeRequest(endpoint, isContent = false) {
        // Determine which API to try first based on configuration
        const apis = this.useLocalApiFirst
            ? [{ url: this.localApiUrl, isLocal: true }, { url: 'https://api.hiro.so/ordinals/v1', isLocal: false }]
            : [{ url: 'https://api.hiro.so/ordinals/v1', isLocal: false }, { url: this.localApiUrl, isLocal: true }];
        let lastError = null;
        // Try each API in sequence
        for (const api of apis) {
            try {
                const url = `${api.url}${endpoint}`;
                const headers = {};
                // Add authorization header for Hiro API
                if (!api.isLocal) {
                    headers['Authorization'] = `Bearer ${this.hiroApiKey}`;
                }
                const options = {
                    headers,
                    ...(isContent ? { responseType: 'arraybuffer' } : {})
                };
                const response = await axios.get(url, options);
                // For content requests, handle binary data appropriately
                if (isContent) {
                    const contentType = response.headers['content-type'];
                    return {
                        data: response.data,
                        contentType,
                        isText: contentType.includes('text') || contentType.includes('json'),
                    };
                }
                return response.data;
            }
            catch (error) {
                lastError = error;
                console.warn(`API request failed for ${api.isLocal ? 'local' : 'Hiro'} API: ${error instanceof Error ? error.message : String(error)}`);
                // Continue to the next API if available
            }
        }
        // If we get here, all APIs failed
        throw lastError || new Error('Failed to make API request');
    }
}
//# sourceMappingURL=ordinals-api.js.map