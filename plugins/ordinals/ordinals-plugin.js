import { OrdinalsAPI } from './ordinals-api.js';
import { OrdinalsUtils } from './ordinals-utils.js';
import { RareSatoshiHunter } from './rare-satoshi-hunter.js';
import { OrdinalsExplorer } from './ordinals-explorer.js';
import * as path from 'path';
/**
 * Ordinals Plugin for ElizaOS
 *
 * This plugin provides functionality to interact with Bitcoin Ordinals
 * including managing UTXOs, finding rare satoshis, and retrieving inscription content.
 */
export const ordinalsPlugin = {
    name: 'ordinals',
    version: '1.0.0',
    description: 'Bitcoin Ordinals plugin for ElizaOS',
    // Initialize the plugin
    initialize: (runtime) => {
        console.info('Initializing Ordinals Plugin...');
        // Get environment variables and secrets from runtime
        const ordPath = process.env.ORD_PATH || '/usr/local/bin/ord';
        const bitcoinConfPath = process.env.BITCOIN_CONF_PATH || '/Volumes/ordlibrary/bitcoin.conf';
        const explorerPath = process.env.ORDINALS_EXPLORER_PATH || path.resolve(process.cwd(), '../Ord/explorer-main');
        // Try to get API keys from runtime secrets or environment variables
        let hiroApiKey = '';
        let unisatApiKey = '';
        let ordiscanApiKey = '';
        let blockCypherApiToken = '';
        try {
            if (runtime && runtime.getSecret) {
                hiroApiKey = runtime.getSecret('HIRO_API_KEY') || process.env.HIRO_API_KEY || '';
                unisatApiKey = runtime.getSecret('UNISAT_API_KEY') || process.env.UNISAT_API_KEY || '';
                ordiscanApiKey = runtime.getSecret('ORDISCAN_API_KEY') || process.env.ORDISCAN_API_KEY || '';
                blockCypherApiToken = runtime.getSecret('BLOCK_CYPHER_API_TOKEN') || process.env.BLOCK_CYPHER_API_TOKEN || '';
            }
            else {
                hiroApiKey = process.env.HIRO_API_KEY || '';
                unisatApiKey = process.env.UNISAT_API_KEY || '';
                ordiscanApiKey = process.env.ORDISCAN_API_KEY || '';
                blockCypherApiToken = process.env.BLOCK_CYPHER_API_TOKEN || '';
            }
        }
        catch (error) {
            console.warn('Could not retrieve API keys from secrets:', error);
            hiroApiKey = process.env.HIRO_API_KEY || '';
            unisatApiKey = process.env.UNISAT_API_KEY || '';
            ordiscanApiKey = process.env.ORDISCAN_API_KEY || '';
            blockCypherApiToken = process.env.BLOCK_CYPHER_API_TOKEN || '';
        }
        if (!hiroApiKey) {
            console.warn('HIRO_API_KEY not set. Some API calls may fail.');
        }
        else {
            console.info('HIRO_API_KEY is set. Using Hiro API for Ordinals data.');
        }
        // Initialize API and utilities
        const ordinalsAPI = new OrdinalsAPI(hiroApiKey);
        const ordinalsUtils = new OrdinalsUtils(ordPath, bitcoinConfPath);
        const rareSatoshiHunter = new RareSatoshiHunter();
        const ordinalsExplorer = new OrdinalsExplorer(explorerPath, 3333); // Use port 3333 to avoid conflicts
        // Define plugin actions
        const actions = {
            GET_INSCRIPTION_CONTENT: {
                description: 'Get the content of a specific inscription',
                handler: async (_runtime, _message, _state, options, callback) => {
                    try {
                        const inscriptionId = options?.id;
                        if (!inscriptionId) {
                            throw new Error('Inscription ID is required');
                        }
                        const content = await ordinalsAPI.getInscriptionContent(inscriptionId);
                        if (callback)
                            await callback(content);
                        return content;
                    }
                    catch (error) {
                        console.error('Error in GET_INSCRIPTION_CONTENT:', error);
                        throw error;
                    }
                }
            },
            GET_INSCRIPTIONS: {
                description: 'Get a list of inscriptions with optional filtering',
                handler: async (_runtime, _message, _state, options, callback) => {
                    try {
                        const inscriptions = await ordinalsAPI.getInscriptions(options || {});
                        if (callback)
                            await callback(inscriptions);
                        return inscriptions;
                    }
                    catch (error) {
                        console.error('Error in GET_INSCRIPTIONS:', error);
                        throw error;
                    }
                }
            },
            GET_INSCRIPTION: {
                description: 'Get details about a specific inscription',
                handler: async (_runtime, _message, _state, options, callback) => {
                    try {
                        const inscriptionId = options?.id;
                        if (!inscriptionId) {
                            throw new Error('Inscription ID is required');
                        }
                        const inscription = await ordinalsAPI.getInscription(inscriptionId);
                        if (callback)
                            await callback(inscription);
                        return inscription;
                    }
                    catch (error) {
                        console.error('Error in GET_INSCRIPTION:', error);
                        throw error;
                    }
                }
            },
            GET_SATOSHI_INFO: {
                description: 'Get information about a specific satoshi by its ordinal number',
                handler: async (_runtime, _message, _state, options, callback) => {
                    try {
                        const ordinal = options?.ordinal;
                        if (!ordinal) {
                            throw new Error('Satoshi ordinal number is required');
                        }
                        const satoshi = await ordinalsAPI.getSatoshi(ordinal);
                        if (callback)
                            await callback(satoshi);
                        return satoshi;
                    }
                    catch (error) {
                        console.error('Error in GET_SATOSHI_INFO:', error);
                        throw error;
                    }
                }
            },
            GET_SATOSHI_INSCRIPTIONS: {
                description: 'Get inscriptions associated with a specific satoshi',
                handler: async (_runtime, _message, _state, options, callback) => {
                    try {
                        const ordinal = options?.ordinal;
                        if (!ordinal) {
                            throw new Error('Satoshi ordinal number is required');
                        }
                        const inscriptions = await ordinalsAPI.getSatoshiInscriptions(ordinal, options);
                        if (callback)
                            await callback(inscriptions);
                        return inscriptions;
                    }
                    catch (error) {
                        console.error('Error in GET_SATOSHI_INSCRIPTIONS:', error);
                        throw error;
                    }
                }
            },
            GET_INSCRIPTION_TRANSFERS: {
                description: 'Get transfers for a specific inscription',
                handler: async (_runtime, _message, _state, options, callback) => {
                    try {
                        const inscriptionId = options?.id;
                        if (!inscriptionId) {
                            throw new Error('Inscription ID is required');
                        }
                        const transfers = await ordinalsAPI.getInscriptionTransfers(inscriptionId, options);
                        if (callback)
                            await callback(transfers);
                        return transfers;
                    }
                    catch (error) {
                        console.error('Error in GET_INSCRIPTION_TRANSFERS:', error);
                        throw error;
                    }
                }
            },
            FIND_RARE_SATOSHIS: {
                description: 'Find rare satoshis using the ord tool',
                handler: async (_runtime, _message, _state, options, callback) => {
                    try {
                        const rarity = options?.rarity || 'uncommon';
                        const result = await ordinalsUtils.findSatoshisByRarity(rarity);
                        if (callback)
                            await callback(result);
                        return result;
                    }
                    catch (error) {
                        console.error('Error in FIND_RARE_SATOSHIS:', error);
                        throw error;
                    }
                }
            },
            HUNT_RARE_SATOSHIS: {
                description: 'Hunt for rare satoshis using advanced techniques',
                handler: async (_runtime, _message, _state, options, callback) => {
                    try {
                        const hunterOptions = {
                            rarity: options?.rarity || ['mythic', 'legendary', 'epic', 'rare', 'uncommon'],
                            limit: options?.limit || 100,
                            offset: options?.offset || 0,
                            minValue: options?.minValue,
                            maxValue: options?.maxValue,
                            includeDetails: options?.includeDetails || false,
                            sortBy: options?.sortBy || 'rarity',
                            sortDirection: options?.sortDirection || 'desc'
                        };
                        const results = await rareSatoshiHunter.findRareSatoshis(hunterOptions);
                        if (callback)
                            await callback(results);
                        return results;
                    }
                    catch (error) {
                        console.error('Error in HUNT_RARE_SATOSHIS:', error);
                        throw error;
                    }
                }
            },
            GET_SATOSHI_MARKET_STATS: {
                description: 'Get market statistics for rare satoshis',
                handler: async (_runtime, _message, _state, options, callback) => {
                    try {
                        const rarity = options?.rarity || 'all';
                        const stats = await rareSatoshiHunter.getMarketStats(rarity);
                        if (callback)
                            await callback(stats);
                        return stats;
                    }
                    catch (error) {
                        console.error('Error in GET_SATOSHI_MARKET_STATS:', error);
                        throw error;
                    }
                }
            },
            START_ORDINALS_EXPLORER: {
                description: 'Start the Ordinals Explorer web interface',
                handler: async (_runtime, _message, _state, options, callback) => {
                    try {
                        const explorerUrl = await ordinalsExplorer.startExplorer();
                        const result = {
                            status: 'running',
                            url: explorerUrl
                        };
                        if (callback)
                            await callback(result);
                        return result;
                    }
                    catch (error) {
                        console.error('Error in START_ORDINALS_EXPLORER:', error);
                        throw error;
                    }
                }
            },
            STOP_ORDINALS_EXPLORER: {
                description: 'Stop the Ordinals Explorer web interface',
                handler: async (_runtime, _message, _state, _options, callback) => {
                    try {
                        await ordinalsExplorer.stopExplorer();
                        const result = {
                            status: 'stopped'
                        };
                        if (callback)
                            await callback(result);
                        return result;
                    }
                    catch (error) {
                        console.error('Error in STOP_ORDINALS_EXPLORER:', error);
                        throw error;
                    }
                }
            },
            GET_ORDINALS_EXPLORER_STATUS: {
                description: 'Get the status of the Ordinals Explorer',
                handler: async (_runtime, _message, _state, _options, callback) => {
                    try {
                        const isRunning = ordinalsExplorer.isExplorerRunning();
                        const result = {
                            status: isRunning ? 'running' : 'stopped',
                            url: ordinalsExplorer.getExplorerUrl()
                        };
                        if (callback)
                            await callback(result);
                        return result;
                    }
                    catch (error) {
                        console.error('Error in GET_ORDINALS_EXPLORER_STATUS:', error);
                        throw error;
                    }
                }
            }
        };
        // Register actions with the runtime
        if (runtime && runtime.registerAction) {
            Object.entries(actions).forEach(([name, action]) => {
                runtime.registerAction(name, action.handler, { description: action.description });
            });
            console.info('Ordinals Plugin: Registered all actions successfully');
        }
        else {
            console.warn('Ordinals Plugin: Runtime does not support registerAction, skipping action registration');
        }
        return {
            ordinalsAPI,
            ordinalsUtils,
            rareSatoshiHunter,
            ordinalsExplorer,
            actions
        };
    }
};
// Export the plugin
export default ordinalsPlugin;
//# sourceMappingURL=ordinals-plugin.js.map