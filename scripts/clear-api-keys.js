/**
 * Clear all encrypted API keys from database
 * Use when rotating encryption keys
 */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔄 Clearing all geminiApiKey from database...')
    
    const result = await prisma.user.updateMany({
      data: { geminiApiKey: null }
    })
    
    console.log(`✅ Cleared ${result.count} users' API keys`)
    console.log('⚠️  Users will need to re-enter their API keys')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
