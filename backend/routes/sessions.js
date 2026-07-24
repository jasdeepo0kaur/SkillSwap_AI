const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');
const Review = require('../models/Review');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

/**
 * @route   POST /api/sessions/request
 * @desc    Request a swap session
 * @access  Private
 */
router.post('/request', protect, async (req, res) => {
  const { teacherId, skill, details } = req.body;

  try {
    const learnerId = req.user.id;

    if (learnerId === teacherId) {
      return res.status(400).json({ message: 'You cannot swap skills with yourself' });
    }

    // Verify teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Verify learner has enough coins (minimum cost is 20)
    const learner = await User.findById(learnerId);
    if (learner.skillCoins < 20) {
      return res.status(400).json({ 
        message: `Insufficient SkillCoins. You have ${learner.skillCoins} coins, but requesting a session requires at least 20.` 
      });
    }

    const session = await Session.create({
      learner: learnerId,
      teacher: teacherId,
      skill,
      details,
      status: 'pending',
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error requesting session:', error);
    res.status(500).json({ message: 'Server error requesting session', error: error.message });
  }
});

/**
 * @route   POST /api/sessions/request-generate
 * @desc    AI Request Message Generator (Draft a message for proposal)
 * @access  Private
 */
router.post('/request-generate', protect, async (req, res) => {
  const { skill, teacherName, currentGoals } = req.body;

  try {
    const generatedMessage = await geminiService.generateRequestMessage(skill, teacherName, currentGoals);
    res.json({ message: generatedMessage });
  } catch (error) {
    console.error('Error generating request message:', error);
    res.status(500).json({ message: 'Server error generating request message' });
  }
});

/**
 * @route   GET /api/sessions/my-sessions
 * @desc    Get all sessions for current user (either learner or teacher)
 * @access  Private
 */
router.get('/my-sessions', protect, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ learner: req.user.id }, { teacher: req.user.id }]
    })
    .populate('learner', 'name trustScore skillCoins')
    .populate('teacher', 'name trustScore skillCoins')
    .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error fetching sessions' });
  }
});

/**
 * @route   PUT /api/sessions/:id/accept
 * @desc    Teacher accepts the swap request
 * @access  Private
 */
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.id || req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Only the teacher can accept the session
    if (session.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the requested teacher can accept this session' });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({ message: `Cannot accept session in current status: ${session.status}` });
    }

    session.status = 'accepted';
    await session.save();

    res.json(session);
  } catch (error) {
    console.error('Error accepting session:', error);
    res.status(500).json({ message: 'Server error accepting session' });
  }
});

/**
 * @route   PUT /api/sessions/:id/schedule
 * @desc    Teacher schedules the session time
 * @access  Private
 */
router.put('/:id/schedule', protect, async (req, res) => {
  const { scheduledDate } = req.body;

  try {
    const session = await Session.findById(req.id || req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Only the teacher can schedule
    if (session.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the teacher can schedule the session' });
    }

    if (session.status !== 'accepted' && session.status !== 'scheduled') {
      return res.status(400).json({ message: 'Session must be accepted first before scheduling' });
    }

    session.scheduledDate = new Date(scheduledDate);
    session.status = 'scheduled';
    await session.save();

    res.json(session);
  } catch (error) {
    console.error('Error scheduling session:', error);
    res.status(500).json({ message: 'Server error scheduling session' });
  }
});

/**
 * @route   PUT /api/sessions/:id/complete
 * @desc    Confirm session completion. Triggers transaction when both confirm.
 * @access  Private
 */
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.id || req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.status !== 'scheduled' && session.status !== 'completed') {
      return res.status(400).json({ message: 'Session must be scheduled before confirming completion' });
    }

    const userId = req.user.id;

    if (session.learner.toString() === userId) {
      session.learnerConfirmed = true;
    } else if (session.teacher.toString() === userId) {
      session.teacherConfirmed = true;
    } else {
      return res.status(403).json({ message: 'You are not a participant in this session' });
    }

    // If both confirmed, trigger SkillCoin transaction
    if (session.learnerConfirmed && session.teacherConfirmed && session.status !== 'completed') {
      session.status = 'completed';

      // Perform transaction
      const teacher = await User.findById(session.teacher);
      const learner = await User.findById(session.learner);

      // Verify learner has enough coins at completion time
      if (learner.skillCoins < session.coinsExchanged) {
        return res.status(400).json({ 
          message: `Learner has insufficient coins (${learner.skillCoins}) to complete the transaction.`
        });
      }

      // Deduct coins from learner, add to teacher
      learner.skillCoins -= session.coinsExchanged; // Learn: -20
      teacher.skillCoins += session.coinsExchanged; // Teach: +20

      // Add to learned list, and remove from interests (case-insensitive)
      if (!learner.skillsLearned.includes(session.skill)) {
        learner.skillsLearned.push(session.skill);
      }
      learner.skillsLearn = learner.skillsLearn.filter(
        s => s.toLowerCase() !== session.skill.toLowerCase()
      );

      // Check first swap reward (+20 for first successful completed session)
      // We look at user's other completed sessions
      const learnerCompletedCount = await Session.countDocuments({
        _id: { $ne: session._id },
        status: 'completed',
        $or: [{ learner: learner._id }, { teacher: learner._id }]
      });

      let learnerFirstSwapBonus = false;
      if (learnerCompletedCount === 0) {
        learner.skillCoins += 20; // First Swap: +20
        learnerFirstSwapBonus = true;
      }

      const teacherCompletedCount = await Session.countDocuments({
        _id: { $ne: session._id },
        status: 'completed',
        $or: [{ learner: teacher._id }, { teacher: teacher._id }]
      });

      let teacherFirstSwapBonus = false;
      if (teacherCompletedCount === 0) {
        teacher.skillCoins += 20; // First Swap: +20
        teacherFirstSwapBonus = true;
      }

      await learner.save();
      await teacher.save();

      session.logs = {
        learnerFirstSwapBonus,
        teacherFirstSwapBonus
      };
    }

    await session.save();
    res.json(session);
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ message: 'Server error completing session', error: error.message });
  }
});

