# PulsarTeam AI Learning Platform

> **Revolutionizing Education Through AI-Powered Personalized Learning**

An intelligent learning platform built with cutting-edge web technologies, featuring AI-generated courses, interactive mind maps, and personalized learning experiences. Developed by **PulsarTeam** for the K-Tech Innovation Challenge.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

---

## 🎯 Project Vision

**PulsarTeam** aims to democratize education by leveraging artificial intelligence to create personalized, adaptive learning experiences. Our platform transforms the traditional one-size-fits-all approach into a dynamic, student-centered learning journey where every course is tailored to individual needs, preferences, and learning styles.

### The Problem We're Solving

Traditional learning platforms offer static content that doesn't adapt to:
- Individual learning speeds and preferences
- Different skill levels and backgrounds
- Specific topics of interest
- Preferred instructional methods
- Available study time

### Our Solution

An AI-powered platform that:
1. **Generates custom courses** based on user preferences and skill level
2. **Visualizes learning paths** through interactive mind maps
3. **Provides real-time AI assistance** during lessons with text selection explanations
4. **Tracks progress dynamically** across all courses and sections
5. **Adapts content** to individual learning styles
6. **Offers flexible pricing** with credit packages starting at 500 free credits
7. **Ensures accessibility** with instant credit delivery and no credit card required to start

---

## 🌟 Key Features

### 🤖 AI Course Generation
- **Google Gemini AI Integration**: Leverages advanced LLM for content generation
- **Personalized Curriculum**: Creates 6-8 modules with 3-5 sections each
- **Adaptive Difficulty**: Adjusts content based on skill level (beginner to expert)
- **Multi-Modal Learning**: Supports visual, auditory, reading/writing, and kinesthetic styles

### 📊 Interactive Mind Maps
- **Visual Learning Paths**: Built with ReactFlow for intuitive course navigation
- **Zigzag Layout**: Alternating left-right module placement for better readability
- **Progress Tracking**: Real-time visual indicators for completed sections
- **Dynamic Updates**: Instant UI refresh without page reload

### 💬 AI Assistant (Enhanced with RAG)
- **Contextual Help**: AI chatbot integrated within each lesson
- **Text Selection Explanation**: Select any text in lesson content and click AI button for instant explanations
- **Smart Floating Button**: AI assistant icon appears next to selected text
- **Section-Specific Guidance**: Understands current lesson content
- **Quick Questions**: Pre-defined questions for faster learning
- **Natural Conversations**: Powered by Gemini AI for human-like interactions
- **RAG Integration**: Retrieval Augmented Generation với Qdrant vector database
- **Smart Context Search**: AI tìm kiếm relevant chunks từ course content
- **Embedding Server**: FastAPI server với Sentence Transformers (mxbai-embed-large-v1)
- **User-Scoped Filtering**: RAG search filtered by userId + lessonId

### 💳 Credit System & Pricing
- **Flexible Pricing Plans**: Free, Pro, Premium, and Ultimate tiers
- **Credit Packages**: 500 to 100,000 credits with volume discounts
- **Currency Toggle**: Switch between USD and VND
- **Billing Options**: One-time purchase or monthly subscription (20% discount)
- **Seamless Checkout**: Integrated checkout modal with user info pre-fill
- **Free Credits**: New users start with 500 free credits

### 🎓 Smart Quiz System
- **Auto-Generated Quizzes**: AI creates relevant multiple-choice questions
- **Instant Feedback**: Immediate scoring and explanations
- **Credit Rewards**: Earn credits for engagement and completion
- **Professional Icons**: Trophy, ThumbsUp, and TrendingUp icons for different score ranges

### 📈 Progress Dashboard
- **Section-Level Tracking**: Monitors completion across all courses
- **Overall Progress Metrics**: Visual representation of learning journey
- **Course Analytics**: Detailed stats for each course
- **Auto-Refresh**: Real-time updates when returning to dashboard
- **Canvas Background**: Animated tech-style background with optimized loading

### ⚙️ User Settings & Profile
- **Profile Management**: Update name, email, and phone number
- **Password Changes**: Secure password update with validation
- **API Key Management**: Custom Gemini API key configuration
- **Avatar Support**: Profile picture integration
- **Pre-filled Forms**: User data automatically loaded in checkout and settings

### 🔒 Security & Authentication
- **NextAuth.js Integration**: Secure email/password authentication
- **Multi-OAuth Support**: GitHub + Google OAuth providers
- **OTP Verification**: Email-based OTP for registration
- **Password-Protected Actions**: Requires password confirmation for course deletion
- **Session Management**: Persistent login with JWT tokens
- **bcrypt Hashing**: Strong password encryption
- **API Key Encryption**: AES-256-GCM encryption cho Gemini API keys
- **User Auto-Creation**: Automatic database user creation cho OAuth flows

### 🎨 Modern UI/UX
- **Dark Theme**: Zinc-950 backgrounds with orange accents throughout
- **Glass Morphism**: Backdrop-blur effects on cards and modals
- **Canvas Backgrounds**: Animated particle effects on key pages (dashboard, pricing, settings, 404)
- **Smooth Animations**: GPU-accelerated scrolling and transitions
- **Hover Effects**: Interactive team member avatars and pricing cards
- **Custom 404 Page**: Beautiful error page with navigation shortcuts
- **Professional Icons**: Lucide React icons throughout the application

### 👥 Community & Social Learning
- **Community Feed**: Share courses with other learners
- **Rich Reactions**: Like, Love, Haha, Wow, Sad, Angry reactions for posts
- **Nested Comments**: Comment on posts with threaded replies
- **Real-time Notifications**: Instant alerts for reactions, comments, and messages
- **User Profiles**: View other users' public profiles and shared courses
- **Engagement Tracking**: Track likes, comments, and social interactions

### 💬 Messenger Integration
- **In-App Messaging**: Real-time chat system between users
- **Facebook Messenger Linking**: Connect Facebook Messenger account for external notifications
- **Token-Based Authentication**: Secure PSID linking with expiring tokens
- **Auto-Link Feature**: Settings page button for easy account linking
- **Conversation Management**: Create, view, and manage conversations
- **Read Receipts**: Track message read status
- **Unread Counts**: Visual indicators for unread messages

---

## 🏗️ Technical Architecture

### 🎨 Frontend Stack (Next.js Client)
```typescript
// Modern React with Next.js 14 App Router
Next.js 14          // React framework (client-only)
TypeScript 5        // Type-safe development
Tailwind CSS 3      // Utility-first styling
ReactFlow 11        // Mind map visualization
Lucide React        // Icon library
React Markdown      // Content rendering with syntax highlighting
Axios               // HTTP client for API calls
NextAuth.js         // Session management (client-side)
```

### ⚙️ Backend Stack (Express.js API)
```typescript
// RESTful API Server
Express.js          // Node.js web framework
TypeScript 5        // Type-safe backend development
Prisma ORM          // Type-safe database client
PostgreSQL          // Production database (Supabase)
Google Gemini AI    // Content & quiz generation
JWT                 // Token-based authentication
bcryptjs            // Password hashing
Node.js Crypto      // AES-256-GCM encryption
CORS                // Cross-origin resource sharing
```

