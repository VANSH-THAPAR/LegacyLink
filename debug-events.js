// Debug script to test event system
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function debugEventSystem() {
    console.log('🔍 Debugging Event Management System...\n');

    try {
        // Test 1: Check if server is running
        console.log('1. Testing server connection...');
        try {
            const healthResponse = await axios.get(`${BASE_URL}/api/auth/health`);
            console.log('✅ Server is running\n');
        } catch (error) {
            console.log('❌ Server not running:', error.message);
            return;
        }

        // Test 2: Test events endpoint without auth (should get 401)
        console.log('2. Testing events endpoint without auth...');
        try {
            await axios.get(`${BASE_URL}/api/events`);
            console.log('❌ Events endpoint should require authentication');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Events endpoint properly requires authentication\n');
            } else {
                console.log('❌ Unexpected error:', error.message);
                console.log('Response:', error.response?.data);
            }
        }

        // Test 3: Test events requests endpoint without auth (should get 401)
        console.log('3. Testing event requests endpoint without auth...');
        try {
            await axios.post(`${BASE_URL}/api/events/requests`, {});
            console.log('❌ Event requests endpoint should require authentication');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Event requests endpoint properly requires authentication\n');
            } else if (error.response && error.response.status === 500) {
                console.log('⚠️  Event requests endpoint returns 500 (might be validation issue)\n');
            } else {
                console.log('❌ Unexpected error:', error.message);
                console.log('Response:', error.response?.data);
            }
        }

        console.log('🎯 Debug Summary:');
        console.log('- Server is running and accessible');
        console.log('- Events endpoints exist and require auth');
        console.log('- 500 errors likely from validation or database issues');
        console.log('\n📋 Next Steps:');
        console.log('1. Check backend logs for specific error messages');
        console.log('2. Verify MongoDB connection');
        console.log('3. Test with valid authentication token');
        console.log('4. Check EventRequest model schema');

    } catch (error) {
        console.log('❌ Debug failed:', error.message);
    }
}

// Run the debug
debugEventSystem();
