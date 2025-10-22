# 📖 Migration Guide - Refactoring to Frontend/Backend Architecture

Hướng dẫn chi tiết migrate project từ monolithic Next.js sang kiến trúc Frontend-Backend tách biệt.

---

## 📋 Overview

**Trước refactor:**
```
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   └── api/          # API routes trong Next.js
│   ├── components/
│   └── lib/
│       ├── prisma.ts      # Direct DB access
│       └── auth.ts        # NextAuth
```

**Sau refactor:**
```
├── backend/              # Express.js API Server
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   └── middleware/   # Auth, CORS, etc.
│   └── prisma/          # Database schema
│
├── frontend/            # Next.js Client App
│   ├── src/
│   │   ├── app/         # Pages only
│   │   ├── components/  # UI components
│   │   └── lib/
│   │       └── api.ts   # API client (Axios)
```

---

## 🔄 Step 1: Setup Backend

### 1.1. Copy Prisma Schema

```bash
# Copy database schema
cp -r prisma/ backend/

# Generate Prisma Client
cd backend
npm run prisma:generate
```

### 1.2. Copy Lib Files

Các file cần copy:
- `src/lib/encryption.ts` → `backend/src/utils/encryption.ts` ✅
- `src/lib/gemini.ts` → `backend/src/utils/gemini.ts` ✅
- `src/lib/security.ts` → `backend/src/utils/security.ts`

### 1.3. Migrate API Routes → Controllers

**Example: Auth API Route**

**Old (Next.js):** `src/app/api/auth/register/route.ts`
```typescript
export async function POST(req: Request) {
  const body = await req.json()
  // ... logic
  return NextResponse.json({ user })
}
```

**New (Express):** `backend/src/controllers/auth.controller.ts`
```typescript
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body
  // ... logic
  res.status(201).json({ user })
}
```

---

## 🎨 Step 2: Setup Frontend

### 2.1. Copy Components

```bash
# Copy all components
cp -r src/components/* frontend/src/components/

# Copy app pages
cp -r src/app/* frontend/src/app/

# Copy public assets
cp -r public/* frontend/public/

# Copy globals.css
cp src/app/globals.css frontend/src/app/
```

### 2.2. Update Imports

Tìm và thay thế trong toàn bộ frontend:

```typescript
// ❌ Old: Direct database access
import { prisma } from '@/lib/prisma'
const user = await prisma.user.findUnique(...)

// ✅ New: API calls
import { api } from '@/lib/api'
const { data } = await api.user.getProfile()
```

### 2.3. Remove Server-Side Code

Xóa hoặc comment các code server-only:

```typescript
// ❌ Remove these imports
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

// ✅ Use client-side alternatives
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
```

---

## 🔐 Step 3: Update Authentication

### 3.1. Replace NextAuth with JWT

**Old: NextAuth Session**
```typescript
'use client'
import { useSession } from 'next-auth/react'

export default function Component() {
  const { data: session } = useSession()
  const user = session?.user
  // ...
}
```

**New: Zustand Store + JWT**
```typescript
'use client'
import { useAuthStore } from '@/lib/store'
import { useEffect } from 'react'
import { api } from '@/lib/api'

export default function Component() {
  const { user, setUser } = useAuthStore()
  
  useEffect(() => {
    // Fetch user on mount
    api.auth.me().then(res => setUser(res.data.user))
  }, [])
  // ...
}
```

### 3.2. Update Login Flow

**Old: NextAuth signIn**
```typescript
import { signIn } from 'next-auth/react'

const handleLogin = async () => {
  await signIn('credentials', { email, password })
}
```

**New: API Login + Store Token**
```typescript
import { api, authHelpers } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const handleLogin = async () => {
  const response = await api.auth.login({ email, password })
  authHelpers.setToken(response.data.token)
  setUser(response.data.user)
  router.push('/dashboard')
}
```

---

## 📡 Step 4: Replace API Calls

### 4.1. Server Components → Client Components

