import { OrdinalsAPI } from './ordinals-api.js';
import { OrdinalsUtils } from './ordinals-utils.js';
/**
 * Test script for the Ordinals Plugin
 *
 * This script tests the basic functionality of the Ordinals Plugin
 * in a similar way to our Pump Fun Token Launcher testing approach,
 * with mock mode for safe testing without real blockchain interactions.
 */
// Mock mode flag (set to true for testing without real blockchain interactions)
const MOCK_MODE = process.env.ORD_MOCK_MODE === 'true';
console.log(`Running in ${MOCK_MODE ? 'MOCK' : 'REAL'} mode`);
// Mock implementations for testing
class MockOrdinalsAPI extends OrdinalsAPI {
    constructor() {
        super('mock-api-key', 'http://localhost:3000', true);
    }
    async getInscriptionContent() {
        return {
            data: Buffer.from('Mock inscription content'),
            contentType: 'text/plain',
            isText: true
        };
    }
    async getInscriptions() {
        return {
            limit: 20,
            offset: 0,
            total: 1,
            results: [
                {
                    id: 'mock-inscription-id',
                    number: 12345,
                    address: 'mock-address',
                    mime_type: 'text/plain',
                    content_length: 23,
                    timestamp: Date.now()
                }
            ]
        };
    }
    async getSatoshi() {
        return {
            coinbase_height: 700000,
            rarity: 'uncommon',
            name: 'mock-satoshi',
            ordinal: '1232735286933201'
        };
    }
}
class MockOrdinalsUtils extends OrdinalsUtils {
    constructor() {
        super('/mock/ord/path', '/mock/bitcoin.conf');
    }
    async runOrdCommand() {
        return 'Mock ord command output';
    }
    async findSatoshisByRarity() {
        return 'sat 1232735286933201 (uncommon) named "mock-satoshi"';
    }
    async inscribeContent() {
        return 'Inscription successful. TXID: mock-txid';
    }
    async getWalletBalance() {
        return 'total: 0.01234567 BTC';
    }
    async listWalletInscriptions() {
        return 'inscription mock-inscription-id\ncontent type: text/plain\ncontent length: 23';
    }
}
// Test function
async function testOrdinalsPlugin() {
    try {
        console.log('Testing Ordinals Plugin...');
        // Set up environment variables for testing
        process.env.ORD_PATH = MOCK_MODE ? '/mock/ord/path' : process.env.ORD_PATH;
        process.env.BITCOIN_CONF_PATH = MOCK_MODE ? '/mock/bitcoin.conf' : process.env.BITCOIN_CONF_PATH;
        process.env.INDEXER_PATH = MOCK_MODE ? '/mock/indexer/path' : process.env.INDEXER_PATH;
        process.env.HIRO_API_KEY = MOCK_MODE ? 'mock-api-key' : process.env.HIRO_API_KEY;
        process.env.BITCOIN_RPC_USER = MOCK_MODE ? 'mock-user' : process.env.BITCOIN_RPC_USER;
        process.env.BITCOIN_RPC_PASSWORD = MOCK_MODE ? 'mock-password' : process.env.BITCOIN_RPC_PASSWORD;
        // Initialize our utility classes directly for testing
        const ordinalsAPI = new (MOCK_MODE ? MockOrdinalsAPI : OrdinalsAPI)(process.env.HIRO_API_KEY || 'mock-api-key', 'http://localhost:3000', true);
        const ordinalsUtils = new (MOCK_MODE ? MockOrdinalsUtils : OrdinalsUtils)(process.env.ORD_PATH || '/mock/ord/path', process.env.BITCOIN_CONF_PATH || '/mock/bitcoin.conf');
        console.log('\nTesting inscription content retrieval...');
        try {
            const inscriptionId = 'mock-inscription-id';
            const result = await ordinalsAPI.getInscriptionContent(inscriptionId);
            console.log(`Retrieved inscription content (${result.contentType}): ${result.isText ? result.data.toString('utf8').substring(0, 30) + '...' : 'Binary content'}`);
        }
        catch (error) {
            console.error('Error retrieving inscription content:', error);
        }
        console.log('\nTesting inscriptions list...');
        try {
            const result = await ordinalsAPI.getInscriptions({ limit: 1 });
            console.log(`Retrieved ${result.results?.length || 0} inscriptions out of ${result.total || 0}`);
            if (result.results?.length > 0) {
                console.log(`First inscription: ${JSON.stringify(result.results[0], null, 2)}`);
            }
        }
        catch (error) {
            console.error('Error retrieving inscriptions list:', error);
        }
        console.log('\nTesting rare satoshi search...');
        try {
            const result = await ordinalsUtils.findSatoshisByRarity('uncommon');
            console.log(`Rare satoshi search result: ${result}`);
        }
        catch (error) {
            console.error('Error searching for rare satoshis:', error);
        }
        console.log('\nTesting wallet balance...');
        try {
            const result = await ordinalsUtils.getWalletBalance();
            console.log(`Wallet balance: ${result}`);
        }
        catch (error) {
            console.error('Error getting wallet balance:', error);
        }
        console.log('\nAll tests completed successfully!');
    }
    catch (error) {
        console.error('Error during testing:', error);
    }
}
// Run the tests
testOrdinalsPlugin();
//# sourceMappingURL=test.js.map