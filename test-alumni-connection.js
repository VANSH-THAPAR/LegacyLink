// Test script to verify Alumni model connection
const Alumni = require('./Backend/models/Alumni');

async function testAlumniConnection() {
    try {
        console.log('🔍 Testing Alumni model connection...');
        
        // Test finding alumni by authId
        const authId = '69cccd856a2ca7d5dc6f9edb';
        console.log('🔍 Searching for alumni with authId:', authId);
        
        const alumni = await Alumni.findOne({ authId: authId });
        
        if (alumni) {
            console.log('✅ Alumni found:', {
                name: alumni.name,
                email: alumni.email,
                collegeName: alumni.collegeName,
                authId: alumni.authId
            });
        } else {
            console.log('❌ Alumni not found with authId:', authId);
            
            // Try to find any alumni to see if collection exists
            const allAlumni = await Alumni.find({});
            console.log('📊 Total alumni in database:', allAlumni.length);
            
            if (allAlumni.length > 0) {
                console.log('📋 Sample alumni:', {
                    name: allAlumni[0].name,
                    email: allAlumni[0].email,
                    authId: allAlumni[0].authId
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error testing Alumni model:', error);
    }
    
    process.exit(0);
}

testAlumniConnection();
