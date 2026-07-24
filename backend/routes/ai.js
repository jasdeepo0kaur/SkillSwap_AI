const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

/**
 * @route   POST /api/ai/bio-generate
 * @desc    Generate AI bio based on skills and experience
 * @access  Private
 */
router.post('/bio-generate', protect, async (req, res) => {
  const { skillsTeach, skillsLearn, experience } = req.body;
  try {
    const bio = await geminiService.generateBio(skillsTeach, skillsLearn, experience);
    res.json({ bio });
  } catch (error) {
    console.error('Error in bio generation route:', error);
    res.status(500).json({ message: 'Error generating bio', error: error.message });
  }
});

/**
 * @route   POST /api/ai/request-generate
 * @desc    Generate AI Request Message for a session request
 * @access  Private
 */
router.post('/request-generate', protect, async (req, res) => {
  const { skill, teacherName, currentGoals } = req.body;
  try {
    const message = await geminiService.generateRequestMessage(skill, teacherName, currentGoals);
    res.json({ message });
  } catch (error) {
    console.error('Error in request generation route:', error);
    res.status(500).json({ message: 'Error generating request message', error: error.message });
  }
});

/**
 * @route   POST /api/ai/roadmap-generate
 * @desc    Generate AI Learning Roadmap based on a topic and goals
 * @access  Private
 */
router.post('/roadmap-generate', protect, async (req, res) => {
  const { skill, goals } = req.body;
  try {
    const roadmap = await geminiService.generateRoadmap(skill, goals);
    res.json({ roadmap });
  } catch (error) {
    console.error('Error in roadmap generation route:', error);
    res.status(500).json({ message: 'Error generating roadmap', error: error.message });
  }
});

module.exports = router;
