'use client'

import { useState } from 'react'
import { Search, Calendar, Layers } from 'lucide-react'
import TopBanner from '@/components/TopBanner'
import HeaderNew from '@/components/HeaderNew'
import Footer from '@/components/Footer'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  description: string
  category: 'AI Edge' | 'AI Rada' | 'AI x Business'
  date: string
  imageUrl: string
  tags: string[]
  slug: string
  isSeries?: boolean
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Qwen 3 và DeepSeek R2: Tác động đến thị trường chip toàn cầu',
    description: 'Qwen 3 và DeepSeek R2 – hai mô hình AI lớn nhất sắp ra mắt của Trung Quốc – không chỉ định hình lại cuộc đua AI mà còn có tiềm năng thay đổi cơ bản thị trường chip toàn cầu từ nhu cầu, cạnh tranh đến chiến lược phát triển ngành bán dẫn.',
    category: 'AI Rada',
    date: '22:35 29/04/2025',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1470&auto=format&fit=crop',
    tags: ['#AI', '#Qwen', '#DeepSeek', '#Chip', '#Bán dẫn', '#Trung Quốc', '#NVIDIA'],
    slug: 'qwen-3-deepseek-r2-tac-dong-thi-truong-chip',
  },
  {
    id: '2',
    title: 'Qwen 3: Mô hình AI nguồn mở của Alibaba thách thức các ông lớn AI toàn cầu',
    description: 'Ngày 28/4/2025, Alibaba chính thức ra mắt Qwen 3 - bộ mô hình AI mới với 235 tỷ tham số, có khả năng cạnh tranh trực tiếp với OpenAI và Google, đồng thời được phát hành dưới dạng mã nguồn mở.',
    category: 'AI Rada',
    date: '22:04 29/04/2025',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1470&auto=format&fit=crop',
    tags: ['#AI', '#Qwen', '#Alibaba', '#MoE', '#Trung Quốc', '#OpenSource'],
    slug: 'qwen-3-mo-hinh-ai-nguon-mo-alibaba',
  },
  {
    id: '3',
    title: 'DeepSeek R2: Cuộc cách mạng AI Trung Quốc định hình lại thị trường toàn cầu',
    description: 'DeepSeek R2 đang định hình lại cuộc đua AI toàn cầu với những bước đột phá về hiệu suất, chi phí và khả năng ứng dụng thực tế. Giảm 97.3% chi phí vận hành so với GPT-4 Turbo nhờ kiến trúc Hybrid MoE 3.0.',
    category: 'AI Rada',
    date: '11:35 29/04/2025',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1465&auto=format&fit=crop',
    tags: ['#AI', '#DeepSeek', '#Trung Quốc', '#MoE', '#Huawei'],
    slug: 'deepseek-r2-cuoc-cach-mang-ai-trung-quoc',
  },
  {
    id: '4',
    title: 'Perplexity Voice Assistant: Trợ Lý AI Thông Minh Trên iPhone',
    description: 'Perplexity đã chính thức tung ra bản cập nhật lớn cho ứng dụng iOS, mang đến trợ lý AI giọng nói với khả năng tích hợp sâu vào các ứng dụng như Maps, OpenTable, Calendar, Reminder, Uber và nhiều tính năng thông minh khác dành cho người dùng iPhone.',
    category: 'AI Rada',
    date: '19:39 25/04/2025',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop',
    tags: ['#AI', '#Voice Assistant', '#Perplexity', '#iPhone', '#iOS'],
    slug: 'perplexity-voice-assistant-tro-ly-ai-thong-minh-tren-iphone',
  },
  {
    id: '5',
    title: 'Microsoft ra mắt BitNet b1.58: Mô hình AI siêu nhẹ, vượt trội trên CPU',
    description: 'Microsoft vừa công bố BitNet b1.58 2B4T – một mô hình ngôn ngữ AI mới chỉ dùng ba giá trị (-1, 0, 1) để biểu diễn trọng số, giúp giảm mạnh dung lượng bộ nhớ và tiết kiệm năng lượng.',
    category: 'AI Rada',
    date: '14:11 20/04/2025',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1470&auto=format&fit=crop',
    tags: ['#AI', '#Microsoft', '#BitNet', '#CPU Optimization', '#Lightweight AI'],
    slug: 'microsoft-ra-mat-bitnet-b158-mo-hinh-ai-sieu-nhe-vuot-troi-tren-cpu',
  },
  {
    id: '6',
    title: 'Captain của Chatwoot – Chưa Phải Là AI Agent Thực Thụ',
    description: 'Captain của Chatwoot hỗ trợ CSKH hiệu quả, nhưng chưa đạt tầm một AI Agent thực thụ khi còn thiếu tư duy agent, khả năng reasoning, hành động tự động và cá nhân hóa.',
    category: 'AI x Business',
    date: '22:04 18/04/2025',
    imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1406&auto=format&fit=crop',
    tags: ['#AI Agent', '#Chatbot', '#GenAI', '#Customer Support'],
    slug: 'captain-chatbot-thong-minh-nhung-chua-la-agent',
  },
  {
    id: '7',
    title: 'Xu Hướng Tương Lai Của LLM: Tự Đánh Giá, Tự Cải Thiện Và Tiêu Chuẩn Hóa Ngành',
    description: 'Phân tích các xu hướng tương lai của mô hình ngôn ngữ lớn (LLM) trong tự đánh giá, tự cải thiện và tiêu chuẩn hóa ngành, cùng với các tác động đến lĩnh vực kiểm định và tuân thủ AI.',
    category: 'AI Edge',
    date: '21:21 18/04/2025',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1470&auto=format&fit=crop',
    tags: ['#LLM', '#GenAI', '#Self-Rewarding LLM', '#RLAIF', '#AI Standards', '#Future AI'],
    slug: 'xu-huong-tuong-lai-cua-llm-tu-danh-gia-tu-cai-thien',
    isSeries: true,
  },
  {
    id: '8',
    title: 'Rủi Ro Đạo Đức Và Thiên Kiến Khi Sử Dụng LLM-as-a-Judge: Cảnh Báo Và Giải Pháp Phòng Ngừa',
    description: 'Phân tích các rủi ro đạo đức và thiên kiến hệ thống khi sử dụng LLM-as-a-Judge trong đánh giá tự động các hệ thống AI, đồng thời đề xuất các giải pháp phòng ngừa dựa trên bằng chứng thực nghiệm.',
    category: 'AI Edge',
    date: '21:14 18/04/2025',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1470&auto=format&fit=crop',
    tags: ['#LLM', '#GenAI', '#AI Ethics', '#Bias Prevention', '#AI Governance'],
    slug: 'rui-ro-dao-duc-va-thien-kien-khi-su-dung-llm-as-a-judge',
    isSeries: true,
  },
]