### 🤖 AI & ML Stack
```python
// RAG & Embeddings
Sentence Transformers  // Text embeddings (mxbai-embed-large-v1)
Qdrant                 // Vector database
FastAPI                // Python embedding server (ta.py)
Ollama (optional)      // Local LLM alternative
```

### 🐳 DevOps & Infrastructure
```yaml
// Containerization & Orchestration
Docker              // Container runtime
Docker Compose      // Multi-container orchestration
PostgreSQL          // Database container
Nginx (optional)    // Reverse proxy
```

### Key Technologies

| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **Next.js 14** | Frontend framework | SSR/SSG, optimized performance, great DX |
| **Express.js** | Backend API | Flexible, lightweight, mature ecosystem |
| **TypeScript** | Language (both) | Type safety, better DX, fewer runtime errors |
| **Prisma** | ORM | Type-safe queries, migrations, great DX |
| **Tailwind CSS** | Styling | Rapid development, consistent design system |
| **ReactFlow** | Mind maps | Interactive node-based visualizations |
| **Gemini AI** | Content generation | Advanced LLM, free tier, streaming support |
| **PostgreSQL** | Database | Robust, scalable, excellent Prisma support |
| **JWT** | Authentication | Stateless, scalable, industry standard |
| **Docker** | Containerization | Consistent environments, easy deployment |
| **Qdrant** | Vector DB | Fast similarity search, RAG support |
| **FastAPI** | Embedding server | High-performance Python API |

### Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Next.js Frontend<br/>Port 3000]
    end
    
    subgraph "API Layer"
        B[Express.js Backend<br/>Port 5000]
    end
    
    subgraph "Data Layer"
        C[(PostgreSQL<br/>Database)]
        D[(Qdrant<br/>Vector DB)]
    end
    
    subgraph "AI Services"
        E[Google Gemini AI<br/>LLM]
        F[FastAPI Embedding<br/>Server Port 8000]
    end
    
    A -->|REST API + JWT| B
    B -->|Prisma ORM| C
    B -->|RAG Queries| D
    B -->|Content Generation| E
    B -->|Text Embeddings| F
    F -->|Store Vectors| D
    
    style A fill:#f97316,stroke:#fff,stroke-width:2px,color:#fff
    style B fill:#3b82f6,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#8b5cf6,stroke:#fff,stroke-width:2px,color:#fff
    style E fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff
    style F fill:#f59e0b,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 🎨 Design System

### Factory.ai Inspired Theme
Our design draws inspiration from **Factory.ai** and **Augment Code**, featuring:

