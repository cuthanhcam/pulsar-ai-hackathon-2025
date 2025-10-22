#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { QdrantClient } from '@qdrant/js-client-rest'
import crypto from 'crypto'

const prisma = new PrismaClient()
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
})

// Generate MD5 hash of content
function hashContent(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex')
}

// Embed text using Ollama
async function embedText(text: string): Promise<number[]> {
  try {
    const res = await fetch('http://127.0.0.1:11434/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mxbai-embed-large',
        input: text,
      }),
    })

    if (!res.ok) {
      throw new Error(`Ollama API returned ${res.status}`)
    }

    const data = await res.json()
    return data.embeddings?.[0] || data.embedding || []
  } catch (error) {
    console.error('❌ Embedding failed:', error)
    throw error
  }
}

// Split text into chunks
function chunkText(text: string, maxLength: number = 500): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += sentence
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim())
  return chunks
}

async function main() {
  console.log('🚀 Starting course indexing to Qdrant...\n')

  // 1. Create collection if not exists
  console.log('📦 Setting up Qdrant collection "pulsar_lessons"...')
  try {
    const collections = await qdrant.getCollections()
    const exists = collections.collections.some((c: any) => c.name === 'pulsar_lessons')
    
    if (!exists) {
      await qdrant.createCollection('pulsar_lessons', {
        vectors: {
          size: 1024, // mxbai-embed-large dimension
          distance: 'Cosine',
        },
      })
      console.log('  ✅ Collection created')
    } else {
      console.log('  ✅ Collection already exists')
    }
  } catch (e) {
    console.error('  ❌ Failed to setup collection:', e)
    throw e
  }

  // 2. Fetch all lessons with content
  console.log('\n📚 Fetching lessons from database...')
  const lessons = await prisma.lesson.findMany({
    include: {
      user: {
        select: { id: true, email: true }
      },
      modules: {
        include: {
          sections: {
            include: {
              embeddings: true // Include existing embeddings
            }
          }
        }
      }
    }
  })

  console.log(`  ✅ Found ${lessons.length} lessons\n`)

  let totalChunks = 0
  let skippedChunks = 0
  let newChunks = 0

  // 3. Index each lesson
  for (const lesson of lessons) {
    console.log(`\n📖 Processing: "${lesson.title}" (User: ${lesson.user.email})`)
    
    // Index modules and sections
    for (const module of lesson.modules) {
      console.log(`  ├─ Module: "${module.title}"`)
      
      for (const section of module.sections) {
        if (!section.content) {
          console.log(`    ├─ Section: "${section.title}" (no content, skipping)`)
          continue
        }

        const contentHash = hashContent(section.content)
        const chunks = chunkText(section.content)
        console.log(`    ├─ Section: "${section.title}" (${chunks.length} chunks)`)

        // Check if content has changed
        const existingEmbeddings = section.embeddings
        const existingHashes = new Set(existingEmbeddings.map(e => e.contentHash))
        
        if (existingHashes.has(contentHash) && existingEmbeddings.length === chunks.length) {
          console.log(`      ✓ Already indexed (content unchanged), skipping`)
          skippedChunks += chunks.length
          continue
        }

        // Content changed or new - delete old embeddings
        if (existingEmbeddings.length > 0) {
          console.log(`      ⟳ Content changed, re-indexing...`)
          
          // Delete from Qdrant
          const vectorIds = existingEmbeddings.map(e => e.vectorId)
          await qdrant.delete('pulsar_lessons', {
            points: vectorIds
          })
          
          // Delete from database
          await prisma.sectionEmbedding.deleteMany({
            where: { sectionId: section.id }
          })
        }

        // Index new chunks
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i]
          
          try {
            const embedding = await embedText(chunk)
            
            if (embedding && embedding.length > 0) {
              const vectorId = crypto.randomUUID()
              
              // Upload to Qdrant
              await qdrant.upsert('pulsar_lessons', {
                wait: true,
                points: [{
                  id: vectorId,
                  vector: embedding,
                  payload: {
                    text: chunk,
                    userId: lesson.user.id,
                    courseId: lesson.id,
                    courseName: lesson.title,
                    moduleId: module.id,
                    moduleTitle: module.title,
                    sectionId: section.id,
                    sectionTitle: section.title,
                    chunkIndex: i,
                    type: 'section',
                  }
                }]
              })
              
              // Save to database
              await prisma.sectionEmbedding.create({
                data: {
                  sectionId: section.id,
                  moduleId: module.id,
                  courseId: lesson.id,
                  userId: lesson.user.id,
                  vectorId,
                  contentHash,
                  chunkIndex: i,
                }
              })
              
              newChunks++
              totalChunks++
            }
          } catch (error) {
            console.error(`      ❌ Failed to embed chunk ${i}:`, error)
          }
        }
        
        console.log(`      ✅ Indexed ${chunks.length} chunks`)
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ Indexing complete!`)
  console.log(`   - Total lessons: ${lessons.length}`)
  console.log(`   - New chunks indexed: ${newChunks}`)
  console.log(`   - Chunks skipped (unchanged): ${skippedChunks}`)
  console.log(`   - Total chunks in vector DB: ${totalChunks}`)
  console.log('='.repeat(60))
}

main()
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
