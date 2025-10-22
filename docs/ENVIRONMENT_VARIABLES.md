# 🔧 Environment Variables Guide

## 📋 Table of Contents
- [Backend Environment Variables](#backend-environment-variables)
- [Frontend Environment Variables](#frontend-environment-variables)
- [Quick Setup](#quick-setup)
- [Security Best Practices](#security-best-practices)

---

## 🔙 Backend Environment Variables

### Setup Instructions
```bash
cd backend
cp env.example .env
# Edit .env with your actual values
```

### Required Variables

| Variable | Description | Example | How to Get |
|----------|-------------|---------|------------|
| `NODE_ENV` | Environment mode | `development` | Set to `production` for production |
| `PORT` | Backend server port | `5000` | Any available port |
| `DATABASE_URL` | PostgreSQL connection (pooling) | `postgresql://user:pass@host/db?pgbouncer=true` | From your database provider |
| `JWT_SECRET` | JWT encryption key | Min 32 characters | Run: `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | API key encryption | 64 hex characters | Run: `node scripts/generate-encryption-key.js` |

### Optional but Recommended

#### Google Gemini AI
| Variable | Description | Default | How to Get |
|----------|-------------|---------|------------|
| `GEMINI_API_KEY` | Google AI API key | - | [Get free at ai.google.dev](https://ai.google.dev/) |
| `GEMINI_MODEL` | Model name | `gemini-1.5-flash` | Check available models at Google AI |
| `GEMINI_TEMPERATURE` | Response creativity (0.0-1.0) | `0.7` | Adjust based on needs |

#### CORS Configuration
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` | Production: `https://yourdomain.com` |
| `ALLOWED_ORIGINS` | Allowed CORS origins (comma-separated) | Uses `FRONTEND_URL` | `http://localhost:3000,https://app.com` |
| `CORS_MAX_AGE` | CORS cache duration (seconds) | `86400` | 24 hours |

#### Credit System
| Variable | Description | Default |
|----------|-------------|---------|
| `DEFAULT_CREDITS` | Credits for new users | `500` |
| `CREDIT_COST_COURSE_GENERATE` | Cost to generate a course | `100` |
| `CREDIT_COST_QUIZ_GENERATE` | Cost to generate a quiz | `5` |
| `CREDIT_COST_CHAT_MESSAGE` | Cost per chat message | `1` |
| `CREDIT_COST_SECTION_GENERATE` | Cost to generate a section | `10` |

#### JWT Configuration
| Variable | Description | Default | Format |
|----------|-------------|---------|--------|
| `JWT_EXPIRES_IN` | Access token expiration | `7d` | `1h`, `1d`, `7d`, `30d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `30d` | Should be longer than `JWT_EXPIRES_IN` |

#### Email (SMTP)
| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password | Your app password |
| `SMTP_FROM_NAME` | Sender name | `PulsarTeam AI` |
| `SMTP_FROM_EMAIL` | Sender email | `noreply@pulsarteam.com` |

#### Vector Database (RAG)
| Variable | Description | Example |
|----------|-------------|---------|
| `QDRANT_URL` | Qdrant server URL | `http://localhost:6333` |
| `QDRANT_API_KEY` | Qdrant API key (cloud) | Your API key |
| `QDRANT_COLLECTION` | Collection name | `pulsar_embeddings` |
| `EMBED_URL` | Embedding server URL | `http://localhost:8000` |
| `EMBED_TYPE` | Embedding type | `fastapi` or `ollama` |
| `EMBED_MODEL` | Embedding model | `mxbai-embed-large-v1` |

#### OAuth Providers
| Variable | Description | Where to Get |
|----------|-------------|-------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | [GitHub OAuth Apps](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret | Same as above |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | Same as above |

#### Performance & Limits
| Variable | Description | Default |
|----------|-------------|---------|
| `BODY_SIZE_LIMIT` | Max request body size | `10mb` |
| `API_TIMEOUT` | Request timeout (ms) | `30000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `60000` |
| `MAX_FILE_SIZE` | Max upload size | `5mb` |

#### Logging
| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `LOG_LEVEL` | Logging level | `info` | `error`, `warn`, `info`, `debug` |
| `ENABLE_REQUEST_LOGGING` | Log HTTP requests | `true` | `true` or `false` |
| `DEBUG` | Debug mode | `false` | `true` or `false` |
| `PRISMA_QUERY_LOG` | Log Prisma queries | `false` | `true` or `false` |

---

## 🎨 Frontend Environment Variables

### Setup Instructions
```bash
cd frontend
cp env.example .env.local
# Edit .env.local with your actual values
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000` |
| `NEXTAUTH_URL` | Frontend URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth encryption key | Run: `openssl rand -base64 32` |

### Optional Variables

#### API Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout (ms) | `30000` |

#### Feature Flags
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENABLE_COMMUNITY` | Enable community features | `true` |
| `NEXT_PUBLIC_ENABLE_MESSENGER` | Enable messaging | `true` |
| `NEXT_PUBLIC_ENABLE_AI_CHAT` | Enable AI chat | `true` |
| `NEXT_PUBLIC_ENABLE_QUIZ` | Enable quiz feature | `true` |

#### UI Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_DEFAULT_THEME` | UI theme | `dark` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Language | `vi` |
| `NEXT_PUBLIC_SHOW_ONBOARDING` | Show onboarding | `true` |
| `NEXT_PUBLIC_ENABLE_CANVAS` | Enable animated backgrounds | `true` |
| `NEXT_PUBLIC_CANVAS_PARTICLES` | Canvas particle count | `100` |
| `NEXT_PUBLIC_CANVAS_SPEED` | Canvas animation speed | `1` |

#### Credits & Purchase
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SHOW_CREDITS` | Show credit balance | `true` |
| `NEXT_PUBLIC_ENABLE_CREDIT_PURCHASE` | Enable credit purchase | `true` |

#### Toast Notifications
| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_TOAST_POSITION` | Toast position | `top-right` | `top-right`, `top-left`, `bottom-right`, `bottom-left` |
| `NEXT_PUBLIC_TOAST_DURATION` | Toast duration (ms) | `3000` | Any positive number |

#### SEO
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_NAME` | Site name | `PulsarTeam AI Learning` |
| `NEXT_PUBLIC_SITE_URL` | Site URL | `https://pulsarteam.com` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Site description | `AI-Powered Learning Platform` |

#### Analytics (Optional)
| Variable | Description | Where to Get |
|----------|-------------|-------------|
| `NEXT_PUBLIC_GA_TRACKING_ID` | Google Analytics ID | [Google Analytics](https://analytics.google.com/) |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Facebook Pixel ID | [Facebook Business](https://business.facebook.com/) |

---

## 🚀 Quick Setup

### Development Setup (Docker Compose)

1. **Copy environment templates:**
```bash
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env.local
```

2. **Generate secrets:**
```bash
# JWT Secret
openssl rand -base64 32

# Encryption Key
node scripts/generate-encryption-key.js
```

3. **Edit `.env` files with required values**

4. **Start services:**
```bash
docker-compose up -d
```

### Production Setup

1. **Set environment variables in your hosting platform:**
   - Vercel: Project Settings → Environment Variables
   - Railway: Project → Variables
   - Render: Dashboard → Environment
   - Docker: Use `.env` files or docker-compose environment

2. **Required production changes:**
```bash
# Backend
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com
FORCE_HTTPS=true
TRUST_PROXY=true

# Frontend
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXTAUTH_URL=https://your-frontend-domain.com
```

---

## 🔒 Security Best Practices

### 1. **Never Commit `.env` Files**
```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### 2. **Use Strong Secrets**
```bash
# Generate strong JWT secret (min 32 characters)
openssl rand -base64 32

# Generate encryption key (64 hex characters)
node scripts/generate-encryption-key.js
```

### 3. **Rotate Secrets Regularly**
- Change `JWT_SECRET` every 3-6 months
- Update `ENCRYPTION_KEY` if compromised
- Regenerate OAuth credentials annually

### 4. **Environment-Specific Values**
```bash
# Development
FRONTEND_URL=http://localhost:3000
DEBUG=true
LOG_LEVEL=debug

# Production
FRONTEND_URL=https://yourdomain.com
DEBUG=false
LOG_LEVEL=error
FORCE_HTTPS=true
```

### 5. **Validate Environment Variables**
The backend automatically validates all environment variables on startup using Zod schema. If any required variable is missing or invalid, the server will not start and will show detailed error messages.

### 6. **Use Platform Secret Management**
For production:
- **Vercel**: Use Vercel Environment Variables (encrypted at rest)
- **Railway**: Use Railway Variables (encrypted)
- **AWS**: Use AWS Secrets Manager
- **GCP**: Use Secret Manager
- **Azure**: Use Key Vault

---

## 📝 Example Configurations

### Minimal Development Setup
```bash
# backend/.env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/pulsar_dev
JWT_SECRET=your-32-character-secret-here-min
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
GEMINI_API_KEY=your-gemini-api-key
```

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### Full Production Setup
```bash
# backend/.env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://prod_user:prod_pass@prod-host:5432/pulsar_prod?pgbouncer=true
DIRECT_URL=postgresql://prod_user:prod_pass@prod-host:5432/pulsar_prod
JWT_SECRET=production-secret-min-32-chars-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
ENCRYPTION_KEY=production-encryption-key-64-hex-chars-here
GEMINI_API_KEY=production-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
FRONTEND_URL=https://pulsarteam.com
ALLOWED_ORIGINS=https://pulsarteam.com,https://www.pulsarteam.com
CORS_MAX_AGE=86400
FORCE_HTTPS=true
TRUST_PROXY=true
LOG_LEVEL=error
ENABLE_REQUEST_LOGGING=true
```

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://api.pulsarteam.com
NEXTAUTH_URL=https://pulsarteam.com
NEXTAUTH_SECRET=production-nextauth-secret
NEXT_PUBLIC_ENABLE_CANVAS=true
NEXT_PUBLIC_DEFAULT_THEME=dark
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## 🔍 Troubleshooting

### Server Won't Start
**Error:** "Environment validation failed"
- **Solution:** Check console output for specific missing/invalid variables
- Ensure all required variables are set in `.env`
- Verify JWT_SECRET is at least 32 characters
- Verify ENCRYPTION_KEY is exactly 64 hex characters

### CORS Errors
**Error:** "Origin not allowed by CORS"
- **Solution:** Add your frontend URL to `ALLOWED_ORIGINS`
```bash
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Database Connection Failed
**Error:** "Database connection failed"
- **Solution:** Verify `DATABASE_URL` format:
```bash
postgresql://username:password@host:port/database?pgbouncer=true
```

### Gemini API Errors
**Error:** "GEMINI_API_KEY is not configured"
- **Solution:** Get free API key at https://ai.google.dev/
- Add to backend `.env`: `GEMINI_API_KEY=your-key-here`

---

## 📚 Additional Resources

- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

---

<div align="center">

**Built with ❤️ by PulsarTeam**

*For questions about environment variables, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)*

</div>

