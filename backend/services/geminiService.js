const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client if API key is provided
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini API initialized successfully.');
  } catch (error) {
    console.error('Error initializing Gemini API:', error);
  }
} else {
  console.log('No GEMINI_API_KEY found. Falling back to mock AI responses.');
}

/**
 * Generate Bio using Gemini or Mock
 */
const generateBio = async (skillsTeach = [], skillsLearn = [], experience = 'Beginner') => {
  const teachStr = skillsTeach.join(', ') || 'various topics';
  const learnStr = skillsLearn.join(', ') || 'new things';

  if (!genAI) {
    return `Passionate ${experience}-level practitioner. Eager to teach ${teachStr} and looking to learn and collaborate on ${learnStr}. Let's swap skills and grow together!`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Write a short, engaging, professional bio (2 to 3 sentences) for a peer-to-peer skill-sharing platform.
    The user is an ${experience} in their field.
    They want to teach: ${teachStr}.
    They want to learn: ${learnStr}.
    Keep it friendly, collaborative, and concise. Do not include quotes.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini generateBio failed, using fallback:', error);
    return `Passionate ${experience}-level practitioner. Eager to teach ${teachStr} and looking to learn and collaborate on ${learnStr}. Let's swap skills and grow together!`;
  }
};

/**
 * Generate Request Message using Gemini or Mock
 */
const generateRequestMessage = async (skill, targetUserName, currentGoals) => {
  if (!genAI) {
    return `Hi ${targetUserName},\n\nI would love to schedule a SkillSwap session with you to learn "${skill}". My goals are: ${currentGoals || 'to learn the fundamentals and do some hands-on practice'}.\n\nIn return, I would be happy to teach you any of the skills listed on my profile. Looking forward to connecting!`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Draft a polite, enthusiastic request message (100-150 words) from a student to a peer teacher named ${targetUserName}.
    The student wants to learn: ${skill}.
    The student's specific learning goals/details: ${currentGoals || 'general understanding and practice'}.
    The message should introduce the interest, explain what they hope to get out of it, and offer to teach something in exchange.
    Keep the tone polite and collaborative.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini generateRequestMessage failed, using fallback:', error);
    return `Hi ${targetUserName},\n\nI would love to schedule a SkillSwap session with you to learn "${skill}". My goals are: ${currentGoals || 'to learn the fundamentals and do some hands-on practice'}.\n\nIn return, I would be happy to teach you any of the skills listed on my profile. Looking forward to connecting!`;
  }
};

/**
 * Generate Learning Roadmap using Gemini or Mock
 */