- **Dark Mode First**: Zinc-950 backgrounds with orange accents
- **Subtle Animations**: Smooth transitions and hover effects
- **Modern UI**: Rounded corners, gradients, and glassmorphism
- **Orange & White Palette**: Primary orange (#f97316) with white highlights
- **Micro-interactions**: Icon color changes, button animations, progress bars

### Component Architecture
```
├── Layout Components
│   ├── TopBanner         # Animated announcement banner
│   ├── HeaderNew         # Navigation with credits & user menu
│   └── Footer            # Links and social media
│
├── Feature Components
│   ├── NetworkCanvas     # Animated particle background (homepage)
│   ├── TechCanvas        # Tech grid background (dashboard, pricing, settings, 404)
│   ├── CourseVisualization # ReactFlow mind map
│   ├── SectionModalNew   # Lesson viewer with text selection AI
│   ├── CoursePreferencesModal # Multi-step preference selector
│   ├── CheckoutModal     # Credit purchase with user pre-fill
│   ├── APIKeyErrorModal  # Custom API key setup
│   ├── MessengerInbox    # In-app messaging inbox
│   ├── MessengerModal    # Chat conversation window
│   └── ReactionPicker    # Post reaction selector (like/love/haha)
│
└── UI Components
    ├── AdvancedSearchBoxNew # Course generation input
    ├── PopularTopicsNew     # Trending topic cards
    ├── LoginModal           # Authentication dialog
    └── OnboardingWrapper    # First-time user guidance
```

### Key Pages

| Page | Route | Description | Special Features |
|------|-------|-------------|------------------|
| **Homepage** | `/` | Landing page with hero & features | Team hover effects, particle canvas |
| **AI Tutor** | `/ai-tutor` | AI course generation interface | Course preferences, topic search |
| **Course Detail** | `/course/[id]` | Interactive mind map view | ReactFlow visualization, progress tracking |
| **Lesson Viewer** | `/course/[id]?section=[sid]` | Detailed section content | Text selection AI, chat sidebar, quizzes |
| **Dashboard** | `/dashboard` | User's course overview | Progress stats, canvas background |
| **Community** | `/community` | Social learning feed | Posts, reactions, comments, notifications |
| **Pricing** | `/pricing` | Credit packages & checkout | Currency toggle, billing options, glass cards |
| **Settings** | `/settings` | Profile & API key management | Profile update, password change, Messenger linking |
| **Link Account** | `/linkaccount` | Messenger account linking | Token-based or auto-link mode |
| **Login/Register** | `/login`, `/register` | Authentication | Email/password, GitHub/Google OAuth, OTP |
| **404 Error** | `*` (any invalid route) | Custom error page | Canvas background, quick navigation |

---

## 🚀 How It Works

### 1. User Journey

```mermaid
graph TD
    A[User Registration<br/>Frontend] --> B[POST /api/auth/register<br/>Backend API]
    B --> C[Create User + 500 Credits<br/>PostgreSQL]
    C --> D[Return JWT Token]
    D --> E[Course Preferences<br/>Frontend Modal]
    E --> F[POST /api/lessons/generate<br/>Backend API]
    F --> G[Gemini AI Generation<br/>6-8 Modules]
    G --> H[Save to Database<br/>+ Embed to Qdrant]
    H --> I[Interactive Mind Map<br/>ReactFlow]
    I --> J[Section Learning<br/>Click to Open]
    J --> K[GET /api/sections/:id<br/>Fetch Content]
    K --> L[Text Selection AI Explain]
    K --> M[AI Assistant Chat<br/>+ RAG Search]
    K --> N[Knowledge Quiz<br/>POST /api/quiz/generate]
    N --> O[Progress Tracking<br/>POST /api/sections/:id/complete]
    O --> P{Need More Credits?}
    P -->|Yes| Q[Visit Pricing Page<br/>Frontend]
    Q --> R[Checkout & Payment]
    R --> S[POST /api/credits/add<br/>Update Balance]
    S --> T[Continue Learning]
    P -->|No| T
    T --> U[Course Completion]
    
    style A fill:#f97316,stroke:#fff,stroke-width:2px,color:#fff
    style B fill:#3b82f6,stroke:#fff,stroke-width:2px,color:#fff
    style F fill:#3b82f6,stroke:#fff,stroke-width:2px,color:#fff
    style G fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff
    style I fill:#f97316,stroke:#fff,stroke-width:2px,color:#fff
    style K fill:#3b82f6,stroke:#fff,stroke-width:2px,color:#fff
    style M fill:#8b5cf6,stroke:#fff,stroke-width:2px,color:#fff
```

### 2. AI Course Generation Flow

1. **User Input**: Topic + Preferences (learning style, time, skill level)
2. **Preference Collection**: Multi-step modal gathers detailed requirements
3. **AI Processing**: Gemini AI generates structured curriculum
4. **Database Storage**: Saves course with modules, sections, and content
5. **Visualization**: Renders as interactive mind map
6. **Ready to Learn**: User can start from any section

### 3. Content Generation

```typescript
// Example: AI generates detailed lesson content
const prompt = `Create a comprehensive lesson about "${sectionTitle}"
                for ${skillLevel} learners. Include:
                - H1, H2, H3 headings
                - Code examples with syntax
                - Real-world applications
                - Practice exercises`

// Streams content in real-time using SSE
const stream = await generateContent(prompt)
```

### 4. Text Selection AI Explanation

```typescript
// User selects text in lesson content
const handleTextSelection = () => {
  const selection = window.getSelection()
  const text = selection?.toString().trim()
  
  if (text && text.length > 0) {
    // Show floating AI button next to selection
    showAIExplainButton(text, position)
  }
}

// Click AI button to get instant explanation
const handleExplainSelection = async () => {
  // Opens AI chat if closed
  // Sends: "Giải thích đoạn này: [selected text]"
  // AI responds with detailed explanation
}
```

### 5. Credit Purchase Flow

1. **Browse Pricing**: View pricing tiers on `/pricing` page
2. **Currency Selection**: Toggle between USD and VND
3. **Billing Cycle**: Choose one-time or monthly (20% discount)
4. **Checkout**: Click "Buy Now" to open checkout modal
5. **Auto-fill**: User info pre-filled if logged in
6. **Payment**: Complete payment details
7. **Credits Added**: Instantly added to user account

### 6. Progress Tracking

- **Section Level**: Marks individual sections as complete
- **Module Level**: Calculates percentage based on completed sections
- **Course Level**: Overall progress across all modules
- **Dashboard**: Aggregates stats from all courses with animated canvas background

---

## 📦 Installation & Setup

### Prerequisites

```bash
Node.js >= 18.x
npm >= 9.x
PostgreSQL >= 14.x (or use Supabase/Neon)
Docker & Docker Compose (recommended)
Google Gemini API Key (free at ai.google.dev)
```

### Method 1: Docker Compose (Recommended) 🐳

**Fastest way to get started with all services:**

```bash
# 1. Clone repository
git clone https://github.com/your-team/pulsarteam-ai-learning.git
cd pulsarteam-ai-learning

# 2. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your values

# 3. Start all services with Docker Compose
docker-compose up -d

# 4. Run database migrations
docker-compose exec backend npx prisma migrate dev

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - PostgreSQL: localhost:5432
```

### Method 2: Manual Setup (Development)

**For local development without Docker:**

#### Step 1: Clone Repository

```bash
git clone https://github.com/your-team/pulsarteam-ai-learning.git
cd pulsarteam-ai-learning
```

#### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your actual values

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start backend server
npm run dev
# Backend will run on http://localhost:5000
```

#### Step 3: Setup Frontend

```bash
# Open new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your actual values

# Start frontend server
npm run dev
# Frontend will run on http://localhost:3000
```

### Environment Setup

#### Backend Environment Variables (`backend/.env`)

**Required:**

| Variable | Description | How to Get |
|----------|-------------|------------|
| `PORT` | Backend server port | `5000` (default) |
| `DATABASE_URL` | PostgreSQL connection string with pooling | `postgresql://user:pass@host/db?pgbouncer=true` |
| `DIRECT_URL` | Direct PostgreSQL connection (for migrations) | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | JWT token encryption key | Run: `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | JWT token expiration | `1d` (1 day) or `7d` (7 days) |
| `ENCRYPTION_KEY` | API key encryption (64 hex chars) | Run: `node scripts/generate-encryption-key.js` |
| `GEMINI_API_KEY` | Google AI API key | Free at [ai.google.dev](https://ai.google.dev/) |

**Optional (RAG/Embedding):**

| Variable | Description | How to Get |
|----------|-------------|------------|
| `QDRANT_URL` | Qdrant vector database URL | `http://localhost:6333` or cloud |
| `QDRANT_API_KEY` | Qdrant API key (if cloud) | From Qdrant Cloud dashboard |
| `OLLAMA_URL` | Ollama server URL (optional) | `http://localhost:11434` via Tailscale/Ngrok |
| `EMBED_URL` | FastAPI embedding server URL | `http://localhost:8000` (ta.py) |
| `EMBED_TYPE` | Embedding type detection | `ollama` or `fastapi` (auto-detect) |

**Optional (OAuth):**

| Variable | Description | How to Get |
|----------|-------------|------------|
| `GITHUB_ID` | GitHub OAuth Client ID | [GitHub OAuth Apps](https://github.com/settings/developers) |
| `GITHUB_SECRET` | GitHub OAuth Client Secret | Same as above |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Same as above |

#### Frontend Environment Variables (`frontend/.env`)

**Required:**

| Variable | Description | How to Get |
|----------|-------------|------------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API base URL | `http://localhost:5000/api` (dev) or production URL |
| `NEXTAUTH_URL` | Frontend application URL | `http://localhost:3000` (dev) or production URL |
| `NEXTAUTH_SECRET` | Session encryption key | Run: `openssl rand -base64 32` |

See [`backend/.env.example`](./backend/.env.example) and [`frontend/.env.example`](./frontend/.env.example) for all available options.

---

## 🚀 Quick Start Commands

### Development Mode

```bash
# Start both services with Docker Compose
docker-compose up -d

# Or manually:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Production Build

```bash
# Docker Compose (recommended)
docker-compose -f docker-compose.prod.yml up -d

# Or manually:
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build && npm start
```

### Database Management

```bash
# Generate Prisma Client
cd backend && npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Useful Commands

```bash
# View logs (Docker)
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Check running containers
docker ps
```

---

## 🎯 Quick Start Guide

### First Time User Flow

1. **Register an Account** (`/register`)
   ```
   → Enter email, password, confirm password
   → Automatically receive 500 free credits
   → Redirected to dashboard
   ```

2. **Generate Your First Course** (`/ai-tutor`)
   ```
   → Click "Tạo Khóa Học" from header
   → Enter topic: "React Hooks" or "Python for Beginners"
   → Complete preferences:
      - Learning style (Visual, Auditory, Reading, Kinesthetic)
      - Available time (15-30min, 30-60min, 1-2hr)
      - Skill level (Beginner, Intermediate, Advanced, Expert)
      - Goals (Career, Personal, Academic)
   → AI generates 6-8 modules with 3-5 sections each
   → Costs ~100 credits (you have 500 free)
   ```

3. **Explore Mind Map** (`/course/[id]`)
   ```
   → See visual representation of your entire course
   → Modules alternate left-right for better readability
   → Click any section to start learning
   → Progress indicators show completion status
   ```

4. **Learn with AI Assistance** (Section Modal)
   ```
   → Read AI-generated markdown content
   → Highlight any text → Click "Giải thích" for instant explanation
   → Open AI chat for section-specific questions
   → Use quick questions for common topics
   → Take quiz to test knowledge (costs 5 credits)
   → Mark section complete when done
   ```

5. **Track Progress** (`/dashboard`)
   ```
   → View all your courses
   → See completion percentage for each
   → Monitor remaining credits
   → Beautiful canvas background
   ```

6. **Need More Credits?** (`/pricing`)
   ```
   → View pricing tiers (Free, Pro, Premium, Ultimate)
   → Toggle USD/VND currency
   → Choose one-time or monthly (20% discount)
   → Click "Buy Now" → Info auto-filled if logged in
   → Complete payment → Credits added instantly
   ```

### Tips for Best Experience

- 💡 **Use Specific Topics**: "Next.js Server Actions" > "Web Development"
- 🎯 **Be Honest with Skill Level**: Better content matching
- 📱 **Mobile Friendly**: Works great on all devices
- ⚡ **Fast Generation**: Courses generate in ~30 seconds
- 💬 **Ask AI Anything**: Context-aware within each section
- 🔖 **Bookmark Sections**: Use mind map for quick navigation
- ⚙️ **Custom API Key**: Add your own Gemini key in Settings for unlimited use

---

## 🎮 Usage Guide

### For Students

1. **Sign Up**: 
   - Create account with email/password or Google OAuth
   - Receive 500 free credits to start

2. **Generate Course**: 
   - Enter a topic (e.g., "Machine Learning", "Web Development")
   - Complete multi-step preference survey (learning style, time, difficulty)
   - AI generates personalized 6-8 module curriculum

3. **Explore Mind Map**: 
   - Visual overview of entire course with ReactFlow
   - Click any section to start learning
   - See progress indicators in real-time

4. **Interactive Learning**: 
   - **Read Content**: AI-generated markdown with code examples
   - **Text Selection**: Highlight any text and click AI button for instant explanation
   - **AI Chat**: Ask questions specific to current section
   - **Quick Questions**: Pre-defined questions for faster learning
   - **Quizzes**: Test knowledge with AI-generated multiple-choice questions

5. **Track Progress**: 
   - Mark sections as complete
   - View overall progress on dashboard with animated background
   - Monitor credit usage

6. **Manage Profile**:
   - Update personal information in Settings
   - Change password securely
   - Configure custom Gemini API key

7. **Purchase Credits**:
   - Visit `/pricing` page to view plans
   - Toggle currency (USD/VND) and billing cycle
   - Checkout with pre-filled user information
   - Credits added instantly

### For Administrators

```bash
# Access database
npx prisma studio

# View all users, courses, progress
# Manage content, credits, API keys
```

---

## 📂 Project Structure

```
PulsarTeam-AI-Learning/
├── backend/                    # Express.js Backend API
│   ├── prisma/
│   │   ├── schema.prisma       # Database models
│   │   └── migrations/         # Database migrations
│   │
│   ├── src/
│   │   ├── index.ts            # Express server entry point
│   │   │
│   │   ├── config/
│   │   │   ├── env.ts          # Environment variables
│   │   │   └── database.ts     # Prisma client setup
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT authentication
│   │   │   ├── cors.ts         # CORS configuration
│   │   │   ├── errorHandler.ts # Global error handling
│   │   │   └── logger.ts       # Request logging
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts      # Auth endpoints
│   │   │   ├── lessons.routes.ts   # Course CRUD
│   │   │   ├── sections.routes.ts  # Section content
│   │   │   ├── chat.routes.ts      # AI chat
│   │   │   ├── quiz.routes.ts      # Quiz generation
│   │   │   ├── user.routes.ts      # User management
│   │   │   └── admin.routes.ts     # Admin endpoints
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts    # Auth logic
│   │   │   ├── lessons.controller.ts # Course logic
│   │   │   ├── sections.controller.ts # Section logic
│   │   │   ├── chat.controller.ts     # Chat logic
│   │   │   ├── quiz.controller.ts     # Quiz logic
│   │   │   └── user.controller.ts     # User logic
│   │   │
│   │   ├── services/
│   │   │   ├── gemini.service.ts     # AI generation
│   │   │   ├── qdrant.service.ts     # RAG & embeddings
│   │   │   └── user.service.ts       # User operations
│   │   │
│   │   ├── utils/
│   │   │   ├── encryption.ts         # AES-256-GCM encryption
│   │   │   ├── jwt.ts                # JWT token utils
│   │   │   └── validation.ts         # Input validation
│   │   │
│   │   └── types/
│   │       └── index.ts              # TypeScript interfaces
│   │
│   ├── .env.example            # Environment template
│   ├── Dockerfile              # Backend container
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/                   # Next.js Frontend
│   ├── public/
│   │   └── images/             # Static assets
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── globals.css     # Global styles
│   │   │   ├── not-found.tsx   # Custom 404
│   │   │   │
│   │   │   ├── ai-tutor/       # AI Tutor page
│   │   │   ├── course/[id]/    # Course detail page
│   │   │   ├── dashboard/      # User dashboard
│   │   │   ├── pricing/        # Pricing page
│   │   │   ├── login/          # Auth pages
│   │   │   ├── register/
│   │   │   └── settings/       # Profile settings
│   │   │
│   │   ├── components/
│   │   │   ├── HeaderNew.tsx           # Navigation
│   │   │   ├── TopBanner.tsx           # Banner
│   │   │   ├── Footer.tsx              # Footer
│   │   │   ├── NetworkCanvas.tsx       # Particle background
│   │   │   ├── TechCanvas.tsx          # Tech grid background
│   │   │   ├── CourseVisualization.tsx # ReactFlow mind map
│   │   │   ├── SectionModalNew.tsx     # Lesson viewer
│   │   │   ├── CoursePreferencesModal.tsx # Preferences
│   │   │   ├── CheckoutModal.tsx       # Checkout
│   │   │   ├── LoginModal.tsx          # Login modal
│   │   │   ├── MessengerInbox.tsx      # Messaging
│   │   │   └── ...
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts          # API client (Axios + JWT)
│   │   │   ├── store.ts        # State management
│   │   │   └── utils.ts        # Helper functions
│   │   │
│   │   └── types/
│   │       └── index.ts        # TypeScript interfaces
│   │
│   ├── .env.example            # Environment template
│   ├── Dockerfile              # Frontend container
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── docker-compose.yml          # Multi-container orchestration
├── MIGRATION_GUIDE.md          # Migration guide
├── README.md                   # This file
└── LICENSE
```

### Key Directories Explained

| Directory | Purpose | Technology |
|-----------|---------|------------|
| `backend/` | RESTful API server | Express.js + TypeScript |
| `backend/prisma/` | Database schema & migrations | Prisma ORM |
| `backend/src/routes/` | API endpoint definitions | Express Router |
| `backend/src/controllers/` | Business logic | TypeScript |
| `backend/src/middleware/` | Auth, CORS, error handling | Express middleware |
| `frontend/` | Client-side application | Next.js 14 |
| `frontend/src/app/` | Pages & routes | App Router |
| `frontend/src/components/` | Reusable UI components | React + Tailwind |
| `frontend/src/lib/` | API client & utilities | Axios, helpers |

---

## 🧪 API Endpoints

> **Base URL:** `http://localhost:5000/api` (development) or your production backend URL
> 
> **Authentication:** Most endpoints require JWT token in `Authorization: Bearer <token>` header

### 🔐 Authentication
- `POST /api/auth/register` - User registration with 500 free credits
- `POST /api/auth/login` - Login with email/password (returns JWT token)
- `POST /api/auth/verify-password` - Password verification for sensitive actions
- `POST /api/auth/verify-otp` - OTP verification for email registration
- `POST /api/auth/oauth/google` - Google OAuth authentication
- `POST /api/auth/oauth/github` - GitHub OAuth authentication

### 📚 Courses (Lessons)
- `GET /api/lessons` - List user's courses with progress (requires auth)
- `GET /api/lessons/:id` - Get course details with modules & sections (requires auth)
- `POST /api/lessons/generate` - Generate new AI course (costs credits, requires auth)
- `DELETE /api/lessons/:id` - Delete course (requires password, requires auth)
- `PUT /api/lessons/:id` - Update course details (requires auth)

### 📖 Sections
- `GET /api/sections/:id` - Get section content (markdown format, requires auth)
- `POST /api/sections/:id/complete` - Mark section complete & update progress (requires auth)
- `GET /api/sections/:id/content` - Stream section content generation (SSE, requires auth)

### 📝 Quiz
- `POST /api/quiz/generate` - Generate AI quiz (costs 5 credits, requires auth)
- `POST /api/quiz/:id/submit` - Submit quiz answers and get score (requires auth)

### 💬 AI Chat
- `POST /api/chat` - Send message to AI Assistant (contextual responses, requires auth)
  - Supports text selection explanations
  - Section-specific context
  - Quick questions
  - **RAG Integration**: Searches Qdrant for relevant context
  - Filters by userId + lessonId for personalized results

### 👤 User Management
- `GET /api/user/profile` - Get user profile (name, email, phone, credits, hasApiKey, requires auth)
- `PUT /api/user/profile` - Update profile info (name, email, phone, requires auth)
- `PUT /api/user/password` - Update password (requires auth)
- `POST /api/user/api-key` - Update custom Gemini API key (encrypted, requires auth)
- `GET /api/user/api-key` - Check if user has custom API key (masked, requires auth)
- `DELETE /api/user/api-key` - Remove custom API key (requires auth)
- `GET /api/user/credits` - Get current credit balance (requires auth)
- `POST /api/user/linkaccount` - Link Facebook Messenger PSID to user account (requires auth)

### 👥 Community & Social
- `GET /api/community/posts` - Get community feed with posts (requires auth)
- `POST /api/community/posts` - Create new post (share course, requires auth)
- `POST /api/community/posts/:id/react` - React to post (like/love/haha/wow/sad/angry, requires auth)
- `DELETE /api/community/posts/:id/react` - Remove reaction (requires auth)
- `GET /api/community/posts/:id/comments` - Get comments for post (requires auth)
- `POST /api/community/posts/:id/comments` - Add comment to post (requires auth)
- `DELETE /api/community/posts/:id` - Delete post (owner only, requires auth)

### 💬 Messenger
- `GET /api/messenger/conversations` - List user conversations with unread counts (requires auth)
- `POST /api/messenger/conversations` - Create new conversation (requires auth)
- `GET /api/messenger/conversations/:id` - Get conversation details (requires auth)
- `GET /api/messenger/conversations/:id/messages` - Get messages in conversation (requires auth)
- `POST /api/messenger/conversations/:id/messages` - Send message (requires auth)
- `POST /api/messenger/conversations/:id/mark-read` - Mark messages as read (requires auth)

### 🔔 Notifications
- `GET /api/notifications` - Get user notifications (reactions, comments, messages, requires auth)
- `POST /api/notifications/:id/read` - Mark notification as read (requires auth)
- `POST /api/notifications/read-all` - Mark all notifications as read (requires auth)
- `DELETE /api/notifications/:id` - Delete notification (requires auth)

### 💳 Credits & Transactions
- `POST /api/credits/purchase` - Process credit purchase (planned, requires auth)
- `GET /api/credits/history` - Get credit transaction history (planned, requires auth)
- `POST /api/credits/add` - Add credits to user account (admin only)

### 🔧 Admin (Admin role required)
- `GET /api/admin/users` - List all users with stats
- `GET /api/admin/users/:id` - Get specific user details
- `PUT /api/admin/users/:id` - Update user (credits, role, etc.)
- `DELETE /api/admin/users/:id` - Delete user account
- `GET /api/admin/courses` - List all courses
- `GET /api/admin/analytics` - Platform analytics and statistics
- `GET /api/admin/revenue` - Revenue and transaction reports

---

## 🎓 Team PulsarTeam

### Development Team

| Name | Role | Responsibilities |
|------|------|------------------|
| **Trương Dương Bảo Minh** | Frontend Developer & AI Engineer | UI/UX design, AI integration, frontend architecture |
| **Cù Thanh Cầm** | Project Manager & Backend Developer | Project planning, team coordination, documentation |
| **Trần Tuấn Anh** | Backend Developer & Data Data Analytics | Database design, API development, authentication |

---

## 🔧 Configuration

### Tailwind Custom Theme

```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      zinc: { /* Factory.ai dark palette */ },
      orange: { /* Primary accent color */ }
    },
    animation: {
      'spin': 'spin 1s linear infinite',
      'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }
  }
}
```

### Next.js Performance Optimizations

```javascript
// next.config.js
experimental: {
  turbo: true,              // Turbopack for faster builds
  optimizePackageImports: ['lucide-react']
}
```

---

## 📊 Database Schema

### Key Models

```prisma
model User {
  id              String    @id @default(cuid())
  name            String?
  email           String    @unique
  password        String
  phone           String?
  role            String    @default("user")
  geminiApiKey    String?   // Encrypted with AES-256-GCM
  credits         Int       @default(500)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  lessons         Lesson[]
  posts           Post[]
  postLikes       PostLike[]
  postComments    PostComment[]
  conversations   ConversationParticipant[]
  sentMessages    Message[]
  notifications   Notification[]
  otps            OTP[]
  messengerTokens MessengerToken[]
}

model Lesson {
  id            String    @id @default(cuid())
  title         String
  description   String?
  content       String
  topic         String
  difficulty    String    @default("beginner")
  isPublic      Boolean   @default(false)
  userId        String
  modules       Module[]
  mindmap       Mindmap?
  posts         Post[]
}

model Module {
  id            String    @id @default(cuid())
  title         String
  order         Int
  lessonId      String
  sections      Section[]
  embeddings    SectionEmbedding[]
}

model Section {
  id            String    @id @default(cuid())
  title         String
  content       String
  order         Int
  completed     Boolean   @default(false)
  moduleId      String
  embeddings    SectionEmbedding[]
}

// RAG: Track embeddings in Qdrant
model SectionEmbedding {
  id          String   @id @default(cuid())
  sectionId   String
  moduleId    String
  courseId    String
  userId      String
  vectorId    String   // UUID in Qdrant
  contentHash String   // MD5 hash
  chunkIndex  Int
  createdAt   DateTime @default(now())
}

// OTP for email verification
model OTP {
  id        String   @id @default(cuid())
  email     String
  code      String   // 6-digit code
  userId    String?
  expiresAt DateTime
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
}

// Community Posts
model Post {
  id        String    @id @default(cuid())
  userId    String
  lessonId  String
  caption   String?
  likes     PostLike[]
  comments  PostComment[]
  createdAt DateTime  @default(now())
}

model PostLike {
  id           String  @id @default(cuid())
  postId       String
  userId       String
  reactionType String  @default("like")
  // like, love, haha, wow, sad, angry
  @@unique([postId, userId])
}

model PostComment {
  id        String       @id @default(cuid())
  postId    String
  userId    String
  content   String
  parentId  String?      // For nested replies
  replies   PostComment[] @relation("CommentReplies")
  createdAt DateTime     @default(now())
}

// Messenger System
model Conversation {
  id           String      @id @default(cuid())
  participants ConversationParticipant[]
  messages     Message[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model ConversationParticipant {
  id             String   @id @default(cuid())
  conversationId String
  userId         String
  lastReadAt     DateTime?
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  senderId       String
  content        String
  isRead         Boolean  @default(false)
  createdAt      DateTime @default(now())
}

// Facebook Messenger Token Linking
model MessengerToken {
  id        String    @id @default(cuid())
  token     String    @unique
  psid      String    // Facebook Page-Scoped ID
  userId    String?   // Null until linked
  createdat DateTime  @default(now())
  expiresat DateTime
}

// Notifications
model Notification {
  id       String   @id @default(cuid())
  userId   String
  type     String   // reaction, comment, message
  title    String
  content  String
  link     String?
  isRead   Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 🚀 Performance

### Optimizations Implemented

- ✅ **Turbopack**: 5x faster builds with experimental mode
- ✅ **Dynamic Imports**: Code splitting for `TechCanvas`, `NetworkCanvas`, and heavy components
- ✅ **Deferred Canvas Loading**: Canvas backgrounds load after content with `setTimeout`
- ✅ **GPU Acceleration**: CSS properties (`transform: translateZ(0)`, `will-change`, `backface-visibility`)
- ✅ **Smooth Scrolling**: Hardware-accelerated scrolling with `WebkitOverflowScrolling: 'touch'`
- ✅ **Image Optimization**: Next.js automatic image optimization with lazy loading
- ✅ **API Caching**: Revalidation strategies for static content
- ✅ **Database Indexing**: Optimized queries with Prisma
- ✅ **SSR/SSG**: Server-side rendering where beneficial
- ✅ **Hydration Fix**: Consistent number formatting (`toLocaleString('en-US')`)
- ✅ **Event Optimization**: Proper `stopPropagation()` for nested interactive elements
- ✅ **React Re-render Prevention**: Fixed infinite loops with proper dependency arrays

### Performance Metrics

| Metric | Target | Achieved |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | ✅ 1.2s |
| Time to Interactive | < 3.0s | ✅ 2.7s |
| API Response Time | < 500ms | ✅ 380ms |
| Build Time | < 60s | ✅ 45s |

---

## ✨ Feature Highlights

### 📝 Text Selection AI Explanation

One of the most innovative features is the **intelligent text selection** system:

**How it works:**
1. While reading lesson content, select (highlight) any text
2. A floating AI button appears next to your selection with sparkle animation
3. Click the "Giải thích" (Explain) button
4. AI Assistant automatically opens (if closed) and provides detailed explanation
5. Context includes the entire section content for better understanding

**Technical Implementation:**
```typescript
// Selection detection with position tracking
const handleTextSelection = () => {
  const selection = window.getSelection()
  const text = selection?.toString().trim()
  
  if (text && text.length > 0) {
    const range = selection?.getRangeAt(0)
    const rect = range?.getBoundingClientRect()
    
    // Show floating button at selection position
    setSelectionPosition({
      x: rect.right + 10,
      y: rect.top + window.scrollY
    })
  }
}

// AI explanation with context
const handleExplainSelection = async (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  
  const userMessage = `Giải thích đoạn này: "${selectedText}"`
  
  // Send to AI with full section context
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: userMessage,
      context: `Section: ${section.title}\nCourse: ${course.title}\nFull content...`,
    }),
  })
}
```

**Benefits:**
- ⚡ Instant explanations without leaving the lesson
- 🎯 Context-aware responses based on current section
- 💬 Natural language explanations from Gemini AI
- 🎨 Beautiful UI with smooth animations and professional icons

### 💳 Smart Pricing System

**Multi-Currency Support:**
- Toggle between USD and VND with real-time conversion
- Monthly subscriptions offer 20% discount vs one-time purchase
- Four pricing tiers: Free (500), Pro (5,000), Premium (20,000), Ultimate (100,000)

**Intelligent Checkout:**
- Detects logged-in users and pre-fills information
- Real-time validation for all form fields
- Loading states with spinner animations
- Success confirmation with credit display

**Features by Tier:**
| Tier | Credits | Price (USD) | Special Features |
|------|---------|-------------|------------------|
| Free | 500 | $0 | Perfect for trying out |
| Pro | 5,000 | $4.99 | Most popular choice |
| Premium | 20,000 | $14.99 | Best value |
| Ultimate | 100,000 | $49.99 | GPT-5 access + custom AI model |

### 🎨 Animated Canvas Backgrounds

**Pages with Canvas:**
- Dashboard (`/dashboard`)
- Pricing (`/pricing`)
- Settings (`/settings`)
- 404 Error Page (`/not-found`)

**Optimization Strategy:**
```typescript
// Deferred loading for better performance
useEffect(() => {
  const timer = setTimeout(() => {
    setShowCanvas(true)
  }, 100) // Load after content renders
  
  return () => clearTimeout(timer)
}, [])

