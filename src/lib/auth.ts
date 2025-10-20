import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { validateSecret, checkSecurityWarnings } from '@/lib/security'

// 🔐 Validate NEXTAUTH_SECRET on startup (warnings only, no blocking)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  const secretValidation = validateSecret(process.env.NEXTAUTH_SECRET)
  
  if (!secretValidation.valid) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('🔴 CRITICAL SECURITY ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error(`❌ ${secretValidation.error}`)
    console.error('\n📝 To fix this:')
    console.error('   1. Run: node scripts/generate-secret.js')
    console.error('   2. Copy the generated secret to your .env file')
    console.error('   3. Restart the server')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } else if (secretValidation.severity === 'warning') {
    console.warn('\n⚠️  Security Warning:', secretValidation.error, '\n')
  }
  
  // Check all security settings
  checkSecurityWarnings()
}

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('[Auth] Login attempt for:', credentials?.email)
          
          if (!credentials?.email || !credentials?.password) {
            console.error('[Auth] Missing credentials')
            throw new Error('Missing email or password')
          }

          console.log('[Auth] Querying database...')
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.error('[Auth] User not found:', credentials.email)
            throw new Error('Invalid email or password')
          }

          console.log('[Auth] User found, verifying password...')
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.error('[Auth] Invalid password for:', credentials.email)
            throw new Error('Invalid email or password')
          }

          console.log('[Auth] ✅ Login successful for:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('[Auth] ❌ Login error:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers (GitHub, Google)
      if (account?.provider === 'github' || account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Create new user for OAuth login
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split('@')[0],
                password: '', // OAuth users don't need password
                role: 'user',
                credits: 500, // Give initial credits
              }
            })

            // Create progress record
            const newUser = await prisma.user.findUnique({
              where: { email: user.email! }
            })
            
            if (newUser) {
              await prisma.progress.create({
                data: {
                  userId: newUser.id
                }
              })
            }
          }
          return true
        } catch (error) {
          console.error('OAuth sign in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, trigger, account }) {
      // Only fetch from DB on initial sign in or when explicitly updated
      if (user) {
        token.id = user.id
        // For OAuth providers, fetch role from database since it's not in the user object
        if (account?.provider === 'github' || account?.provider === 'google') {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { role: true }
          })
          token.role = dbUser?.role || 'user'
        } else {
          token.role = user.role
        }
      }
      // Don't query DB on every request - trust the token
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  // 🔐 JWT Secret - MUST be set in production
  secret: process.env.NEXTAUTH_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXTAUTH_SECRET must be set in production environment')
    }
    return 'dev-secret-DO-NOT-USE-IN-PRODUCTION'
  })(),
  
  // 🔒 Use secure cookies in production
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}