const generateRoadmap = async (skillName, learnerGoal) => {
  if (!genAI) {
    return `### Learning Roadmap for ${skillName}
**Goal**: ${learnerGoal || 'Gain proficiency'}

#### 🚀 Phase 1: Fundamentals (1-2 Hours)
- **Topics**: Core terminology, basic concepts, installation/setup.
- **Milestone**: Establish environment and write a basic test project.
- **Exercise**: Create a "Hello World" or equivalent simple sandbox.

#### ⚙️ Phase 2: Intermediate Deep Dive (2-3 Hours)
- **Topics**: Main workflows, configuration, syntax structure, common pitfalls.
- **Milestone**: Build a simple component or complete a minor task.
- **Exercise**: Implement a CRUD or data manipulation function.

#### 🎓 Phase 3: Advanced Integration (2 Hours)
- **Topics**: Best practices, debugging, scalability, next steps.
- **Milestone**: Build and present a cohesive final capstone prototype.
- **Exercise**: Connect multiple parts together and run diagnostics.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Create a structured learning roadmap in clean Markdown for learning "${skillName}".
    The learner's specific goal is: "${learnerGoal || 'Gain general proficiency'}".
    Provide 3 distinct phases (Fundamentals, Intermediate Deep Dive, Advanced Integration).
    For each phase, list:
    - Focus Topics
    - Milestone
    - A practical hands-on exercise
    Keep the roadmap concise, actionable, and formatted nicely with emojis.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini generateRoadmap failed, using fallback:', error);
    return `### Learning Roadmap for ${skillName}
**Goal**: ${learnerGoal || 'Gain proficiency'}

#### 🚀 Phase 1: Fundamentals (1-2 Hours)
- **Topics**: Core terminology, basic concepts, installation/setup.
- **Milestone**: Establish environment and write a basic test project.
- **Exercise**: Create a "Hello World" or equivalent simple sandbox.

#### ⚙️ Phase 2: Intermediate Deep Dive (2-3 Hours)
- **Topics**: Main workflows, configuration, syntax structure, common pitfalls.
- **Milestone**: Build a simple component or complete a minor task.
- **Exercise**: Implement a CRUD or data manipulation function.

#### 🎓 Phase 3: Advanced Integration (2 Hours)
- **Topics**: Best practices, debugging, scalability, next steps.
- **Milestone**: Build and present a cohesive final capstone prototype.
- **Exercise**: Connect multiple parts together and run diagnostics.`;
  }
};

/**
 * Generate Mentor Recommendations using Gemini or Mock
 * Evaluates candidates based on their alignment, trust score, and experience
 */
const getMentorRecommendations = async (learnerSkillsLearn, mentors) => {
  // If we have no mentors, return empty recommendations
  if (!mentors || mentors.length === 0) {
    return [];
  }

  // Pre-format mentor list for readable analysis
  const mentorList = mentors.map((m, index) => ({
    index,
    name: m.name,
    id: m._id,
    skillsTeach: m.skillsTeach,
    experience: m.experience || 'Beginner',
    trustScore: m.trustScore || 5.0,
    reviewCount: m.reviewCount || 0,
    availability: m.availability || 'Flexible'
  }));

  if (!genAI) {
    // Mock Recommendation logic: Sort by trust score and experience
    const scoreVal = { 'Expert': 3, 'Intermediate': 2, 'Beginner': 1 };
    const sorted = [...mentorList].sort((a, b) => {
      if (b.trustScore !== a.trustScore) {
        return b.trustScore - a.trustScore;
      }
      return scoreVal[b.experience] - scoreVal[a.experience];
    });

    return sorted.map((m, idx) => {
      const matchSkill = m.skillsTeach.find(s => 
        learnerSkillsLearn.some(ls => ls.toLowerCase() === s.toLowerCase())
      ) || m.skillsTeach[0];

      return {
        mentorId: m.id,
        name: m.name,
        matchScore: Math.round(90 - (idx * 5) + (m.trustScore * 2)),
        reason: `Excellent match for learning "${matchSkill}". They are an ${m.experience} with a trust score of ${m.trustScore} (${m.reviewCount} reviews) and have availability matching "${m.availability}".`
      };
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an AI Matching Assistant for a P2P learning platform.
    A student wants to learn: [${learnerSkillsLearn.join(', ')}].
    
    Here is a list of candidate teachers:
    ${JSON.stringify(mentorList, null, 2)}
    
    Evaluate each teacher and return a JSON array containing matching scores and specific reasons.
    Each object in the array MUST have the following structure:
    {
      "mentorId": "the_id_of_the_mentor",
      "name": "the_name_of_the_mentor",
      "matchScore": 85, // integer 0-100 rating how well they fit the request
      "reason": "a 1-2 sentence explanation of why they are a good match based on their skills, trustScore, and availability"
    }
    
    Return ONLY valid, parsable JSON array. Do not wrap in markdown tags or add any text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up markdown block headers if Gemini returned them
    if (text.startsWith('```')) {
      text = text.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    }

    const recommendations = JSON.parse(text);
    return recommendations;
  } catch (error) {
    console.error('Gemini getMentorRecommendations failed, using fallback:', error);
    
    // Fallback identical to mock
    return mentorList.slice(0, 5).map((m, idx) => {
      const matchSkill = m.skillsTeach.find(s => 
        learnerSkillsLearn.some(ls => ls.toLowerCase() === s.toLowerCase())
      ) || m.skillsTeach[0];

      return {
        mentorId: m.id,
        name: m.name,
        matchScore: 85 - (idx * 4),
        reason: `Recommended mentor for "${matchSkill}" because of their high trust score of ${m.trustScore} and experience level (${m.experience}).`
      };
    });
  }
};

module.exports = {
  generateBio,
  generateRequestMessage,
  generateRoadmap,
  getMentorRecommendations
};
