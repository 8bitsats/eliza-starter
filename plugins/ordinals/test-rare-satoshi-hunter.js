import { RareSatoshiHunter } from './rare-satoshi-hunter.js';
// Mock runtime for testing
const mockRuntime = {
    getSecret: (key) => {
        if (key === 'HIRO_API_KEY')
            return process.env.HIRO_API_KEY || '';
        if (key === 'UNISAT_API_KEY')
            return process.env.UNISAT_API_KEY || '';
        if (key === 'ORDISCAN_API_KEY')
            return process.env.ORDISCAN_API_KEY || '';
        if (key === 'BLOCK_CYPHER_API_TOKEN')
            return process.env.BLOCK_CYPHER_API_TOKEN || '';
        return '';
    },
    registerAction: () => { } // Mock implementation of registerAction
};
// Test the rare satoshi hunter functionality
async function testRareSatoshiHunter() {
    console.log('Testing Rare Satoshi Hunter...');
    try {
        // Create an instance of the RareSatoshiHunter
        const hunter = new RareSatoshiHunter();
        // Test finding rare satoshis
        console.log('\nTesting findRareSatoshis...');
        try {
            const rareSatoshis = await hunter.findRareSatoshis({
                rarity: ['legendary', 'mythic'],
                limit: 5,
                sortBy: 'rarity',
                sortDirection: 'desc'
            });
            console.log(`Found ${rareSatoshis.length} rare satoshis`);
            if (rareSatoshis.length > 0) {
                console.log('First rare satoshi:', rareSatoshis[0]);
            }
        }
        catch (error) {
            console.error('Error finding rare satoshis:', error);
        }
        // Test getting satoshi details
        console.log('\nTesting getSatoshiDetails...');
        try {
            // Use a known satoshi ordinal for testing
            const ordinal = '1232735286933201'; // This is a known satoshi with an inscription
            const details = await hunter.getSatoshiDetails(ordinal);
            console.log(`Retrieved details for satoshi ${ordinal}:`, details);
        }
        catch (error) {
            console.error('Error getting satoshi details:', error);
        }
        // Test getting market stats
        console.log('\nTesting getMarketStats...');
        try {
            const stats = await hunter.getMarketStats('all');
            console.log('Retrieved market stats for rare satoshis:', stats);
        }
        catch (error) {
            console.error('Error getting market stats:', error);
        }
    }
    catch (error) {
        console.error('Error during testing:', error);
    }
    console.log('\nAll tests completed!');
}
// Run the tests
testRareSatoshiHunter().catch(error => {
    console.error('Unhandled error during testing:', error);
    process.exit(1);
});
//# sourceMappingURL=test-rare-satoshi-hunter.js.map