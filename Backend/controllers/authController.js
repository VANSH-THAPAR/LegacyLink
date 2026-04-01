const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthUser = require('../models/AuthUser');
const Student = require('../models/student');
const Alumni = require('../models/alumni');
const University = require('../models/University');
const Admin = require('../models/Admin');
const cloudinary = require('../utils/cloudinary');

class AuthController {
    // Create user profile based on role
    static async createProfile(userData, role, authId, profilePicture) {
        let profile;
        
        if (role === 'student') {
            profile = new Student({
                ...userData,
                authId: authId,
                profilePicture
            });
        } else if (role === 'alumni') {
            profile = new Alumni({
                ...userData,
                authId: authId,
                profilePicture
            });
        } else if (role === 'admin' || role === 'university') {
            profile = new University({
                ...userData,
                authId: authId,
                profilePicture
            });
        }
        
        return await profile.save();
    }
    
    // Get complete user data including profile
    static async getCompleteUserData(authUser) {
        let profileData = null;
        
        try {
            if (authUser.role === 'student') {
                profileData = await Student.findOne({ authId: authUser._id });
            } else if (authUser.role === 'alumni') {
                profileData = await Alumni.findOne({ authId: authUser._id });
            } else if (authUser.role === 'university') {
                profileData = await University.findOne({ authId: authUser._id });
            } else if (authUser.role === 'admin') {
                profileData = await Admin.findOne({ authId: authUser._id });
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
        
        return {
            _id: authUser._id,
            role: authUser.role,
            email: authUser.email,
            rollNumber: authUser.rollNumber,
            isActive: authUser.isActive,
            lastLogin: authUser.lastLogin,
            profile: profileData || {}
        };
    }
    
    // Update last login
    static async updateLastLogin(userId) {
        try {
            await AuthUser.findByIdAndUpdate(userId, {
                lastLogin: new Date()
            });
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }
    
    // Verify JWT token
    static async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await AuthUser.findById(decoded.user.id);
            
            if (!user || !user.isActive) {
                return null;
            }
            
            return await this.getCompleteUserData(user);
        } catch (error) {
            console.error('Token verification error:', error);
            return null;
        }
    }
    
    // Update user profile
    static async updateProfile(userId, role, updateData) {
        try {
            let updatedProfile;
            
            if (role === 'student') {
                updatedProfile = await Student.findOneAndUpdate(
                    { authId: userId }, 
                    updateData, 
                    { new: true, runValidators: true }
                );
            } else if (role === 'alumni') {
                updatedProfile = await Alumni.findOneAndUpdate(
                    { authId: userId }, 
                    updateData, 
                    { new: true, runValidators: true }
                );
            } else if (role === 'university') {
                updatedProfile = await University.findOneAndUpdate(
                    { authId: userId }, 
                    updateData, 
                    { new: true, runValidators: true }
                );
            } else if (role === 'admin') {
                updatedProfile = await Admin.findOneAndUpdate(
                    { authId: userId }, 
                    updateData, 
                    { new: true, runValidators: true }
                );
            }
            
            return updatedProfile;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }
    
    // Delete user account
    static async deleteAccount(userId) {
        try {
            const authUser = await AuthUser.findById(userId);
            
            if (!authUser) {
                throw new Error('User not found');
            }
            
            // Delete profile data
            if (authUser.role === 'student') {
                await Student.deleteOne({ authId: userId });
            } else if (authUser.role === 'alumni') {
                await Alumni.deleteOne({ authId: userId });
            } else if (authUser.role === 'university') {
                await University.deleteOne({ authId: userId });
            } else if (authUser.role === 'admin') {
                await Admin.deleteOne({ authId: userId });
            }
            
            // Delete auth user
            await AuthUser.findByIdAndDelete(userId);
            
            return true;
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    }
}

module.exports = AuthController;
