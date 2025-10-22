# 🚀 PulsarTeam Backend API

Backend API server cho PulsarTeam AI Learning Platform, xây dựng với Express.js + TypeScript + Prisma.

## 📋 Công Nghệ

- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **Prisma** - ORM cho PostgreSQL
- **JWT** - Authentication
- **Google Gemini AI** - Content generation
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📁 Cấu Trúc Thư Mục

```
backend/
├── prisma/                 # Prisma schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/            # Configuration files
│   │   ├── env.ts         # Environment validation
│   │   └── database.ts    # Prisma client
│   ├── controllers/       # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── lessons.controller.ts
│   │   ├── sections.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── quiz.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts        # JWT authentication
│   │   ├── cors.ts        # CORS configuration
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── routes/            # API routes
│   │   ├── auth.routes.ts
│   │   ├── lessons.routes.ts
│   │   ├── sections.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── quiz.routes.ts
│   │   ├── user.routes.ts
│   │   └── admin.routes.ts
│   ├── services/          # Business logic (to be added)
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── encryption.ts  # AES-256-GCM encryption
│   │   ├── gemini.ts      # Gemini AI helpers
│   │   └── jwt.ts         # JWT utilities
│   └── index.ts           # Main server file
├── .env.example           # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` và cập nhật các giá trị:

```bash
cp .env.example .env
```

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key cho JWT (min 32 chars)
- `ENCRYPTION_KEY` - 64-char hex key cho encryption
- `GEMINI_API_KEY` - Google Gemini API key (optional)
- `FRONTEND_URL` - Frontend URL cho CORS

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (optional)
npm run prisma:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5000`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-password` - Verify password
- `GET /api/auth/me` - Get current user

### Lessons/Courses

- `GET /api/lessons` - Get all user's lessons
- `GET /api/lessons/:id` - Get lesson details
- `POST /api/lessons/generate` - Generate new AI course
- `POST /api/lessons/clone` - Clone existing lesson
- `DELETE /api/lessons/:id/delete` - Delete lesson

### Sections

- `POST /api/sections/:id` - Get section content
- `POST /api/sections/:id/complete` - Mark section as complete

### AI Chat

- `POST /api/chat` - Chat with AI assistant

### Quiz

- `POST /api/quiz/generate` - Generate quiz
- `POST /api/quiz/submit` - Submit quiz answers

### User

- `GET /api/user/profile` - Get user profile
- `POST /api/user/update-profile` - Update profile
- `POST /api/user/update-api-key` - Update Gemini API key
- `GET /api/user/get-api-key` - Check if user has API key
- `GET /api/user/credits` - Get user credits

### Health Check

- `GET /health` - Server health status
- `GET /` - API info

## 🔐 Authentication

API sử dụng JWT để authentication. Sau khi login, include token trong header:

```
Authorization: Bearer <your-jwt-token>
```

## 🛡️ Security

- **JWT** - Secure authentication
- **Bcrypt** - Password hashing (10 rounds)
- **AES-256-GCM** - API key encryption
- **Helmet** - Security headers
- **CORS** - Controlled cross-origin access
- **Input validation** - Zod schema validation

## 📝 Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio GUI
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT secret key (min 32 chars) | Yes |
| `ENCRYPTION_KEY` | Encryption key (64-char hex) | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `OLLAMA_URL` | Ollama server URL | Optional |
| `QDRANT_URL` | Qdrant vector DB URL | Optional |

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Docker Deployment

```bash
# Build image
docker build -t pulsarteam-backend .

# Run container
docker run -p 5000:5000 --env-file .env pulsarteam-backend
```

## 📚 API Documentation

Full API documentation available at `/api/docs` (to be implemented with Swagger).

## 🤝 Contributing

1. Tất cả controllers placeholder sẽ được migrate từ Next.js API routes
2. Thêm validation schemas với Zod
3. Implement rate limiting
4. Add API documentation với Swagger/OpenAPI

## 📧 Contact

**PulsarTeam** - K-Tech Innovation Challenge 2025  
Email: truongminh0949@gmail.com

---

Built with ❤️ by PulsarTeam

