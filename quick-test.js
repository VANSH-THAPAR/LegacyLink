// Quick test script to verify event management system
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testEventSystem() {
    console.log('🧪 Testing Event Management System...\n');

    try {
        // Test 1: Check if server is running
        console.log('1. Testing server connection...');
        const healthResponse = await axios.get(`${BASE_URL}/api/auth/health`);
        console.log('✅ Server is running\n');

        // Test 2: Test events endpoint (without auth - should get 401)
        console.log('2. Testing events endpoint...');
        try {
            await axios.get(`${BASE_URL}/api/events`);
            console.log('❌ Events endpoint should require authentication');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Events endpoint properly requires authentication\n');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }

        // Test 3: Test event requests endpoint (without auth - should get 401)
        console.log('3. Testing event requests endpoint...');
        try {
            await axios.get(`${BASE_URL}/api/events/requests`);
            console.log('❌ Event requests endpoint should require authentication');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Event requests endpoint properly requires authentication\n');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }

        console.log('🎉 Basic backend tests completed!');
        console.log('\n📋 Next Steps:');
        console.log('1. Start the backend server: cd Backend && npm start');
        console.log('2. Start the frontend: cd Frontend && npm run dev');
        console.log('3. Login as different user types to test the full workflow');
        console.log('4. Check browser console for any remaining errors');

    } catch (error) {
        console.log('❌ Server connection failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure the backend server is running on port 5000');
        console.log('2. Check if MongoDB is connected');
        console.log('3. Verify all dependencies are installed: npm install');
        console.log('4. Check for any syntax errors in the code');
    }
}

// Run the test
testEventSystem();
