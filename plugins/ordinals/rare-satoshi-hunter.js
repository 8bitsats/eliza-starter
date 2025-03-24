import { OrdinalsAPI } from './ordinals-api.js';
import { OrdinalsUtils } from './ordinals-utils.js';
import { logger } from './logger.js';
export class RareSatoshiHunter {
    constructor() {
        // Initialize with default values, API key will be taken from environment
        this.ordinalsAPI = new OrdinalsAPI('');
        this.ordinalsUtils = new OrdinalsUtils('/usr/local/bin/ord', '/Volumes/ordlibrary/bitcoin.conf');
    }
    /**
     * Find rare satoshis using the Hiro API and local ord tool
     * @param options Options for finding rare satoshis
     * @returns Array of rare satoshis
     */
    async findRareSatoshis(options = {}) {
        logger.info('Finding rare satoshis with options:', options);
        const rarities = options.rarity || ['mythic', 'legendary', 'epic', 'rare', 'uncommon'];
        const limit = options.limit || 100;
        const offset = options.offset || 0;
        const minValue = options.minValue || 0;
        const maxValue = options.maxValue || Number.MAX_SAFE_INTEGER;
        const includeDetails = options.includeDetails || false;
        const sortBy = options.sortBy || 'rarity';
        const sortDirection = options.sortDirection || 'desc';
        try {
            // First try to use the ord tool to find rare satoshis
            let rareSatoshis = [];
            try {
                for (const rarity of rarities) {
                    // Parse the output of findSatoshisByRarity which returns a string
                    const rawOutput = await this.ordinalsUtils.findSatoshisByRarity(rarity);
                    // Parse the output into an array of satoshi objects
                    const parsedSatoshis = this.parseSatoshiOutput(rawOutput, rarity);
                    rareSatoshis = [...rareSatoshis, ...parsedSatoshis.map((sat) => ({
                            ordinal: sat.ordinal,
                            rarity: sat.rarity,
                            coinbaseHeight: sat.coinbaseHeight,
                            value: sat.value,
                            inscribed: false
                        }))];
                }
            }
            catch (error) {
                logger.warn('Failed to find rare satoshis using ord tool, falling back to API:', error);
            }
            // If we couldn't get satoshis from the ord tool or we need more, use the API
            if (rareSatoshis.length < limit) {
                // Use the Hiro API to find inscriptions on rare satoshis
                const inscriptions = [];
                for (const rarity of rarities) {
                    const response = await this.ordinalsAPI.getInscriptions({
                        limit: limit - rareSatoshis.length + offset,
                        offset: 0,
                        rarity: [rarity]
                    });
                    if (response && response.inscriptions) {
                        inscriptions.push(...response.inscriptions);
                    }
                }
                // Process inscriptions to extract satoshi information
                for (const inscription of inscriptions) {
                    if (inscription.sat_ordinal && inscription.sat_rarity) {
                        const satoshi = {
                            ordinal: inscription.sat_ordinal,
                            rarity: inscription.sat_rarity,
                            coinbaseHeight: inscription.sat_coinbase_height,
                            value: parseInt(inscription.value) || 0,
                            inscribed: true,
                            inscriptionId: inscription.id
                        };
                        // Add details if requested
                        if (includeDetails) {
                            try {
                                const satDetails = await this.ordinalsAPI.getSatoshi(satoshi.ordinal);
                                satoshi.details = satDetails;
                            }
                            catch (error) {
                                logger.warn(`Failed to get details for satoshi ${satoshi.ordinal}:`, error);
                            }
                        }
                        // Only add if within value range
                        const satoshiValue = satoshi.value || 0;
                        if (satoshiValue >= minValue && satoshiValue <= maxValue) {
                            rareSatoshis.push(satoshi);
                        }
                    }
                }
            }
            // Sort the results
            rareSatoshis.sort((a, b) => {
                const rarityOrder = {
                    'mythic': 5,
                    'legendary': 4,
                    'epic': 3,
                    'rare': 2,
                    'uncommon': 1,
                    'common': 0
                };
                if (sortBy === 'rarity') {
                    const aRarityValue = rarityOrder[a.rarity] || 0;
                    const bRarityValue = rarityOrder[b.rarity] || 0;
                    return sortDirection === 'desc' ? bRarityValue - aRarityValue : aRarityValue - bRarityValue;
                }
                else if (sortBy === 'value') {
                    const aValue = a.value || 0;
                    const bValue = b.value || 0;
                    return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
                }
                else if (sortBy === 'age') {
                    return sortDirection === 'desc' ? a.coinbaseHeight - b.coinbaseHeight : b.coinbaseHeight - a.coinbaseHeight;
                }
                return 0;
            });
            // Apply limit and offset
            return rareSatoshis.slice(offset, offset + limit);
        }
        catch (error) {
            logger.error('Error finding rare satoshis:', error);
            throw error;
        }
    }
    /**
     * Parse the output of the ord find command into structured data
     * @param output The raw output from the ord find command
     * @param rarity The rarity level being parsed
     * @returns Array of structured satoshi data
     */
    parseSatoshiOutput(output, rarity) {
        try {
            // This is a simplified parser, in reality we would need to handle the specific output format
            // of the ord tool, which might be JSON or a custom format
            const lines = output.trim().split('\n');
            return lines.map(line => {
                const parts = line.trim().split(' ');
                return {
                    ordinal: parts[0] || '',
                    rarity: rarity,
                    coinbaseHeight: parseInt(parts[1] || '0'),
                    value: parseInt(parts[2] || '0')
                };
            });
        }
        catch (error) {
            logger.error('Error parsing satoshi output:', error);
            return [];
        }
    }
    /**
     * Get detailed information about a satoshi and any inscriptions on it
     * @param ordinal The ordinal number of the satoshi
     * @returns Detailed information about the satoshi
     */
    async getSatoshiDetails(ordinal) {
        try {
            // Get satoshi information
            const satoshi = await this.ordinalsAPI.getSatoshi(ordinal);
            // Get inscriptions on this satoshi
            const inscriptionsResponse = await this.ordinalsAPI.getSatoshiInscriptions(ordinal, { limit: 10 });
            const inscriptions = inscriptionsResponse?.inscriptions || [];
            return {
                ...satoshi,
                inscriptions
            };
        }
        catch (error) {
            logger.error(`Error getting details for satoshi ${ordinal}:`, error);
            throw error;
        }
    }
    /**
     * Get market statistics for rare satoshis
     * @param rarity Optional rarity filter (e.g., 'mythic', 'legendary', etc.)
     * @returns Market statistics for rare satoshis
     */
    async getMarketStats(rarity = 'all') {
        try {
            logger.info(`Getting market stats for rare satoshis with rarity: ${rarity}`);
            // Define statistics object
            const stats = {
                totalCount: 0,
                byRarity: {
                    mythic: { count: 0, avgValue: 0, minValue: 0, maxValue: 0 },
                    legendary: { count: 0, avgValue: 0, minValue: 0, maxValue: 0 },
                    epic: { count: 0, avgValue: 0, minValue: 0, maxValue: 0 },
                    rare: { count: 0, avgValue: 0, minValue: 0, maxValue: 0 },
                    uncommon: { count: 0, avgValue: 0, minValue: 0, maxValue: 0 },
                    common: { count: 0, avgValue: 0, minValue: 0, maxValue: 0 }
                },
                inscribed: { count: 0, percentage: 0 },
                uninscribed: { count: 0, percentage: 0 },
                recentSales: [],
                priceHistory: [],
                lastUpdated: new Date().toISOString()
            };
            // Get rare satoshis based on rarity filter
            const rarities = rarity === 'all'
                ? ['mythic', 'legendary', 'epic', 'rare', 'uncommon']
                : [rarity];
            // Find satoshis with the specified rarities
            const satoshis = await this.findRareSatoshis({
                rarity: rarities,
                limit: 1000, // Get a good sample size
                includeDetails: false
            });
            // Calculate statistics
            stats.totalCount = satoshis.length;
            // Count inscribed vs uninscribed
            stats.inscribed.count = satoshis.filter(s => s.inscribed).length;
            stats.uninscribed.count = satoshis.filter(s => !s.inscribed).length;
            if (stats.totalCount > 0) {
                stats.inscribed.percentage = (stats.inscribed.count / stats.totalCount) * 100;
                stats.uninscribed.percentage = (stats.uninscribed.count / stats.totalCount) * 100;
            }
            // Calculate statistics by rarity
            for (const satoshi of satoshis) {
                const rarityType = satoshi.rarity;
                if (stats.byRarity[rarityType]) {
                    const rarityStats = stats.byRarity[rarityType];
                    rarityStats.count++;
                    const value = satoshi.value || 0;
                    // Update min/max values
                    if (rarityStats.count === 1 || value < rarityStats.minValue) {
                        rarityStats.minValue = value;
                    }
                    if (rarityStats.count === 1 || value > rarityStats.maxValue) {
                        rarityStats.maxValue = value;
                    }
                    // Update average value
                    rarityStats.avgValue = ((rarityStats.avgValue * (rarityStats.count - 1)) + value) / rarityStats.count;
                }
            }
            // In a real implementation, we would fetch recent sales data from an API
            // For now, we'll just return placeholder data
            stats.recentSales = [
                { ordinal: '1234567890', rarity: 'mythic', salePrice: 1.5, date: new Date().toISOString() },
                { ordinal: '9876543210', rarity: 'legendary', salePrice: 0.8, date: new Date().toISOString() }
            ];
            // Similarly for price history
            stats.priceHistory = [
                { date: '2023-01-01', mythic: 2.0, legendary: 1.0, epic: 0.5, rare: 0.2, uncommon: 0.1 },
                { date: '2023-02-01', mythic: 2.2, legendary: 1.1, epic: 0.6, rare: 0.25, uncommon: 0.12 },
                { date: '2023-03-01', mythic: 1.8, legendary: 0.9, epic: 0.45, rare: 0.18, uncommon: 0.09 }
            ];
            return stats;
        }
        catch (error) {
            logger.error('Error getting market stats for rare satoshis:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=rare-satoshi-hunter.js.map