const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const connectDB = require('../config/db');
const User = require('../models/User');
const Session = require('../models/Session');
const Review = require('../models/Review');
const Message = require('../models/Message');

// Set env variables for test
process.env.PORT = '5001';
process.env.JWT_SECRET = 'test_secret_key_123456';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill_swap_test';

const runTests = async () => {
  console.log('--- Starting SkillSwap AI API Integration Tests ---');
  
  // Connect to Database
  await connectDB();
  console.log('Database connected.');

  // Clean test users we might create to keep DB clean, but generate random suffixes to avoid collisions
  const ts = Date.now();
  const learnerEmail = `learner_${ts}@example.com`;
  const teacherEmail = `teacher_${ts}@example.com`;

  // Start Express Server
  const app = express();
  app.use(express.json());
  app.use('/api/auth', require('../routes/auth'));
  app.use('/api/users', require('../routes/users'));
  app.use('/api/sessions', require('../routes/sessions'));
  app.use('/api/ai', require('../routes/ai'));

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5001, resolve));
  console.log('Test Server running on port 5001.');

  const baseUrl = 'http://localhost:5001';

  try {
    let learnerToken = '';
    let learnerId = '';
    let teacherToken = '';
    let teacherId = '';
    let sessionId = '';

    // 1. SIGNUP LEARNER
    console.log('\n[TEST 1] Signup Learner...');
    const learnerSignupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Learner Luke',
        email: learnerEmail,
        password: 'password123',
      }),
    });
    const learnerSignupData = await learnerSignupRes.json();
    if (learnerSignupRes.status !== 201) throw new Error(`Learner signup failed: ${JSON.stringify(learnerSignupData)}`);
    learnerToken = learnerSignupData.token;
    learnerId = learnerSignupData._id;
    console.log(`✓ Learner Signup Success: ${learnerSignupData.name} (${learnerSignupData.email})`);
    console.log(`  Initial SkillCoins: ${learnerSignupData.skillCoins} (Expected: 100)`);

    // 2. SIGNUP TEACHER
    console.log('\n[TEST 2] Signup Teacher...');
    const teacherSignupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Teacher Teresa',
        email: teacherEmail,
        password: 'password123',
      }),
    });
    const teacherSignupData = await teacherSignupRes.json();
    if (teacherSignupRes.status !== 201) throw new Error(`Teacher signup failed: ${JSON.stringify(teacherSignupData)}`);
    teacherToken = teacherSignupData.token;
    teacherId = teacherSignupData._id;
    console.log(`✓ Teacher Signup Success: ${teacherSignupData.name} (${teacherSignupData.email})`);

    // 3. COMPLETE TEACHER PROFILE (Earn +10 SkillCoins)
    console.log('\n[TEST 3] Update & Complete Teacher Profile...');
    const teacherProfileRes = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        bio: 'I am an expert React programmer with 5 years experience.',
        skillsTeach: ['React', 'JavaScript'],
        skillsLearn: ['Guitar'],
        experience: 'Expert',
        availability: 'Weekends'
      }),
    });
    const teacherProfileData = await teacherProfileRes.json();
    if (teacherProfileRes.status !== 200) throw new Error(`Teacher profile update failed: ${JSON.stringify(teacherProfileData)}`);
    console.log(`✓ Profile completed: ${teacherProfileData.user.profileCompletedReward} (Expected: true)`);
    console.log(`  Coins: ${teacherProfileData.user.skillCoins} (Expected: 110)`);
    console.log(`  Message: ${teacherProfileData.rewardedInfo}`);

    // 4. COMPLETE LEARNER PROFILE (Earn +10 SkillCoins)
    console.log('\n[TEST 4] Update & Complete Learner Profile...');
    const learnerProfileRes = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${learnerToken}`
      },
      body: JSON.stringify({
        bio: 'Learning new web technologies and interested in music.',
        skillsTeach: ['Guitar'],
        skillsLearn: ['React'],
        experience: 'Beginner',
        availability: 'Flexible'
      }),
    });
    const learnerProfileData = await learnerProfileRes.json();
    if (learnerProfileRes.status !== 200) throw new Error(`Learner profile update failed: ${JSON.stringify(learnerProfileData)}`);
    console.log(`✓ Profile completed: ${learnerProfileData.user.profileCompletedReward} (Expected: true)`);
    console.log(`  Coins: ${learnerProfileData.user.skillCoins} (Expected: 110)`);

    // 5. MARKETPLACE SEARCH
    console.log('\n[TEST 5] Searching Marketplace for "React"...');
    const searchRes = await fetch(`${baseUrl}/api/users/search?query=React`);
    const searchData = await searchRes.json();
    if (searchRes.status !== 200) throw new Error(`Search failed: ${JSON.stringify(searchData)}`);
    const foundTeacher = searchData.find(u => u.name === 'Teacher Teresa');
    if (!foundTeacher) throw new Error('Could not find Teacher Teresa teaching React in search results');
    console.log(`✓ Marketplace search returned Teacher Teresa teaching React.`);

    // 6. AI MENTOR RECOMMENDATIONS
    console.log('\n[TEST 6] Requesting AI Mentor Recommendations for Learner...');
    const recommendRes = await fetch(`${baseUrl}/api/users/recommendations`, {
      headers: { 'Authorization': `Bearer ${learnerToken}` }
    });
    const recommendData = await recommendRes.json();
    if (recommendRes.status !== 200) throw new Error(`Recommendations failed: ${JSON.stringify(recommendData)}`);
    console.log(`✓ Recommendations list size: ${recommendData.recommendations.length}`);
    if (recommendData.recommendations.length > 0) {
      console.log(`  Top recommended mentor: ${recommendData.recommendations[0].name} (Score: ${recommendData.recommendations[0].matchScore})`);
      console.log(`  AI Match Reason: ${recommendData.recommendations[0].reason}`);
    }

    // 7. AI DRAFT REQUEST MESSAGE
    console.log('\n[TEST 7] Requesting AI Request Message Draft...');
    const aiRequestMsgRes = await fetch(`${baseUrl}/api/ai/request-generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${learnerToken}`
      },
      body: JSON.stringify({
        skill: 'React',
        teacherName: 'Teacher Teresa',
        currentGoals: 'Understand components and fetch APIs'
      })
    });
    const aiRequestMsgData = await aiRequestMsgRes.json();
    if (aiRequestMsgRes.status !== 200) throw new Error(`AI request generation failed: ${JSON.stringify(aiRequestMsgData)}`);
    console.log(`✓ AI Draft request message: \n"${aiRequestMsgData.message.substring(0, 150)}..."`);

    // 8. REQUEST SESSION
    console.log('\n[TEST 8] Learner requests a session from Teacher...');
    const requestSessionRes = await fetch(`${baseUrl}/api/sessions/request`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${learnerToken}`
      },
      body: JSON.stringify({
        teacherId,
        skill: 'React',
        details: 'Need a 1-on-1 on React state and custom Hooks.'
      })
    });
    const sessionData = await requestSessionRes.json();
    if (requestSessionRes.status !== 201) throw new Error(`Session request failed: ${JSON.stringify(sessionData)}`);
    sessionId = sessionData._id;
    console.log(`✓ Session requested. ID: ${sessionId}, Status: ${sessionData.status}`);

    // 9. TEACHER ACCEPTS SESSION
    console.log('\n[TEST 9] Teacher accepts session request...');
    const acceptRes = await fetch(`${baseUrl}/api/sessions/${sessionId}/accept`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const acceptData = await acceptRes.json();
    if (acceptRes.status !== 200) throw new Error(`Accept session failed: ${JSON.stringify(acceptData)}`);
    console.log(`✓ Session accepted. Status: ${acceptData.status}`);

    // 10. TEACHER SCHEDULES SESSION
    console.log('\n[TEST 10] Teacher schedules session date...');
    const scheduleRes = await fetch(`${baseUrl}/api/sessions/${sessionId}/schedule`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        scheduledDate: new Date(Date.now() + 86400000) // Tomorrow
      })
    });
    const scheduleData = await scheduleRes.json();
    if (scheduleRes.status !== 200) throw new Error(`Schedule session failed: ${JSON.stringify(scheduleData)}`);
    console.log(`✓ Session scheduled. Date: ${scheduleData.scheduledDate}, Status: ${scheduleData.status}`);

    // 11. CONFIRM COMPLETION & VERIFY COIN TRANSACTIONS
    console.log('\n[TEST 11] Confirming Session Completions...');
    // Teacher Confirms
    const completeTeacherRes = await fetch(`${baseUrl}/api/sessions/${sessionId}/complete`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const completeTeacherData = await completeTeacherRes.json();
    console.log(`✓ Teacher confirmed: ${completeTeacherData.teacherConfirmed}. Session status is still: ${completeTeacherData.status}`);

    // Learner Confirms (This should trigger completion & exchange of 20 coins, and +20 first swap bonus for both!)
    const completeLearnerRes = await fetch(`${baseUrl}/api/sessions/${sessionId}/complete`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${learnerToken}` }
    });
    const completeLearnerData = await completeLearnerRes.json();
    if (completeLearnerRes.status !== 200) throw new Error(`Completion failed: ${JSON.stringify(completeLearnerData)}`);
    console.log(`✓ Learner confirmed: ${completeLearnerData.learnerConfirmed}. Final Session status: ${completeLearnerData.status}`);
    
    // Check user profiles to verify wallet updates
    const finalLearnerProfile = await User.findById(learnerId);
    const finalTeacherProfile = await User.findById(teacherId);

    // Learner Coins calculation:
    // Starts with 100 -> +10 (Profile complete) -> -20 (Learned skill) -> +20 (First swap bonus) = 110 Coins!
    console.log(`✓ Learner final coins: ${finalLearnerProfile.skillCoins} (Expected: 110)`);
    if (finalLearnerProfile.skillCoins !== 110) {
      throw new Error(`Learner wallet calculation error! Got ${finalLearnerProfile.skillCoins}, expected 110.`);
    }

    // Teacher Coins calculation:
    // Starts with 100 -> +10 (Profile complete) -> +20 (Taught skill) -> +20 (First swap bonus) = 150 Coins!
    console.log(`✓ Teacher final coins: ${finalTeacherProfile.skillCoins} (Expected: 150)`);
    if (finalTeacherProfile.skillCoins !== 150) {
      throw new Error(`Teacher wallet calculation error! Got ${finalTeacherProfile.skillCoins}, expected 150.`);
    }

    // 12. SUBMIT REVIEW AND VERIFY TRUST SCORE
    console.log('\n[TEST 12] Learner submits 5-star review for the Teacher...');
    const reviewRes = await fetch(`${baseUrl}/api/sessions/${sessionId}/reviews`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${learnerToken}`
      },
      body: JSON.stringify({
        rating: 5,
        comment: 'Teresa was extremely helpful. Explained React components clearly!'
      })
    });
    const reviewData = await reviewRes.json();
    if (reviewRes.status !== 201) throw new Error(`Submit review failed: ${JSON.stringify(reviewData)}`);
    console.log(`✓ Review submitted. Excellent Reward Applied: ${reviewData.excellentRewardApplied}`);

    // Verify Teacher trust score is updated
    const finalReviewedTeacherProfile = await User.findById(teacherId);
    console.log(`✓ Teacher trust score: ${finalReviewedTeacherProfile.trustScore} (Expected: 5.0)`);
    console.log(`✓ Teacher review count: ${finalReviewedTeacherProfile.reviewCount} (Expected: 1)`);
    // Excellent review reward: +10 coins to teacher -> 150 + 10 = 160 Coins!
    console.log(`✓ Teacher coins after 5-star review: ${finalReviewedTeacherProfile.skillCoins} (Expected: 160)`);
    if (finalReviewedTeacherProfile.skillCoins !== 160) {
      throw new Error(`Excellent review reward wallet calculation failed! Got ${finalReviewedTeacherProfile.skillCoins}, expected 160.`);
    }

    // 13. GENERATE ROADMAP FOR COMPLETED SESSION
    console.log('\n[TEST 13] Requesting AI Roadmap for the session...');
    const roadmapRes = await fetch(`${baseUrl}/api/sessions/${sessionId}/roadmap`, {
      headers: { 'Authorization': `Bearer ${learnerToken}` }
    });
    const roadmapData = await roadmapRes.json();
    if (roadmapRes.status !== 200) throw new Error(`Roadmap generation failed: ${JSON.stringify(roadmapData)}`);
    console.log(`✓ AI Generated Roadmap: \n${roadmapData.roadmap.substring(0, 150)}...`);

    // 14. MESSAGES FETCH ENDPOINT
    console.log('\n[TEST 14] Sending and Fetching messages...');
    await Message.create({
      sessionId,
      sender: learnerId,
      text: 'Thanks for the session today Teresa!'
    });
    const messagesRes = await fetch(`${baseUrl}/api/sessions/${sessionId}/messages`, {
      headers: { 'Authorization': `Bearer ${learnerToken}` }
    });
    const messagesData = await messagesRes.json();
    if (messagesRes.status !== 200) throw new Error(`Fetch messages failed: ${JSON.stringify(messagesData)}`);
    console.log(`✓ Fetched messages count: ${messagesData.length} (Expected: 1)`);
    console.log(`  Last message: "${messagesData[0].text}" by ${messagesData[0].sender.name}`);

    console.log('\n=========================================');
    console.log('ALL API WORKFLOW TESTS PASSED SUCCESSFULLY!');
    console.log('=========================================');

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:');
    console.error(error);
    process.exit(1);
  } finally {
    // Clean up connections
    server.close();
    await mongoose.connection.close();
    console.log('\nCleaned up connections and server terminated.');
  }
};

runTests();
