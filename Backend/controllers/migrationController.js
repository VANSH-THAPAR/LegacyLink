const { User } = require('../models/UnifiedUser');

// Promote Student to Alumni
exports.promoteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Find user by ID (Student Discriminator)
        const user = await User.findById(studentId);

        if (!user) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        if (user.role === 'alumni') {
            return res.status(400).json({ msg: 'User is already an alumni' });
        }

        // Update role to alumni
        // In Mongoose discriminators, changing the key doesn't automatically cast the document class in memory immediately,
        // but saving it with the new key update in DB works.
        // However, safest is using findByIdAndUpdate with raw result or re-fetching.
        
        const updatedUser = await User.findByIdAndUpdate(
            studentId, 
            { 
                $set: { 
                    role: 'alumni',
                    graduatingYear: new Date().getFullYear(), // Default to now if not set
                    // We can add default alumni fields here
                    isMentor: false 
                } 
            },
            { new: true, runValidators: false } // runValidators logic can be tricky with discriminator change
        );

        res.json({ msg: 'Student promoted to Alumni successfully', user: updatedUser });
    } catch (error) {
        console.error('Migration Error:', error);
        res.status(500).json({ msg: 'Migration failed' });
    }
};

// Batch Migration Trigger (e.g. "Graduate Batch 2024")
exports.graduateBatch = async (req, res) => {
    try {
        const { batchYear } = req.body;
        
        if (!batchYear) return res.status(400).json({ msg: 'Batch year required' });

        const result = await User.updateMany(
            { role: 'student', batchYear: batchYear }, // Assuming batchYear exists on student
            { $set: { role: 'alumni', graduatingYear: batchYear } }
        );

        res.json({ msg: `Batch ${batchYear} graduated. ${result.modifiedCount} students updated.` });
    } catch (error) {
        console.error('Batch Migration Error:', error);
        res.status(500).json({ msg: 'Batch migration failed' });
    }
};