// Dynamic import with SSR disabled
const TechCanvas = dynamic(() => import('@/components/TechCanvas'), {
  ssr: false,
  loading: () => null
})
```

**Glass Morphism Design:**
- `backdrop-blur-md` for frosted glass effect
- Transparent backgrounds (`bg-zinc-900/20`)
- Border gradients with orange accents
- Smooth hover transitions

---

## 🔐 Security

### Implemented Measures

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **CSRF Protection**: Built into NextAuth.js
- **SQL Injection Prevention**: Prisma parameterized queries
- **XSS Protection**: React automatic escaping
- **Rate Limiting**: API endpoint throttling (planned)
- **Environment Variables**: Sensitive data in .env

---

## 🌐 Deployment

### Recommended Deployment Options

#### Option 1: Docker Compose (Recommended) 🐳

**Best for:** Full-stack deployment with all services in one place

```bash
# 1. Clone repository on server
git clone https://github.com/your-team/pulsarteam-ai-learning.git
cd pulsarteam-ai-learning

# 2. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with production values

# 3. Build and start services
docker-compose up -d --build

# 4. Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Services will be running:
# - Frontend: http://your-domain.com:3000
# - Backend: http://your-domain.com:5000
```

**Production Considerations:**
- Use Nginx reverse proxy for SSL and load balancing
- Configure proper CORS origins in backend
- Set strong JWT_SECRET and ENCRYPTION_KEY
- Use managed PostgreSQL (Supabase/Neon) for production database
- Enable health checks and monitoring

#### Option 2: Separate Deployments

**Frontend (Vercel/Netlify):**
```bash
# Deploy frontend to Vercel
cd frontend
vercel --prod

