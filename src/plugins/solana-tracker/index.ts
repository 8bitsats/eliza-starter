import { Plugin } from '@elizaos/core';
import { SolanaTrackerClient } from './client.js';

/**
 * SolanaTracker plugin that provides access to Solana token data
 */
export const plugin: Plugin = {
  name: 'solana-tracker',
  description: 'Solana Tracker API integration for token data and market information',
  
  // Define providers for token data
  providers: [
    // Trending tokens provider
    {
      get: async (runtime) => {
        try {
          const client = new SolanaTrackerClient();
          const trendingTokens = await client.getTrendingTokens('1h');
          
          // Format the trending tokens for easier consumption
          const formattedTokens = trendingTokens.slice(0, 10).map((item: any, index: number) => {
            const token = item.token;
            const pool = item.pools?.[0];
            
            return {
              rank: index + 1,
              name: token.name,
              symbol: token.symbol,
              price: pool?.price?.usd ? `$${pool.price.usd.toFixed(6)}` : 'N/A',
              change24h: item.events?.['24h']?.priceChangePercentage 
                ? `${(item.events['24h'].priceChangePercentage * 100).toFixed(2)}%` 
                : 'N/A'
            };
          });

          return {
            text: `Top trending tokens on Solana (1h):\n${formattedTokens.map(t => 
              `${t.rank}. ${t.name} (${t.symbol}) - ${t.price} | 24h: ${t.change24h}`
            ).join('\n')}`,
            data: {
              trendingTokens: formattedTokens,
              rawData: trendingTokens
            }
          };
        } catch (error) {
          console.error('Error getting trending tokens:', error);
          return {
            text: 'Unable to fetch trending tokens at this time.',
            data: {
              error: true
            }
          };
        }
      }
    }
  ],
  
  // Empty arrays for other plugin components
  actions: [],
  evaluators: []
};

export default plugin;
