# PathOS: Career Execution Engine

**PathOS** is a high-performance career optimization platform that reverse-engineers the market's highest-paying roles into granular, week-by-week execution protocols. Designed for engineers who value execution over theory.

![PathOS Interface](https://raw.githubusercontent.com/Qambar-dev-0207/PathOS/main/frontend/public/grid.svg)

## 🧠 Core Concept

Modern career advice is often vague, fragmented, and disconnected from market reality. Most engineers suffer from "Analysis Paralysis"—spending more time deciding *what* to learn than actually learning.

**PathOS** solves this by treating career progression as a deterministic engineering problem. By analyzing thousands of data points from high-tier job descriptions and market trends, it generates a **sovereign execution protocol**: a custom-tailored, time-bound roadmap that focuses exclusively on high-leverage skills. 

It's not just a learning app; it's a **Career Operating System** designed to minimize cognitive load and maximize ROI on your time.

## ⚡ System Overview

PathOS operates on a "Signal-over-Noise" philosophy. It strips away the ambiguity of career progression, providing a direct path to wealth generation through technical mastery.

*   **AI Protocol Generation**: Leverages advanced LLMs (**OpenRouter / Gemini**) to build custom learning trajectories based on your specific bandwidth and current skill delta.
*   **Cyberpunk Aesthetic**: A high-contrast, "hacker-terminal" interface built with Framer Motion, featuring spotlight effects, grid backgrounds, and character-scrambling "decryption" animations.
*   **Resource Enrichment**: Integrated DuckDuckGo search engine to automatically verify and attach real-world documentation, repositories, and tutorials to every roadmap step.
*   **Resilient Architecture**: Hybrid storage system (MongoDB Atlas + In-Memory Fallback) and Simulation Mode ensure the system remains operational even during upstream API outages.

## ⚙️ Core Modules

### 1. Identity & Access
- **Secure Authentication**: JWT-based login/registration system protecting user data.
- **Mock Identity**: One-click "Demo Mode" for instant access without credentials in development.

### 2. Trajectory Calibration (Onboarding)
- **Constraint Analysis**: Takes user inputs (Current Skills, Target Role, Salary Goal, Hours/Week).
- **Velocity Calculation**: Algorithms determine if the goal is realistic within the timeframe, adjusting the roadmap density accordingly.

### 3. Protocol Synthesis (The AI Engine)
- **Granular Generation**: Breaks down vague goals (e.g., "Become Senior Backend Engineer") into discrete, weekly executable steps.
- **Topic Clustering**: Logically groups skills (Language → Framework → Architecture → Cloud).

### 4. Resource Intelligence
- **Auto-Enrichment**: The system scrapes the web (via DuckDuckGo) to find the *best* current tutorial, documentation, or video for *each* specific weekly topic.
- **Quality Filtering**: Prioritizes official docs and high-reputation educational platforms.

### 5. Execution Dashboard
- **Interactive Roadmap**: A visual timeline allowing users to mark weeks as complete.
- **Progress Tracking**: Real-time percentage feedback on career goal completion.

## 🛠️ Tech Stack

### Frontend (The Interface)
- **Framework**: Next.js 16.1.1 (App Router)
- **Runtime**: React 19.2.3
- **Styling**: Tailwind CSS 4.0 (Amber/Zinc palette)
- **Animations**: Framer Motion
- **Components**: Radix UI + Custom "Baryon" Loaders

### Backend (The Engine)
- **Framework**: FastAPI (Python 3.10+)
- **AI**: OpenRouter (nvidia/nemotron-3-nano-30b-a3b:free) with Gemini-2.0 fallbacks
- **Database**: MongoDB Atlas (Production) / Mock DB (Development)
- **Search**: DuckDuckGo Search API for resource enrichment

## 🚀 Quick Start

### 1. Engine Setup (Backend)

The backend runs on port **8002** by default.

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
# Start the engine
uvicorn main:app --reload --port 8002
```

### 2. Interface Setup (Frontend)

```bash
cd frontend
npm install
npm run dev
```
Access the system at [http://localhost:3000](http://localhost:3000).

## 🔧 Environment Configuration

Configure your `.env` in the `backend/` directory:

```ini
# AI Provider
OPENROUTER_API_KEY=sk-or-v1-...

# Persistence
MONGODB_URL=mongodb+srv://...

# Security
SECRET_KEY=pathos_secret_alpha_v2
ALGORITHM=HS256
```

## 💎 Design Language

- **Accent**: Golden Yellow (`amber-500`) for primary highlights and status indicators.
- **Contrast**: Hollow-Solid typography using character scrambling animations.
- **Interactivity**: Custom reactive cursor with expansion rings and crosshairs.
- **Feedback**: "Baryon" loaders (pulsing geometric squares) replacing traditional spinners.

## 🛡️ Simulation Mode

If `OPENROUTER_API_KEY` or `MONGODB_URL` are missing, PathOS enters **SIMULATION MODE**:
1.  **Mock Persistence**: User data is stored in volatile memory.
2.  **Predictive Roadmaps**: Uses high-fidelity pre-calculated protocols for major engineering roles.
3.  **Static Enrichment**: Serves a curated set of verified high-quality resource links.

---

*"Stop guessing. Execute."*