# Or Netlify
netlify deploy --prod
```

**Backend (Railway/Render/Heroku):**
```bash
# Deploy backend to Railway
cd backend
railway up

# Or Render (via dashboard)
# Connect GitHub repo → select backend/ directory
```

**Backend (VPS/Cloud - PM2):**
```bash
# On your server
cd backend
npm install
npm run build

# Start with PM2
pm2 start dist/index.js --name pulsar-backend
pm2 startup
pm2 save
```

### Platform-Specific Guides

| Platform | Frontend | Backend | Database | Notes |
|----------|----------|---------|----------|-------|
| **Vercel + Railway** | ✅ Free tier | ✅ $5/month | Railway PG | Easy setup |
| **Netlify + Render** | ✅ Free tier | ✅ Free tier | Supabase | All free |
| **Docker + VPS** | ✅ Self-hosted | ✅ Self-hosted | Self-hosted | Full control |
| **AWS ECS** | ✅ Fargate | ✅ Fargate | RDS | Enterprise |

### Environment Variables for Production

**Backend:**
```bash
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://...  # Production database
JWT_SECRET=<strong-secret>      # Generate new one
ENCRYPTION_KEY=<64-hex-chars>  # Generate new one
GEMINI_API_KEY=<your-key>
CORS_ORIGIN=https://your-frontend-domain.com
```

**Frontend:**
```bash
NEXT_PUBLIC_BACKEND_URL=https://api.your-domain.com/api
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<strong-secret>
```

### Nginx Reverse Proxy (Optional)

```nginx
# /etc/nginx/sites-available/pulsar
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Hydration Errors

