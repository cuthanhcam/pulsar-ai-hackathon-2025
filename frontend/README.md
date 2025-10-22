# 🎨 PulsarTeam Frontend

Frontend cho PulsarTeam AI Learning Platform, xây dựng với Next.js 14 + React + TypeScript.

## 📋 Công Nghệ

- **Next.js 14** - React framework với App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client cho API calls
- **Zustand** - State management
- **ReactFlow** - Mind map visualization
- **React Markdown** - Markdown rendering
- **Lucide React** - Icon library
- **Recharts** - Charts và graphs

## 📁 Cấu Trúc Thư Mục

```
frontend/
├── public/                # Static assets
│   └── images/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Homepage
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── ai-tutor/
│   │   ├── course/
│   │   └── ...
│   ├── components/       # React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── CourseVisualization.tsx
│   │   ├── SectionModal.tsx
│   │   └── ...
│   └── lib/              # Utilities & helpers
│       ├── api.ts        # API client (Axios)
│       └── store.ts      # State management (Zustand)
├── .env.local.example    # Environment template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Setup

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Update `NEXT_PUBLIC_API_URL` to point to your backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Copy Components & Pages

Copy các components và pages từ project gốc:

```bash
# Copy components
cp -r ../src/components/* src/components/

# Copy app pages
cp -r ../src/app/* src/app/

# Copy public assets
cp -r ../public/* public/

# Copy globals.css
cp ../src/app/globals.css src/app/
```

### 4. Start Development Server

```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

## 📡 API Integration

Frontend giao tiếp với Backend thông qua REST API:

```typescript
import { api } from '@/lib/api'

// Example: Login
const response = await api.auth.login({
  email: 'user@example.com',
  password: 'password'
})

// Example: Get lessons
const lessons = await api.lessons.getAll()

// Example: Generate course
const course = await api.lessons.generate({
  topic: 'React Hooks',
  difficulty: 'intermediate'
})
```

## 🔐 Authentication

Frontend lưu JWT token trong localStorage và tự động thêm vào mọi API request:

```typescript
import { authHelpers } from '@/lib/api'

// Save token after login
authHelpers.setToken(token)

// Check if authenticated
const isAuth = authHelpers.isAuthenticated()

// Remove token (logout)
authHelpers.removeToken()
```

## 🎨 Styling

Project sử dụng Tailwind CSS với custom theme:

```typescript
// tailwind.config.ts
colors: {
  zinc: { 950: '#09090b' },
  orange: { 500: '#f97316', 600: '#ea580c' },
}
```

## 📝 Scripts

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm start       # Start production server
npm run lint    # Run ESLint
```

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` |

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Deploy to Vercel

```bash
vercel --prod
```

Make sure to set `NEXT_PUBLIC_API_URL` environment variable in Vercel dashboard.

## 📚 Key Features

- **AI Course Generation** - Generate personalized courses with AI
- **Mind Map Visualization** - Interactive course structure with ReactFlow
- **AI Assistant** - Chat with AI within lessons
- **Text Selection Explanation** - Highlight text and get instant AI explanations
- **Quiz System** - AI-generated quizzes for each section
- **Progress Tracking** - Track completion across all courses
- **Credit System** - Manage credits for AI operations
- **Profile Management** - Update profile and API keys

## 🎯 Migration Notes

Khi migrate từ project gốc:

1. ✅ Thay thế tất cả direct database calls bằng API calls
2. ✅ Remove NextAuth và sử dụng JWT tokens
3. ✅ Update import paths từ `@/lib/prisma` → `@/lib/api`
4. ✅ Remove server-side logic khỏi components
5. ✅ Use client-side state management (Zustand)

## 🤝 Contributing

Frontend này là client-only application. Tất cả business logic nằm ở Backend API.

## 📧 Contact

**PulsarTeam** - K-Tech Innovation Challenge 2025  
Email: truongminh0949@gmail.com

---

Built with ❤️ by PulsarTeam