const allTags = ['#LLM', '#GenAI', '#RAG', '#Evaluation', '#AI Quality Control', '#AI', '#Qwen', '#DeepSeek']

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả')
  const [sortBy, setSortBy] = useState('Mới nhất')

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Tất cả' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['Tất cả', 'AI Edge', 'AI Rada', 'AI x Business']

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <TopBanner />
      <HeaderNew />

      <main className="flex-grow">
        {/* Hero Section - Modern Geometric */}
        <section className="relative bg-slate-950 py-20 md:py-32 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-slate-950 to-purple-950/50"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10"></div>
          
          <div className="relative mx-auto px-4 sm:px-8 lg:px-[16.666vw]">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-1">
                  <div className="w-1 h-10 bg-indigo-500"></div>
                  <div className="w-1 h-10 bg-purple-500"></div>
                </div>
                <span className="text-sm text-indigo-400 font-bold uppercase tracking-[0.3em]">Blog & Insights</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black mb-6">
                Chuyên Mục <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">PulsarTeam AI</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl">
                Khám phá những kiến thức, hướng dẫn và xu hướng mới nhất về AI và GenAI
              </p>
              
              {/* Search Box - Modern Style */}
              <div className="relative max-w-2xl group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 group-hover:opacity-40 blur transition"></div>
                <div className="relative flex items-center bg-slate-900 border-2 border-slate-700 group-hover:border-indigo-500/50 transition-all">
                  <div className="p-4 border-r-2 border-slate-700">
                    <Search className="h-5 w-5 text-indigo-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none px-4 py-4 text-lg"
                    placeholder="Tìm kiếm bài viết..."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Content */}
        <div className="mx-auto py-16 px-4 sm:px-8 lg:px-[16.666vw]">
          <div className="flex flex-wrap gap-6">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Category Tabs */}
              <div className="mb-8 overflow-x-auto pb-2">
                <div className="inline-flex h-10 items-center bg-slate-900 border border-slate-800 rounded-xl p-1 w-full justify-start">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                          : 'text-gray-300 hover:text-indigo-400 hover:bg-slate-800'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post Count and Sort */}
              <div className="flex flex-wrap justify-between items-center mb-8">
                <div className="text-lg font-semibold text-white">
                  {filteredPosts.length} bài viết
                </div>
                <div className="mt-3 sm:mt-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex h-10 items-center justify-between rounded-md border bg-slate-900 border-slate-800 text-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 w-[180px]"
                  >
                    <option value="Mới nhất">Mới nhất</option>
                    <option value="Phổ biến">Phổ biến</option>
                    <option value="Cũ nhất">Cũ nhất</option>
                  </select>
                </div>
              </div>

              {/* Blog Posts Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {filteredPosts.map((post) => (
                  <article key={post.id} className="card-hover overflow-hidden rounded-lg border border-slate-800 bg-slate-900 relative shadow-lg hover:shadow-xl hover:shadow-indigo-900/30 transition-all duration-200">
                    {post.isSeries && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="rounded-full border px-2.5 py-0.5 text-xs bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium flex items-center gap-1 shadow-md animate-pulse">
                          <Layers className="h-3 w-3" />
                          SERIES
                        </div>
                      </div>
                    )}
                    <Link href={`/blog/${post.slug}`}>
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </Link>
                    <div className="p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                          {post.category}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar className="mr-1 h-4 w-4" />
                          <span>{post.date}</span>
                        </div>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="mb-2 text-xl font-bold line-clamp-2 text-white hover:text-indigo-400 transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="mb-4 text-muted-foreground line-clamp-3 text-gray-400">
                        {post.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-slate-800 px-2 py-1 text-xs text-gray-300 hover:bg-indigo-900/50 hover:text-indigo-300 border border-slate-700 hover:border-indigo-600 transition-all cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80">
              <div className="rounded-lg border bg-slate-900 text-white shadow-lg mb-6 overflow-hidden border-slate-800">
                <div className="flex flex-col space-y-1.5 p-6 pb-3 border-b border-slate-800">
                  <h3 className="font-semibold tracking-tight text-lg">Tags Phổ Biến</h3>
                </div>
                <div className="p-6 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center border font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-gray-300 cursor-pointer hover:bg-indigo-900/50 hover:text-indigo-300 hover:border-indigo-600 transition-all px-3 py-1 rounded-full text-sm border-slate-700 bg-slate-800"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <section className="bg-slate-950 pt-8 pb-16 text-white border-t border-white/10">
          <div className="mx-auto px-4 sm:px-8 lg:px-[16.666vw]">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 px-8 py-12 rounded-2xl shadow-2xl border border-indigo-800/50 w-full max-w-3xl mx-auto">
                <h2 className="mb-4 text-3xl font-bold">Đăng Ký Newsletter</h2>
                <p className="mb-8 max-w-2xl text-lg text-purple-100">
                  Nhận các bài viết mới nhất và tài nguyên độc quyền về AI/GenAI qua email
                </p>
                <form className="flex w-full max-w-md mx-auto flex-col space-y-4 sm:flex-row sm:space-x-3 sm:space-y-0">
                  <input
                    type="email"
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Email của bạn"
                    required
                  />
                  <button
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-11 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all shadow-md hover:shadow-lg"
                    type="submit"
                  >
                    Đăng Ký Ngay
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