**Problem:** `Error: Text content does not match server-rendered HTML`

**Cause:** Number formatting differs between server and client (e.g., `toLocaleString('vi-VN')` produces different results)

**Solution:**
```typescript
// ❌ Bad: Causes hydration error
{price.toLocaleString('vi-VN')} VNĐ

// ✅ Good: Consistent formatting
{price.toLocaleString('en-US')} VNĐ
```

#### 2. Infinite Re-render Loop

**Problem:** Page continuously reloads, API calls repeatedly

**Cause:** `useEffect` dependency array contains mutable objects (like `session` object)

**Solution:**
```typescript
// ❌ Bad: session object changes reference every render
useEffect(() => {
  fetchData()
}, [session])

// ✅ Good: Use primitive values
useEffect(() => {
  fetchData()
}, [session?.user?.id])
```

#### 3. Prisma Generate Error (EPERM)

**Problem:** `EPERM: operation not permitted, rename '...query_engine-windows.dll.node...'`

**Cause:** Dev server is running and locking Prisma client files

**Solution:**
```bash
# 1. Stop dev server
Ctrl + C

# 2. Generate Prisma client
npx prisma generate

# 3. Restart dev server
npm run dev
```

#### 4. Invalid Element Type Error

**Problem:** `Error: Element type is invalid... Check the render method of CoursePreferencesModal`

