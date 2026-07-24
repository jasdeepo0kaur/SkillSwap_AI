# SkillSwap AI - Peer-to-Peer Learning Platform

SkillSwap AI is a modern, peer-to-peer learning platform where users exchange skills instead of money. Users can teach skills they excel in, learn from others, earn virtual SkillCoins, build a verified Trust Score, and receive AI-powered features (roadmaps, recommendations, bios, and proposal drafts).

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Vanilla CSS, React Router, Socket.io-client, Lucide-React
- **Backend**: Node.js, Express.js, Socket.io (Real-Time Websockets)
- **Database**: MongoDB & Mongoose
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **AI Engine**: Google Gemini 1.5 Flash API (via `@google/generative-ai`)

---

## 🚀 Getting Started on Localhost

Follow these steps to run the complete SkillSwap AI application on your machine.

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher recommended)
- **MongoDB** running locally on default port `27017` (e.g. `mongodb://127.0.0.1:27017/`) or a MongoDB Atlas URI.

---

### Step 1: Set Up and Run the Backend Server

1. Open your terminal and navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by checking the `.env.example` template. A `.env` file has been created for you with defaults:
   - `PORT=5000`
   - `MONGODB_URI=mongodb://127.0.0.1:27017/skill_swap`
   - `JWT_SECRET=super_secret_key_for_skillswap_ai_2026`
   - `GEMINI_API_KEY=` (Optional: enter your Google Gemini API Key. If left blank, the server automatically falls back to offline Mock AI responses, allowing full development).
4. Launch the backend API server in development mode:
   ```bash
   npm run dev
   ```
   *The backend will run on **http://localhost:5000**.*

---

### Step 2: Set Up and Run the Frontend Client

1. Open a new terminal window and navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Set up the frontend configuration. A `.env` file has been created pointing to the backend server:
   - `VITE_API_URL=http://localhost:5000/api`
   - `VITE_SOCKET_URL=http://localhost:5000`
4. Launch the React development server:
   ```bash
   npm run dev
   ```
   *The client dashboard will open on **http://localhost:5173**.*

---

## 🧪 Running Integration Tests

We have included a full-flow integration test runner that tests the entire database model, SkillCoin rewards, first successful swap checks, ratings adjustments, and AI services.

To execute tests:
1. Ensure your local MongoDB is running.
2. In your terminal, navigate to the `backend/` directory and run:
   ```bash
   npm test
   ```
This will automatically spin up an in-memory test server, perform a mock swap workflow between a student and teacher, verify the transaction wallets, print assertions, and clean up.

---

## 💎 SkillCoin Economy Cheat Sheet

| Action | Reward / Penalty | Description |
| :--- | :--- | :--- |
| **New User** | `+100` SkillCoins | Gifted on successful signup |
| **Complete Profile** | `+10` SkillCoins | Gifted when adding bio, experience, and interests |
| **First Successful Swap** | `+20` SkillCoins | Gifted to both learner & teacher on completing their first exchange |
| **Teach a Skill** | `+20` SkillCoins | Earned by the teacher upon session completion |
| **Learn a Skill** | `-20` SkillCoins | Cost deducted from learner upon session completion |
| **Excellent Review** | `+10` SkillCoins | Earned by the recipient of a 5-star session rating |
| **Cancellation Penalty** | `-10` SkillCoins | Deducted if a scheduled session is cancelled |