/**
 * @route   PUT /api/sessions/:id/cancel
 * @desc    Cancel session (imposes cancellation penalty if scheduled)
 * @access  Private
 */
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.id || req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot cancel a ${session.status} session` });
    }

    const userId = req.user.id;
    if (session.learner.toString() !== userId && session.teacher.toString() !== userId) {
      return res.status(403).json({ message: 'You are not a participant in this session' });
    }

    // Repeated Cancellation penalty: -10 SkillCoins if cancelled after scheduling
    let penaltyApplied = false;
    if (session.status === 'scheduled') {
      const user = await User.findById(userId);
      user.skillCoins = Math.max(0, user.skillCoins - 10); // Repeated Cancellation penalty: -10
      await user.save();
      penaltyApplied = true;
    }

    session.status = 'cancelled';
    await session.save();

    res.json({
      session,
      penaltyApplied,
      message: penaltyApplied ? 'Session cancelled. A cancellation penalty of -10 SkillCoins was applied.' : 'Session cancelled successfully.'
    });
  } catch (error) {
    console.error('Error cancelling session:', error);
    res.status(500).json({ message: 'Server error cancelling session' });
  }
});

/**
 * @route   POST /api/sessions/:id/reviews
 * @desc    Submit review & update target user's trust score + rating count
 * @access  Private
 */
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const session = await Session.findById(req.id || req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Reviews can only be submitted for completed sessions' });
    }

    const reviewerId = req.user.id;
    let revieweeId;

    if (session.learner.toString() === reviewerId) {
      revieweeId = session.teacher;
    } else if (session.teacher.toString() === reviewerId) {
      revieweeId = session.learner;
    } else {
      return res.status(403).json({ message: 'You are not authorized to review this session' });
    }

    // Check if reviewer already reviewed this session
    const existingReview = await Review.findOne({ sessionId: session._id, reviewer: reviewerId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this session' });
    }

    // Create review
    const review = await Review.create({
      sessionId: session._id,
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment
    });

    // Update reviewee's Trust Score & Rating Count
    const allReviews = await Review.find({ reviewee: revieweeId });
    const ratingSum = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = ratingSum / allReviews.length;

    const reviewee = await User.findById(revieweeId);
    reviewee.trustScore = parseFloat(avgRating.toFixed(2));
    reviewee.reviewCount = allReviews.length;

    // Excellent Review Reward: +10 SkillCoins for receiving a 5-star rating
    let excellentRewardApplied = false;
    if (rating === 5) {
      reviewee.skillCoins += 10;
      excellentRewardApplied = true;
    }

    await reviewee.save();

    res.status(201).json({
      review,
      excellentRewardApplied,
      message: excellentRewardApplied ? 'Review submitted! Target user received +10 SkillCoins for an excellent review.' : 'Review submitted successfully.'
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error submitting review', error: error.message });
  }
});

/**
 * @route   GET /api/sessions/:id/roadmap
 * @desc    AI Learning Roadmap generator for session topic
 * @access  Private
 */
router.get('/:id/roadmap', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.id || req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const userId = req.user.id;
    if (session.learner.toString() !== userId && session.teacher.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied to this session roadmap' });
    }

    const roadmapMarkdown = await geminiService.generateRoadmap(session.skill, session.details);
    res.json({ roadmap: roadmapMarkdown });
  } catch (error) {
    console.error('Error generating session roadmap:', error);
    res.status(500).json({ message: 'Server error generating roadmap' });
  }
});

/**
 * @route   GET /api/sessions/:id/messages
 * @desc    Get session chat messages
 * @access  Private
 */
router.get('/:id/messages', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.id || req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const userId = req.user.id;
    if (session.learner.toString() !== userId && session.teacher.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied to session messages' });
    }

    const messages = await Message.find({ sessionId: session._id })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

module.exports = router;