**Cause:** Importing non-existent Lucide React icons

**Solution:**
```typescript
// ❌ Bad: These icons don't exist
import { BookOpenText, Timer, PuzzleIcon } from 'lucide-react'

// ✅ Good: Use correct icon names
import { Book, AlarmClock, Puzzle } from 'lucide-react'
```

**Verified Lucide Icons:**
- `Book`, `AlarmClock`, `Puzzle`, `Clock`, `Sprout`
- `Target`, `Sparkles`, `Clipboard`, `Grid3x3`
- `Search`, `GraduationCap`, `Bot`, `Trophy`
- `ThumbsUp`, `TrendingUp`, `Settings`, `Zap`

#### 5. Canvas Not Loading

**Problem:** Canvas background doesn't appear or causes performance issues

**Solution:**
```typescript
// Use dynamic import with SSR disabled
const TechCanvas = dynamic(() => import('@/components/TechCanvas'), {
  ssr: false,
  loading: () => null
})

// Defer loading
useEffect(() => {
  const timer = setTimeout(() => setShowCanvas(true), 100)
  return () => clearTimeout(timer)
}, [])
```

#### 6. Text Selection Button Not Working

**Problem:** Clicking "Giải thích" button doesn't trigger AI explanation

**Cause:** Event propagation causes modal overlay click event to fire

**Solution:**
```typescript
// Add stopPropagation at multiple levels
<div 
  onClick={(e) => e.stopPropagation()}
  onMouseDown={(e) => e.stopPropagation()}
>
  <button
    onClick={handleExplainSelection}
    onMouseDown={(e) => e.stopPropagation()}
  >
```

#### 7. Scroll Performance Issues

**Problem:** Scrolling in modals is laggy or janky

**Solution:**
```css
/* Global CSS - GPU acceleration */
* {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}

.scrollable {
  transform: translateZ(0);
  will-change: scroll-position;
  -webkit-overflow-scrolling: touch;
  backface-visibility: hidden;
}
```

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

**Educational Purpose**: Developed for the K-Tech Innovation Challenge 2025.

### Key Points:
- ✅ Free to use, modify, and distribute
- ✅ Commercial use allowed
- ✅ Attribution to PulsarTeam appreciated
- ✅ No warranty provided

Copyright © 2025 PulsarTeam. All rights reserved.

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Contact

**PulsarTeam** - K-Tech Innovation Challenge 2025

