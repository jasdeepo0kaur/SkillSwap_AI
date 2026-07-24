const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile & apply +10 coins reward for completeness
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
  const { bio, skillsTeach, skillsLearn, experience, availability } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (bio !== undefined) user.bio = bio;
    if (skillsTeach !== undefined) user.skillsTeach = skillsTeach;
    if (skillsLearn !== undefined) user.skillsLearn = skillsLearn;
    if (experience !== undefined) user.experience = experience;
    if (availability !== undefined) user.availability = availability;

    // Check for "Complete Profile" (+10 SkillCoins)
    // Criteria: Has bio, at least one skill to teach, at least one skill to learn, experience, and availability.
    const isComplete = 
      user.bio && 
      user.bio.trim().length > 0 &&
      user.skillsTeach && 
      user.skillsTeach.length > 0 &&
      user.skillsLearn && 
      user.skillsLearn.length > 0 &&
      user.experience &&
      user.availability;

    let rewarded = false;
    if (isComplete && !user.profileCompletedReward) {
      user.skillCoins += 10;
      user.profileCompletedReward = true;
      rewarded = true;
      console.log(`User ${user.name} rewarded 10 SkillCoins for profile completion.`);
    }

    const updatedUser = await user.save();

    res.json({
      user: updatedUser,
      rewardedInfo: rewarded ? 'Congratulations! You earned +10 SkillCoins for completing your profile!' : null
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

/**
 * @route   GET /api/users/search
 * @desc    Search for users teaching a specific skill (Marketplace search)
 * @access  Public
 */
router.get('/search', async (req, res) => {
  const { query, experience } = req.query;

  try {
    let filter = {};

    if (query) {
      // Find users where skillsTeach array contains a match (case-insensitive regex)
      filter.skillsTeach = { $elemMatch: { $regex: query, $options: 'i' } };
    }

    if (experience) {
      filter.experience = experience;
    }

    // Don't show password or sensitive fields, fetch relevant details
    const users = await User.find(filter).select('-email -createdAt -updatedAt -__v');
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
});

/**
 * @route   GET /api/users/recommendations
 * @desc    Get AI-powered Mentor Recommendations based on user's learning interests
 * @access  Private
 */
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.skillsLearn || user.skillsLearn.length === 0) {
      return res.json({
        recommendations: [],
        message: 'Add skills you want to learn in your profile to get personalized recommendations!'
      });
    }

    // Find potential mentors (users teaching any of the skills this user wants to learn)
    // Exclude the current user from matching themselves
    const potentialMentors = await User.find({
      _id: { $ne: user._id },
      skillsTeach: { $in: user.skillsLearn }
    });

    if (potentialMentors.length === 0) {
      // If no perfect matches, find general high-rated users
      const fallbackMentors = await User.find({
        _id: { $ne: user._id }
      })
      .sort({ trustScore: -1 })
      .limit(5);

      const recommendations = await geminiService.getMentorRecommendations(user.skillsLearn, fallbackMentors);
      return res.json({
        recommendations,
        isFallback: true,
        message: 'No exact matches found for your learning interests. Here are some of our top-rated mentors!'
      });
    }

    // Generate AI recommendations based on potential mentors
    const recommendations = await geminiService.getMentorRecommendations(user.skillsLearn, potentialMentors);
    res.json({
      recommendations,
      isFallback: false
    });
  } catch (error) {
    console.error('Error fetching mentor recommendations:', error);
    res.status(500).json({ message: 'Server error fetching mentor recommendations', error: error.message });
  }
});

/**
 * @route   POST /api/users/bio-generate
 * @desc    AI Bio Generator based on current profile details
 * @access  Private
 */
router.post('/bio-generate', protect, async (req, res) => {
  const { skillsTeach, skillsLearn, experience } = req.body;

  try {
    const teach = skillsTeach || req.user.skillsTeach || [];
    const learn = skillsLearn || req.user.skillsLearn || [];
    const exp = experience || req.user.experience || 'Beginner';

    const generatedBio = await geminiService.generateBio(teach, learn, exp);
    res.json({ bio: generatedBio });
  } catch (error) {
    console.error('Error generating AI bio:', error);
    res.status(500).json({ message: 'Server error generating AI bio' });
  }
});

/**
 * @route   GET /api/users/leaderboard
 * @desc    Get top users sorted by skillCoins (tokens)
 * @access  Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({})
      .sort({ skillCoins: -1 })
      .limit(10)
      .select('name skillCoins trustScore reviewCount');
    res.json(topUsers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Save new password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error updating password' });
  }
});

/**
 * @route   PUT /api/users/settings
 * @desc    Update user preferences for notification and privacy settings
 * @access  Private
 */
router.put('/settings', protect, async (req, res) => {
  const { notificationSettings, privacySettings } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (notificationSettings !== undefined) {
      user.notificationSettings = {
        ...user.notificationSettings,
        ...notificationSettings
      };
    }

    if (privacySettings !== undefined) {
      user.privacySettings = {
        ...user.privacySettings,
        ...privacySettings
      };
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error updating settings', error: error.message });
  }
});

/**
 * @route   POST /api/users/logout-other-devices
 * @desc    Logout from all other active sessions (clear other sessions list)
 * @access  Private
 */
router.post('/logout-other-devices', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Keep only the session marked as current
    user.activeSessions = user.activeSessions.filter(session => session.current === true);
    await user.save();

    res.json(user.activeSessions);
  } catch (error) {
    console.error('Error logging out from other devices:', error);
    res.status(500).json({ message: 'Server error logging out from other devices' });
  }
});

/**
 * @route   DELETE /api/users/delete-account
 * @desc    Delete user account and clean up related data recursively
 * @access  Private
 */
router.delete('/delete-account', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete associated Sessions
    const Session = require('../models/Session');
    await Session.deleteMany({ $or: [{ learner: userId }, { teacher: userId }] });

    // Delete associated Messages
    const Message = require('../models/Message');
    await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });

    // Delete associated Reviews
    const Review = require('../models/Review');
    await Review.deleteMany({ $or: [{ reviewer: userId }, { reviewee: userId }] });

    res.json({ message: 'Account deleted successfully!' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error deleting account', error: error.message });
  }
});

module.exports = router;
