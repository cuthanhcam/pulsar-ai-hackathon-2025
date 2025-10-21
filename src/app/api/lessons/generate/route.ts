import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GEMINI_MODEL_PRIMARY, GEMINI_MODEL_FALLBACK } from '@/lib/gemini'
import { parseMarkdownCourse, validateParsedCourse } from '@/lib/markdown-parser'
import { getApiKey } from '@/lib/encryption'

export async function POST(req: Request) {
  // Add timeout wrapper - 4 minutes for detailed content generation
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout after 240 seconds')), 240000)
  )
  
  const mainLogic = async () => {
    try {
      console.log('[API] Generate lesson - Starting...')
      
      const session = await getServerSession(authOptions)
      console.log('[API] Session:', session ? 'exists' : 'null')
    
    if (!session?.user?.id) {
      console.log('[API] No session or user ID')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[API] User ID:', session.user.id)
    
    // Get user's API key and credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { geminiApiKey: true, credits: true }
    })
    
    console.log('[API] User found:', !!user, 'Has API key:', !!user?.geminiApiKey, 'Credits:', user?.credits)

    // 🔒 Decrypt user's API key (REQUIRED - no fallback to env var)
    if (!user?.geminiApiKey) {
      console.log('[API] No API key found in user settings')
      return NextResponse.json(
        { error: 'Gemini API Key not configured. Please add your API key in Settings.' },
        { status: 400 }
      )
    }

    let apiKey: string | null = null
    try {
      apiKey = await getApiKey(user.geminiApiKey)
      console.log('[API] API key retrieved, length:', apiKey?.length)
    } catch (error) {
      console.error('[API] Failed to get API key:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve your API key. Please re-enter it in Settings.' },
        { status: 400 }
      )
    }

    if (!apiKey) {
      console.log('[API] API key is empty after decryption')
      return NextResponse.json(
        { error: 'API key is empty. Please re-enter your API key in Settings.' },
        { status: 400 }
      )
    }

    // Check if user has enough credits
    const CREDITS_PER_COURSE = 30
    if (!user?.credits || user.credits < CREDITS_PER_COURSE) {
      console.log('[API] Insufficient credits:', user?.credits)
      return NextResponse.json(
        { error: `Insufficient credits. You need ${CREDITS_PER_COURSE} credits to generate a course. Current balance: ${user?.credits || 0} credits.` },
        { status: 403 }
      )
    }
    
    console.log('[API] Using API key from:', user?.geminiApiKey ? 'user settings' : 'environment')

    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('[API] Failed to parse request body:', e)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { topic, difficulty = 'beginner', duration = 30, preferences } = body
    console.log('[API] Request params:', { topic, difficulty, duration, preferences })

    if (!topic) {
      console.log('[API] Topic is missing')
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    // Initialize Gemini AI with API key
    // Skip listModels() to avoid fetch issues - directly use known model
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Use gemini-2.5-flash with high token limit for detailed content
    let generativeModel = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL_PRIMARY,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 20000, // Increased for 4 modules × 3 sections × 800 words each
      }
    })
    let modelUsed = GEMINI_MODEL_PRIMARY
    console.log(`[API] Using model: ${GEMINI_MODEL_PRIMARY}`)

    // Build learning style guidance
    const learningStyleGuide = preferences?.learningPreference === 'reading' 
      ? `- Cung cấp giải thích văn bản chi tiết, đầy đủ
- Sử dụng nhiều ví dụ minh họa bằng văn bản
- Cấu trúc nội dung rõ ràng với headings và subheadings
- Thêm phần "Tìm hiểu sâu" sau mỗi khái niệm`
      : preferences?.learningPreference === 'visual'
      ? `- Mô tả chi tiết các biểu đồ, sơ đồ (dù không thể hiển thị hình ảnh)
- Sử dụng lists và tables để trình bày thông tin rõ ràng
- Dùng emoji và ký hiệu để tạo visual cues
- Mô tả flow và process bằng text một cách trực quan`
      : preferences?.learningPreference === 'hands-on'
      ? `- Tập trung vào ví dụ code và bài tập thực hành
- Cung cấp nhiều code snippets có thể chạy được
- Thêm phần "Thực hành ngay" trong mỗi bài
- Bài tập từ dễ đến khó với hướng dẫn chi tiết`
      : preferences?.learningPreference === 'video'
      ? `- Cấu trúc nội dung theo dạng script video
- Sử dụng ngôn ngữ đàm thoại, gần gũi
- Chia nhỏ thành các phần với timestamps
- Thêm phần "Điểm chính cần nhớ" sau mỗi section`
      : '- Cân bằng giữa lý thuyết và thực hành'

    // Build instructional method guidance  
    const methodGuide = preferences?.instructionalMethod === 'structured'
      ? `- Tuân thủ trình tự logic chặt chẽ từ cơ bản đến nâng cao
- Mỗi bài học xây dựng dựa trên bài trước
- Có phần "Kiến thức cần có" ở đầu mỗi bài
- Cấu trúc rõ ràng với số thứ tự và mục lục`
      : preferences?.instructionalMethod === 'problem-solving'
      ? `- Bắt đầu mỗi bài với một vấn đề thực tế
- Hướng dẫn giải quyết vấn đề từng bước
- Thêm nhiều case studies và scenarios
- Kết thúc với challenge để học viên tự giải quyết`
      : preferences?.instructionalMethod === 'exploratory'
      ? `- Đặt câu hỏi để học viên tự suy nghĩ
- Cung cấp nhiều hướng khám phá
- Thêm phần "Thử nghiệm" và "Khám phá thêm"
- Khuyến khích tư duy phản biện và tự học`
      : preferences?.instructionalMethod === 'mentorship'
      ? `- Sử dụng giọng điệu của một mentor kinh nghiệm
- Thêm tips, tricks và best practices từ thực tế
- Chia sẻ kinh nghiệm và câu chuyện thực tế
- Có phần "Lời khuyên từ chuyên gia" và cảnh báo lỗi thường gặp`
      : '- Kết hợp nhiều phương pháp giảng dạy'

    // Generate course structure with Gemini - TITLES ONLY (no content)
    const prompt = `Bạn là một chuyên gia giáo dục với 10+ năm kinh nghiệm thiết kế khóa học chuyên nghiệp.
Hãy tạo CẤU TRÚC khóa học hoàn chỉnh về "${topic}" cho người học cấp độ ${difficulty}.

⚠️ QUAN TRỌNG: 
- Chỉ tạo STRUCTURE (titles và outline), KHÔNG tạo nội dung chi tiết
- Trả về ở định dạng PURE MARKDOWN
- Nội dung chi tiết sẽ được tạo sau khi người dùng click vào section
- Đây là template chung cho MỌI CHỦ ĐỀ (không chỉ lập trình)

📚 YÊU CẦU KHÓA HỌC:
- Chủ đề: ${topic}
- Cấp độ: ${difficulty} (beginner/intermediate/advanced)
- Thời lượng tổng: Khoảng ${duration} phút
- Phong cách học: ${preferences?.learningPreference || 'reading'}
- Phương pháp: ${preferences?.instructionalMethod || 'structured'}

🎯 FORMAT BẮT BUỘC:

# [Tên Khóa Học Hấp Dẫn, Rõ Ràng]

[Mô tả ngắn gọn 1-2 câu về giá trị và mục tiêu của khóa học]

## Module 1: [Tên Module - Phần Nền Tảng]

[Mô tả ngắn gọn nội dung và mục tiêu của module này]

### [Tên Bài Học 1.1]
[Duration: 8-12 phút]

### [Tên Bài Học 1.2]
[Duration: 8-12 phút]

### [Tên Bài Học 1.3]
[Duration: 8-12 phút]

### [Tên Bài Học 1.4]
[Duration: 8-12 phút]

## Module 2: [Tên Module]

[Mô tả module]

### [Tên Bài Học 2.1]
[Duration: 8-12 phút]

### [Tên Bài Học 2.2]
[Duration: 8-12 phút]

### [Tên Bài Học 2.3]
[Duration: 8-12 phút]

...tiếp tục cho đến Module 6, 7 hoặc 8...

⚠️ QUY TẮC BẮT BUỘC:
- BẮT BUỘC: Tạo từ 6-8 modules (không được ít hơn 6, không quá 8)
- Mỗi module BẮT BUỘC có 3-5 sections (không được ít hơn 3, không quá 5)
- Đánh số Module rõ ràng: Module 1, Module 2, Module 3...
- Modules phải có progression logic từ cơ bản → nâng cao
- Chỉ cần: Module title + description, Section title + duration
- KHÔNG viết nội dung bài học chi tiết
- Tên section phải rõ ràng, cụ thể, hấp dẫn

📖 CẤU TRÚC MODULE NÊN CÓ:
- Module 1-2: Kiến thức nền tảng, khái niệm cơ bản
- Module 3-4: Kiến thức trung cấp, áp dụng thực tế
- Module 5-6: Kiến thức nâng cao, kỹ thuật chuyên sâu
- Module 7-8 (nếu cần): Thực hành tổng hợp, dự án thực tế

🎓 HƯỚNG DẪN PHƯƠNG PHÁP:
${methodGuide}

💡 VÍ DỤ CHO NHIỀU CHỦ ĐỀ:

VÍ DỤ 1 - LẬP TRÌNH:
# Python Từ Cơ Bản Đến Nâng Cao

Học Python từ con số 0, thành thạo trong 8 tuần với dự án thực tế.

## Module 1: Khởi Đầu Với Python

Làm quen với Python, cài đặt môi trường và viết chương trình đầu tiên.

### Python là gì và tại sao nên học?
[Duration: 10 phút]

### Cài đặt Python và IDE
[Duration: 8 phút]

### Chương trình "Hello World" đầu tiên
[Duration: 10 phút]

### Biến và Kiểu dữ liệu cơ bản
[Duration: 12 phút]

## Module 2: Cấu Trúc Điều Khiển

[...tiếp tục đến Module 8...]

VÍ DỤ 2 - NGOẠI NGỮ:
# Tiếng Anh Giao Tiếp: Tự Tin Trong 8 Tuần

Nắm vững tiếng Anh giao tiếp hàng ngày, phát âm chuẩn, tư duy tiếng Anh tự nhiên.

## Module 1: Nền Tảng Phát Âm và Ngữ Điệu

Phát âm chuẩn 44 âm tiếng Anh, ngữ điệu và nhấn mạnh câu.

### 44 âm tiếng Anh và cách phát âm
[Duration: 12 phút]

### Nguyên âm đơn và nguyên âm đôi
[Duration: 10 phút]

### Phụ âm và âm cuối
[Duration: 10 phút]

### Ngữ điệu câu và nhấn mạnh từ
[Duration: 10 phút]

[...tiếp tục đến Module 8...]

VÍ DỤ 3 - KỸ NĂNG MỀM:
# Quản Lý Thời Gian Hiệu Quả

Làm chủ thời gian, tăng năng suất gấp đôi với phương pháp khoa học.

## Module 1: Hiểu Về Thời Gian và Năng Suất

Tại sao bạn luôn thiếu thời gian và cách khắc phục.

### Bẫy thời gian phổ biến
[Duration: 10 phút]

### Ma trận Eisenhower: Phân loại công việc
[Duration: 12 phút]

### Nguyên tắc Pareto 80/20
[Duration: 10 phút]

[...tiếp tục đến Module 8...]

⚠️ LƯU Ý CRITICAL:
- Format ĐÚNG như ví dụ trên
- BẮT BUỘC 6-8 modules, mỗi module 3-5 sections
- Titles phải rõ ràng, hấp dẫn, dễ hiểu
- Áp dụng được cho MỌI chủ đề (lập trình, ngoại ngữ, kỹ năng mềm, nghệ thuật, kinh doanh...)
- KHÔNG thêm nội dung chi tiết (chỉ title + duration)`

    let text
    try {
      console.log('[API] Calling Gemini API...')
      const result = await generativeModel.generateContent(prompt)
      console.log('[API] Got result from Gemini')
      const response = await result.response
      console.log('[API] Got response object')
      text = response.text()
      console.log('[API] Extracted text, length:', text?.length || 0)
    } catch (modelError) {
      console.log(`[API] Model ${modelUsed} failed, trying alternatives`)
      console.error('[API] Primary model error:', modelError)
      
      // Try fallback models
      const modelsToTry = [GEMINI_MODEL_FALLBACK, 'gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash']
      
      let lastError = modelError
      for (const model of modelsToTry) {
        try {
          console.log(`[API] Trying model: ${model}`)
          generativeModel = genAI.getGenerativeModel({ model })
          modelUsed = model
          const result = await generativeModel.generateContent(prompt)
          const response = await result.response
          text = response.text()
          console.log(`[API] Successfully used model: ${model}`)
          break // Success!
        } catch (err) {
          console.log(`[API] Model ${model} failed:`, err instanceof Error ? err.message : 'Unknown error')
          lastError = err
        }
      }
      
      if (!text) {
        console.error('[API] All models failed')
        const errorMsg = lastError instanceof Error ? lastError.message : 'All models failed'
        return NextResponse.json(
          { 
            error: 'Unable to generate course. Your API key may not have access to any Gemini models.',
            details: `Error: ${errorMsg}`,
            suggestion: 'Please verify your API key at https://makersuite.google.com/app/apikey'
          },
          { status: 500 }
        )
      }
    }
    
    if (!text) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      )
    }

    console.log('[API] Received Markdown content, length:', text.length)

    // Clean markdown - remove wrapper if any
    let markdown = text.trim()
    if (markdown.startsWith('```markdown')) {
      markdown = markdown.substring(11)
    } else if (markdown.startsWith('```')) {
      markdown = markdown.substring(3)
    }
    if (markdown.endsWith('```')) {
      markdown = markdown.substring(0, markdown.length - 3)
    }
    markdown = markdown.trim()

    console.log('[API] Cleaned Markdown length:', markdown.length)
    
    // Save raw markdown for debugging
    try {
      const fs = require('fs')
      const path = require('path')
      const debugPath = path.join(process.cwd(), 'debug-raw-markdown.txt')
      fs.writeFileSync(debugPath, markdown, 'utf8')
      console.log('[API] Saved raw Markdown to:', debugPath)
    } catch (fsError) {
      console.error('[API] Could not save debug file:', fsError)
    }

    // Parse Markdown to structured data
    let courseData
    try {
      console.log('[API] Parsing Markdown to course structure...')
      courseData = parseMarkdownCourse(markdown)
      console.log('[API] Parsed course:', {
        title: courseData.title,
        modulesCount: courseData.modules.length,
        sectionsPerModule: courseData.modules.map(m => m.sections.length)
      })

      // Validate structure
      const validation = validateParsedCourse(courseData)
      if (!validation.valid) {
        console.error('[API] Validation errors:', validation.errors)
        return NextResponse.json(
          {
            error: 'Invalid course structure',
            details: validation.errors.join(', ')
          },
          { status: 500 }
        )
      }

      console.log('[API] Course structure validated successfully!')
    } catch (parseError) {
      console.error('[API] Markdown parse error:', parseError)
      
      // Save debug file
      try {
        const fs = require('fs')
        const path = require('path')
        const debugPath = path.join(process.cwd(), 'debug-markdown-error.txt')
        fs.writeFileSync(debugPath, markdown, 'utf8')
        console.log('[API] Saved problematic Markdown to:', debugPath)
      } catch (fsError) {
        console.error('[API] Could not save debug file:', fsError)
      }

      return NextResponse.json(
        {
          error: 'Failed to parse Markdown course',
          details: parseError instanceof Error ? parseError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Now we have courseData from Markdown parsing

    // Save to database
    console.log('[API] Saving course to database...')
    console.log('[API] Modules to create:', courseData.modules.map((m: any) => ({
      title: m.title,
      sectionsCount: m.sections?.length || 0
    })))
    
    const lesson = await prisma.lesson.create({
      data: {
        userId: session.user.id,
        title: courseData.title,
        description: courseData.description,
        topic,
        difficulty,
        duration,
        content: JSON.stringify(courseData), // Store full JSON for now
        modules: {
          create: courseData.modules.map((mod: any, idx: number) => {
            console.log(`[API] Creating module ${idx + 1}: "${mod.title}" with ${mod.sections?.length || 0} sections`)
            return {
              title: mod.title,
              description: mod.description,
              order: mod.order || idx + 1,
              sections: {
                create: mod.sections.map((sec: any, secIdx: number) => {
                  console.log(`[API]   - Section ${secIdx + 1}: "${sec.title}"`)
                  return {
                    title: sec.title,
                    content: sec.content,
                    order: sec.order || secIdx + 1,
                    duration: sec.duration || 10
                  }
                })
              }
            }
          })
        }
      },
      include: {
        modules: {
          include: {
            sections: true
          }
        }
      }
    })
    
    console.log('[API] Course saved! Lesson ID:', lesson.id)
    console.log('[API] Saved modules:', lesson.modules.map((m: any) => ({
      title: m.title,
      sectionsCount: m.sections?.length || 0
    })))

    // TODO: Generate mindmap in background (async job) to avoid timeout
    // For now, skip mindmap generation to return faster
    console.log('[API] Skipping mindmap generation to avoid timeout')

    // Deduct credits from user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        credits: {
          decrement: CREDITS_PER_COURSE
        }
      }
    })
    console.log('[API] Deducted', CREDITS_PER_COURSE, 'credits from user')

    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        modules: lesson.modules
      },
      creditsUsed: CREDITS_PER_COURSE,
      remainingCredits: Number(user?.credits || 0) - CREDITS_PER_COURSE
    })

    } catch (error) {
      console.error('[API] Generate lesson error:', error)
      console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      return NextResponse.json(
        { 
          error: 'Failed to generate lesson', 
          details: error instanceof Error ? error.message : 'Unknown error',
          stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
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
