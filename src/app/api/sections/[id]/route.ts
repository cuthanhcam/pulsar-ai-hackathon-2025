import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GEMINI_MODEL_PRIMARY } from '@/lib/gemini'

// GET: Fetch section content

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const section = await prisma.section.findUnique({
      where: { id: params.id },
      include: {
        module: {
          include: {
            lesson: {
              select: {
                userId: true,
                title: true,
                topic: true,
                difficulty: true
              }
            }
          }
        }
      }
    })

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (section.module.lesson.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      id: section.id,
      title: section.title,
      content: section.content,
      duration: section.duration,
      module: {
        id: section.module.id,
        title: section.module.title
      },
      lesson: {
        title: section.module.lesson.title,
        topic: section.module.lesson.topic
      }
    })
  } catch (error) {
    console.error('[API] Get section error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch section' },
      { status: 500 }
    )
  }
}

// POST: Generate content for section (lazy loading)
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Add timeout wrapper - 5 minutes for detailed content generation
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout after 300 seconds')), 300000)
  )
  
  const mainLogic = async () => {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get section with context
    const section = await prisma.section.findUnique({
      where: { id: params.id },
      include: {
        module: {
          include: {
            lesson: {
              select: {
                id: true,
                userId: true,
                title: true,
                topic: true,
                difficulty: true,
                description: true
              }
            },
            sections: {
              select: {
                id: true,
                title: true,
                order: true
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (section.module.lesson.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // If content already exists, return it
    if (section.content && section.content.trim().length > 100) {
      console.log('[API] Section content already exists, returning cached')
      return NextResponse.json({
        id: section.id,
        title: section.title,
        content: section.content,
        duration: section.duration,
        cached: true
      })
    }

    // Get user's API key
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { geminiApiKey: true, credits: true }
    })

    const apiKey = user?.geminiApiKey || process.env.GEMINI_API_KEY

    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      return NextResponse.json(
        { error: 'Gemini API Key not configured' },
        { status: 400 }
      )
    }

    // Check credits (5 credits per section)
    const CREDITS_PER_SECTION = 5
    if (!user?.credits || user.credits < CREDITS_PER_SECTION) {
      return NextResponse.json(
        { error: `Insufficient credits. Need ${CREDITS_PER_SECTION} credits.` },
        { status: 403 }
      )
    }

    // Build context for better content generation
    const courseContext = `
Khóa học: ${section.module.lesson.title}
Chủ đề: ${section.module.lesson.topic}
Cấp độ: ${section.module.lesson.difficulty}

Module hiện tại: ${section.module.title}
Các section trong module:
${section.module.sections.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}

Section cần tạo nội dung: ${section.title}
`

    // Generate content with Gemini
    const prompt = `Bạn là một giảng viên chuyên nghiệp với 10+ năm kinh nghiệm. Hãy tạo nội dung chi tiết, chuyên nghiệp cho bài học sau:

${courseContext}

⚠️ YÊU CẦU CHUNG:
- Viết nội dung CHI TIẾT, CHUYÊN NGHIỆP cho bài học: "${section.title}"
- Độ dài: 1000-1500 từ tiếng Việt
- Format: PURE MARKDOWN với cấu trúc rõ ràng
- Bám sát chủ đề "${section.module.lesson.topic}" và phù hợp cấp độ "${section.module.lesson.difficulty}"
- Sử dụng đầy đủ Markdown headings (##, ###, ####) để tổ chức nội dung
- Nội dung phải mạch lạc, logic, dễ theo dõi

📚 CẤU TRÚC BÀI HỌC CHUẨN:

# ${section.title}

## Mục tiêu bài học

- [Mục tiêu 1: Hiểu được khái niệm X]
- [Mục tiêu 2: Biết cách áp dụng Y]
- [Mục tiêu 3: Nắm vững kỹ năng Z]
- [Mục tiêu 4: Có khả năng thực hành...]

## Nội dung chính

### Lý thuyết chi tiết

#### 1. [Khái niệm/Chủ đề chính 1]

[Giải thích chi tiết 200-300 từ về khái niệm này]

**Ví dụ minh họa:**

\`\`\`javascript
// Code ví dụ cụ thể, có thể chạy được
// Kèm chi tiết comment giải thích
const example = "Hello World";
console.log(example);
\`\`\`

**Giải thích code:**
- Dòng 1: [Giải thích]
- Dòng 2: [Giải thích]

#### 2. [Khái niệm/Chủ đề chính 2]

[Giải thích chi tiết 200-300 từ]

**Điểm quan trọng cần nhớ:**
- 📌 [Điểm 1]
- 📌 [Điểm 2]
- 📌 [Điểm 3]

### Ví dụ minh họa

#### Ví dụ 1: [Tên ví dụ cụ thể]

**Mô tả:** [Mô tả bối cảnh ví dụ]

**Mã nguồn:**

\`\`\`javascript
// Code đầy đủ, có thể chạy ngay
// Có comment chi tiết
\`\`\`

**Phân tích chi tiết:**
[Giải thích từng phần của code]

#### Ví dụ 2: [Tên ví dụ nâng cao]

[Tương tự ví dụ 1]

### So sánh và phân tích

#### [Tiêu đề so sánh]

| Tiêu chí | Cách tiếp cận A | Cách tiếp cận B | Khi nào dùng |
|----------|----------------|----------------|--------------|
| [Tiêu chí 1] | [...] | [...] | [...] |
| [Tiêu chí 2] | [...] | [...] | [...] |
| [Tiêu chí 3] | [...] | [...] | [...] |

**Kết luận:** [Kết luận về so sánh]

## Bài tập thực hành

### Bài tập 1: [Tên bài tập cơ bản]

**Mức độ:** ⭐ Cơ bản

**Đề bài:**
[Mô tả chi tiết yêu cầu bài tập]

**Gợi ý:**
- [Gợi ý 1]
- [Gợi ý 2]
- [Gợi ý 3]

**Kết quả mong đợi:**
\`\`\`
[Output mẫu]
\`\`\`

### Bài tập 2: [Tên bài tập trung bình]

**Mức độ:** ⭐⭐ Trung bình

**Đề bài:**
[Mô tả chi tiết, phức tạp hơn bài 1]

**Yêu cầu:**
1. [Yêu cầu 1]
2. [Yêu cầu 2]
3. [Yêu cầu 3]

**Gợi ý:**
- [Gợi ý về cách tiếp cận]
- [Các hàm/công cụ cần dùng]

### Bài tập 3: [Tên bài tập nâng cao]

**Mức độ:** ⭐⭐⭐ Nâng cao

**Đề bài:**
[Bài tập thách thức, tích hợp nhiều kiến thức]

**Hướng dẫn từng bước:**
1. **Bước 1:** [Hướng dẫn]
2. **Bước 2:** [Hướng dẫn]
3. **Bước 3:** [Hướng dẫn]

**Bonus Challenge:** [Thêm tính năng nâng cao]

## Tóm tắt

Trong bài học này, chúng ta đã học được:

1. **[Điểm chính 1]**: [Tóm tắt ngắn gọn]
2. **[Điểm chính 2]**: [Tóm tắt ngắn gọn]
3. **[Điểm chính 3]**: [Tóm tắt ngắn gọn]
4. **[Điểm chính 4]**: [Tóm tắt ngắn gọn]

**Key Takeaways:**
- 🔑 [Điểm then chốt 1]
- 🔑 [Điểm then chốt 2]
- 🔑 [Điểm then chốt 3]

🎯 FORMAT QUY ĐỊNH:
- BẮT BUỘC sử dụng ## (H2) cho các phần chính
- BẮT BUỘC sử dụng ### (H3) cho các tiểu mục
- BẮT BUỘC sử dụng #### (H4) cho các chi tiết
- Code examples PHẢI có comment đầy đủ
- Bài tập phải CỤ THỂ, THỰC TẾ, có hướng dẫn chi tiết
- Giải thích phải RÕ RÀNG, DỄ HIỂU với cấp độ ${section.module.lesson.difficulty}

💡 LƯU Ý CHẤT LƯỢNG:
- Nội dung phải có GIÁ TRỊ THỰC TẾ cao
- Ví dụ phải CÓ THỂ CHẠY ĐƯỢC
- Bài tập từ DỄ → KHÓ theo thứ tự
- Ngôn ngữ chuyên nghiệp nhưng dễ hiểu
- Tránh nội dung chung chung, phải CỤ THỂ

Hãy tạo một bài học XUẤT SẮC, ĐẲNG CẤP!`

    console.log('[API] Generating content for section:', section.title)

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_PRIMARY,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8000, // Increased for more detailed content with exercises
      }
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    let content = response.text().trim()

    // Clean markdown
    if (content.startsWith('```markdown')) {
      content = content.substring(11)
    } else if (content.startsWith('```')) {
      content = content.substring(3)
    }
    if (content.endsWith('```')) {
      content = content.substring(0, content.length - 3)
    }
    content = content.trim()

    console.log('[API] Generated content length:', content.length)

    // Save content to database
    await prisma.section.update({
      where: { id: section.id },
      data: { content }
    })

    // Deduct credits
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        credits: {
          decrement: CREDITS_PER_SECTION
        }
      }
    })

    console.log('[API] Section content saved and credits deducted')

    return NextResponse.json({
      id: section.id,
      title: section.title,
      content,
      duration: section.duration,
      creditsUsed: CREDITS_PER_SECTION,
      cached: false
    })

  } catch (error) {
    console.error('[API] Generate section error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate section content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
  }

  // Race between timeout and main logic
  try {
    return await Promise.race([mainLogic(), timeoutPromise]) as Response
  } catch (error) {
    console.error('[API] Top-level error or timeout:', error)
    return NextResponse.json(
      { 
        error: 'Request failed or timed out', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
