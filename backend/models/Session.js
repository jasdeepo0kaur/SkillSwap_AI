const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: String,
      required: [true, 'Please specify the skill being swapped'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'scheduled', 'completed', 'cancelled'],
      default: 'pending',
    },
    scheduledDate: {
      type: Date,
    },
    details: {
      type: String,
      default: '',
    },
    learnerConfirmed: {
      type: Boolean,
      default: false,
    },
    teacherConfirmed: {
      type: Boolean,
      default: false,
    },
    coinsExchanged: {
      type: Number,
      default: 20, // default cost of learning is 20 SkillCoins
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Session', SessionSchema);