**Old: Server Component với Direct DB Access**
```typescript
// src/app/dashboard/page.tsx
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

export default async function Dashboard() {
  const session = await getServerSession()
  const lessons = await prisma.lesson.findMany({
    where: { userId: session?.user?.id }
  })
  
  return <div>{/* render lessons */}</div>
}
```

**New: Client Component với API Calls**
```typescript
// frontend/src/app/dashboard/page.tsx
'use client'

import { api } from '@/lib/api'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    api.lessons.getAll()
      .then(res => setLessons(res.data.lessons))
      .finally(() => setLoading(false))
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return <div>{/* render lessons */}</div>
}
```

### 4.2. Common API Replacements

| Old (Direct DB) | New (API Call) |
|-----------------|----------------|
| `prisma.lesson.findMany()` | `api.lessons.getAll()` |
| `prisma.user.findUnique()` | `api.user.getProfile()` |
| `prisma.section.update()` | `api.sections.complete(id)` |
| Direct `genAI.generate()` | `api.lessons.generate()` |

---

## 🔧 Step 5: Environment Variables

### 5.1. Backend Environment

Create `backend/.env`:
```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Security
JWT_SECRET=your-jwt-secret-min-32-chars
ENCRYPTION_KEY=your-64-char-hex-key

# Server
PORT=5000
NODE_ENV=development

# AI
GEMINI_API_KEY=your-gemini-key

# CORS
FRONTEND_URL=http://localhost:3000
```

### 5.2. Frontend Environment

Create `frontend/.env.local`:
```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🧪 Step 6: Testing

### 6.1. Test Backend

```bash
cd backend
npm install
npm run dev

# Test API endpoint
curl http://localhost:5000/health
```

### 6.2. Test Frontend

```bash
cd frontend
npm install
npm run dev

# Visit http://localhost:3000
```

### 6.3. Test End-to-End

1. Register new user
2. Login
3. Generate course
4. View course details
5. Chat with AI
6. Complete section

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors

**Problem:** Frontend không thể gọi Backend API

**Solution:** Kiểm tra CORS config trong `backend/src/middleware/cors.ts`:
```typescript
const allowedOrigins = [
  'http://localhost:3000',  // Add your frontend URL
]
```

### Issue 2: Authentication Fails

**Problem:** Token không được gửi trong request

**Solution:** Kiểm tra API client interceptor:
```typescript
// frontend/src/lib/api.ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Issue 3: Database Connection Fails

**Problem:** Backend không kết nối được database

**Solution:** Kiểm tra DATABASE_URL và chạy migrations:
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

---

## 📝 Checklist

### Backend Setup
- [ ] Copy Prisma schema
- [ ] Install dependencies (`npm install`)
- [ ] Setup .env file
- [ ] Run migrations (`npm run prisma:migrate`)
- [ ] Start server (`npm run dev`)
- [ ] Test health endpoint

### Frontend Setup
- [ ] Copy components
- [ ] Copy pages
- [ ] Copy public assets
- [ ] Install dependencies (`npm install`)
- [ ] Setup .env.local file
- [ ] Update all API calls
- [ ] Remove NextAuth references
- [ ] Replace with JWT auth
- [ ] Start dev server (`npm run dev`)

### Final Testing
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads lessons
- [ ] Course generation works
- [ ] AI chat works
- [ ] Profile update works

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

**Backend (Railway/Render/Heroku):**
```bash
cd backend
npm run build
npm start
```

**Frontend (Vercel/Netlify):**
```bash
cd frontend
npm run build
# Set NEXT_PUBLIC_API_URL environment variable
```

---

## 📚 Additional Resources

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Docker Setup](./docker-compose.yml)
- [Main README](./README.md)

---

## 💡 Tips

1. **Start with Backend** - Đảm bảo API hoạt động trước
2. **Test với Postman** - Test API endpoints trước khi integrate
3. **Use TypeScript** - Giúp catch lỗi sớm
4. **Console logging** - Debug API calls với `console.log`
5. **Environment variables** - Không commit .env files

---

Built with ❤️ by PulsarTeam

