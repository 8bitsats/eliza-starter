import { OrdinalsAPI } from './ordinals-api.js';
/**
 * Test script for the Ordinals Plugin using Hiro API
 *
 * This script tests the Ordinals Plugin with the real Hiro API
 * to retrieve inscription data and content.
 */
// Set up environment variables for testing
const HIRO_API_KEY = process.env.HIRO_API_KEY || '';
// Real inscription IDs for testing
const TEST_INSCRIPTION_ID = '38c46a8bf7ec90bc7f6b797e7dc84baa97f4e5fd4286b92fe1b50176d03b18dci0';
const TEST_SATOSHI_ORDINAL = '1232735286933201';
// Test function
async function testOrdinalsPlugin() {
    try {
        console.log('Testing Ordinals Plugin with Hiro API...');
        if (!HIRO_API_KEY) {
            console.warn('⚠️ HIRO_API_KEY not set. Some API calls may fail.');
        }
        // Initialize our utility classes directly for testing
        const ordinalsAPI = new OrdinalsAPI(HIRO_API_KEY, 'http://localhost:3000', // Local API URL (fallback)
        false // Use Hiro API first
        );
        console.log('\nTesting inscription retrieval...');
        try {
            const result = await ordinalsAPI.getInscription(TEST_INSCRIPTION_ID);
            console.log(`Retrieved inscription: ${JSON.stringify(result, null, 2)}`);
        }
        catch (error) {
            console.error('Error retrieving inscription:', error);
        }
        console.log('\nTesting inscription content retrieval...');
        try {
            const result = await ordinalsAPI.getInscriptionContent(TEST_INSCRIPTION_ID);
            console.log(`Retrieved inscription content (${result.contentType}): ${result.isText ? result.data.toString('utf8').substring(0, 100) + '...' : 'Binary content'}`);
        }
        catch (error) {
            console.error('Error retrieving inscription content:', error);
        }
        console.log('\nTesting inscriptions list...');
        try {
            const result = await ordinalsAPI.getInscriptions({ limit: 5 });
            console.log(`Retrieved ${result.results?.length || 0} inscriptions out of ${result.total || 0}`);
            if (result.results?.length > 0) {
                console.log(`First inscription: ${JSON.stringify(result.results[0], null, 2)}`);
            }
        }
        catch (error) {
            console.error('Error retrieving inscriptions list:', error);
        }
        console.log('\nTesting satoshi info retrieval...');
        try {
            const result = await ordinalsAPI.getSatoshi(TEST_SATOSHI_ORDINAL);
            console.log(`Retrieved satoshi info: ${JSON.stringify(result, null, 2)}`);
        }
        catch (error) {
            console.error('Error retrieving satoshi info:', error);
        }
        console.log('\nTesting satoshi inscriptions retrieval...');
        try {
            const result = await ordinalsAPI.getSatoshiInscriptions(TEST_SATOSHI_ORDINAL, { limit: 1 });
            console.log(`Retrieved ${result.results?.length || 0} inscriptions for satoshi ${TEST_SATOSHI_ORDINAL}`);
            if (result.results?.length > 0) {
                console.log(`First inscription: ${JSON.stringify(result.results[0], null, 2)}`);
            }
        }
        catch (error) {
            console.error('Error retrieving satoshi inscriptions:', error);
        }
        console.log('\nAll tests completed!');
    }
    catch (error) {
        console.error('Error during testing:', error);
    }
}
// Run the tests
testOrdinalsPlugin();
//# sourceMappingURL=test-hiro.js.map