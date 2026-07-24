const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    bio: {
      type: String,
      default: '',
    },
    skillsTeach: {
      type: [String],
      default: [],
    },
    skillsLearn: {
      type: [String],
      default: [],
    },
    skillsLearned: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert'],
      default: 'Beginner',
    },
    availability: {
      type: String,
      default: 'Flexible',
    },
    skillCoins: {
      type: Number,
      default: 100, // New User starts with 100 coins
    },
    trustScore: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    profileCompletedReward: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      sessionRequests: { type: Boolean, default: true },
      reviews: { type: Boolean, default: true },
      aiCoach: { type: Boolean, default: true },
    },
    privacySettings: {
      profileVisibility: { type: String, enum: ['Public', 'Private'], default: 'Public' },
      showSkillsPublicly: { type: Boolean, default: true },
      allowDirectMessages: { type: Boolean, default: true },
    },
    activeSessions: [{
      device: { type: String, required: true },
      ip: { type: String, required: true },
      lastActive: { type: Date, default: Date.now },
      current: { type: Boolean, default: false }
    }]
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