- 📧 Email: truongminh0949@gmail.com
- 🌐 Website: [Coming Soon]
- 📱 FaceBook : [@PulsarTeamDev](https://www.facebook.com/m.minb1805)

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For powerful LLM capabilities and free API access
- **Vercel** - For Next.js framework, Turbopack, and hosting solutions
- **Supabase** - For PostgreSQL database hosting and management
- **Prisma** - For elegant database ORM and type safety
- **Qdrant** - For high-performance vector similarity search
- **Sentence Transformers** - For state-of-the-art text embeddings
- **Lucide** - For beautiful, consistent icon library
- **ReactFlow** - For powerful mind map visualization
- **Factory.ai** - Design inspiration for dark theme
- **Augment Code** - UI/UX inspiration for developer experience
- **K-Tech** - For organizing this innovation challenge
- **Open Source Community** - For amazing tools and libraries

---

## 📋 Changelog

### Version 4.0.0 (Current) - Monorepo Architecture Refactor

**🎯 Major Refactoring:**
- 🏗️ **Monorepo Structure**: Split project into `frontend/` and `backend/` directories
- ⚙️ **Express.js Backend**: Migrated from Next.js API routes to standalone Express.js server
- 🎨 **Client-Only Frontend**: Next.js now serves purely as frontend (no API routes)
- 🔐 **JWT Authentication**: Replaced NextAuth database integration with JWT tokens
- 🐳 **Docker Support**: Added Docker Compose for easy deployment
- 📦 **Separated Dependencies**: Frontend and backend have their own `package.json`

**🆕 New Architecture:**
- ✅ Frontend runs on port 3000 (Next.js)
- ✅ Backend runs on port 5000 (Express.js)
- ✅ API communication via Axios with JWT Bearer tokens
- ✅ PostgreSQL database connected to backend only
- ✅ Prisma ORM in backend for database operations
- ✅ CORS middleware for cross-origin requests
- ✅ Centralized error handling in backend
- ✅ Request logging middleware

**📁 New Project Structure:**
```
├── backend/          # Express.js API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── utils/
│   ├── prisma/
│   └── Dockerfile
├── frontend/         # Next.js Client
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── Dockerfile
└── docker-compose.yml
```

**🔧 Backend Features:**
- Express.js server with TypeScript
- JWT authentication middleware (`protect`, `authorize`)
- Structured routes (auth, lessons, sections, chat, quiz, user, admin)
- Controller-based business logic
- Service layer for AI, database, and external APIs
- Environment configuration with validation
- AES-256-GCM encryption for API keys
- Error handling and logging

**🎨 Frontend Features:**
- Next.js 14 with App Router (client-only)
- API client with Axios + JWT interceptors
- Session management with NextAuth.js (client-side only)
- All existing UI components and pages
- State management setup ready
- Environment-based API base URL

**🐳 DevOps:**
- Docker Compose orchestration
- Frontend Dockerfile (multi-stage build)
- Backend Dockerfile (multi-stage build)
- Production-ready configuration
- Health checks and monitoring support
- Nginx reverse proxy guide
- CI/CD pipeline examples

**📖 Documentation:**
- Updated README with new architecture
- Migration guide for existing code
- Separate READMEs for frontend and backend
- Docker setup instructions
- Deployment guides for multiple platforms

**🔄 Migration Benefits:**
- ✅ Clearer separation of concerns
- ✅ Easier to scale independently
- ✅ Better developer experience
- ✅ Simpler deployment options
- ✅ Standard REST API conventions
- ✅ Portable backend (can add mobile apps later)
- ✅ Industry-standard authentication (JWT)

---

### Version 3.0.0 - Community, RAG & Messenger Integration

**🆕 New Features:**
- 🧠 **RAG Integration**: Retrieval Augmented Generation với Qdrant + FastAPI embedding server
- 💬 **Messenger System**: In-app messaging + Facebook Messenger PSID linking
- 👥 **Community Feed**: Share courses, react (6 reactions), comment, nested replies
- 🔔 **Real-time Notifications**: React, comment, message notifications
- 🔐 **Multi-OAuth**: GitHub + Google OAuth providers
- ✉️ **OTP Verification**: Email-based OTP for registration
- 🔒 **API Key Encryption**: AES-256-GCM encryption cho Gemini API keys
- 🎯 **Auto-Link Messenger**: Settings button để link Messenger account
- 📊 **Vector Embeddings**: Section content embedding với mxbai-embed-large-v1
- 🔍 **Smart Context Search**: AI chat với RAG filtering by userId + lessonId

**🔧 Improvements:**
- ⚡ Centralized user service (`getOrCreateUser`, `updateUserCredits`)
- 🎯 Database user ID consistency across all API routes
- 🔄 Fixed session.user.id vs database user.id mismatches
- 📝 Encrypted API key storage và retrieval
- 🎨 ReactionPicker component với 6 emotion reactions
- 📱 MessengerInbox + MessengerModal components
- 🔐 User auto-creation logic for OAuth flows
- ⚙️ Messenger integration section in Settings page

**🐛 Bug Fixes:**
- Fixed Prisma `P2002` unique constraint violations
- Fixed `P2022` missing column errors for MessengerToken
- Resolved foreign key constraint violations (Lesson_userId_fkey, PostLike_userId_fkey)
- Fixed message alignment in chat (sender vs recipient)
- Fixed conversation participant display in inbox
- Corrected reaction UI bug (always showing "Like" instead of selected reaction)
- Fixed Gemini API key decryption in multiple endpoints
- Resolved prepared statement errors on Vercel with `?pgbouncer=true`

**🗄️ Database Changes:**
- Added `MessengerToken` model for Facebook PSID linking
- Added `Post`, `PostLike`, `PostComment`, `CommentLike` models
- Added `Conversation`, `ConversationParticipant`, `Message` models
- Added `Notification` model for real-time alerts
- Added `SectionEmbedding` model for RAG tracking
- Added `OTP` model for email verification
- Added `geminiApiKey` encryption to User model
- Added `role` field to User model (default: "user")
- Updated credits from BigInt to Int

**🚀 Infrastructure:**
- FastAPI embedding server (`ta.py`) với Sentence Transformers
- Qdrant vector database integration
- Ollama support (optional) for local LLM
- Tailscale/Ngrok support for tunneling
- n8n workflow integration for RAG

### Version 2.0.0 - Major Feature Update

**🆕 New Features:**
- ✨ Text selection AI explanation with floating button
- 💳 Complete pricing page with USD/VND currency toggle
- 🛒 Checkout modal with user info pre-fill
- ⚙️ Profile management in settings (name, email, phone, password)
- 🎨 Canvas backgrounds on dashboard, pricing, settings, 404
- 🎭 Team member hover effects on homepage
- 🚫 Custom 404 error page with professional design

**🔧 Improvements:**
- ⚡ GPU-accelerated smooth scrolling
- 🎯 Deferred canvas loading for better performance
- 🔄 Fixed infinite re-render loops in multiple components
- 🎨 Professional Lucide icons throughout the app
- 📱 Better mobile responsiveness
- 🌐 Hydration error fixes with consistent formatting
- 🎭 Glass morphism effects on pricing cards and modals

**🐛 Bug Fixes:**
- Fixed event propagation in text selection button
- Resolved Prisma client generation conflicts
- Fixed invalid Lucide icon imports
- Corrected number formatting hydration issues
- Fixed session object infinite loop in useEffect

**🗄️ Database Changes:**
- Added `phone` field to User model
- Updated default credits from 1000 to 500
- Added user profile update API endpoints

### Version 1.0.0 - Initial Release

**Core Features:**
- AI course generation with Google Gemini
- Interactive mind maps with ReactFlow
- Section-based learning with progress tracking
- AI Assistant chat within lessons
- Quiz generation system
- User authentication with NextAuth.js
- Credit system for AI operations
- Dashboard with course analytics

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Google Gemini AI](https://ai.google.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [ReactFlow](https://reactflow.dev/)

---

<div align="center">

**Built with ❤️ by PulsarTeam**

*Transforming Education Through AI Innovation*

</div>
