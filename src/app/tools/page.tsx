'use client'

import TopBanner from '@/components/TopBanner'
import HeaderNew from '@/components/HeaderNew'
import Footer from '@/components/Footer'
import { Search, ArrowUpRight, Zap, Filter } from 'lucide-react'
import { useState } from 'react'

const categories = [
  'Tất cả',
  'Trợ lý AI toàn diện',
  'Chatbot / Trợ lý cá nhân tổng quát',
  'AI Copywriting',
  'Image & Video Generation',
  'Search & Research Assistant',
  'Marketing & Nội Dung Bán Hàng',
  'Quản Trị & Ra Quyết Định Dựa Trên Dữ Liệu',
  'Document Q&A / Analysis Tool',
  'Voice-to-Text / Meeting Assistant'
]

const tools = [
  {
    id: 1,
    name: 'Google Gemini',
    description: 'Gemini là trợ lý AI đa năng của Google, hỗ trợ viết nội dung, lập kế hoạch, học tập và nhiều hơn nữa. Bạn có thể sử dụng Gemini để tạo văn bản, phân tích dữ liệu, hỗ trợ trong Gmail, Docs, Sheets và các ứng dụng khác trong Google Workspace.',
    category: 'Trợ lý AI toàn diện',
    pricing: 'Freemium',
    image: 'https://www.livemint.com/lm-img/img/2024/02/13/600x338/GEMINI-AI-14_1702176610121_1707814293295.jpg',
    url: 'https://gemini.google.com'
  },
  {
    id: 2,
    name: 'ChatGPT (OpenAI)',
    description: 'Trợ lý ảo cho CEO – trả lời câu hỏi, viết email, lập kế hoạch kinh doanh, phân tích thị trường,... Tùy chỉnh được theo văn phong và dữ liệu riêng.',
    category: 'Chatbot / Trợ lý cá nhân tổng quát',
    pricing: 'Freemium',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png',
    url: 'https://chat.openai.com'
  },
  {
    id: 3,
    name: 'Jasper.ai',
    description: 'Tạo nội dung marketing, email, mô tả sản phẩm cho đội ngũ marketing. Hữu ích để xây dựng thương hiệu nhanh chóng.',
    category: 'AI Copywriting',
    pricing: 'Paid',
    image: 'https://sm.pcmag.com/pcmag_me/review/j/jasper/jasper_pknd.jpg',
    url: 'https://www.jasper.ai'
  },
  {
    id: 4,
    name: 'Runway ML',
    description: 'Tạo video marketing, demo sản phẩm từ văn bản – không cần đội ngũ thiết kế. Phù hợp với công ty nhỏ cần tăng tốc sản xuất nội dung.',
    category: 'Image & Video Generation',
    pricing: 'Paid',
    image: 'https://phill.ai/wp-content/uploads/2024/09/Untitled-1.jpg',
    url: 'https://runwayml.com'
  },
  {
    id: 5,
    name: 'Perplexity.ai',
    description: 'Công cụ tìm kiếm AI cho các lãnh đạo – cung cấp thông tin kèm nguồn tin cậy, nhanh hơn Google cho các quyết định chiến lược.',
    category: 'Search & Research Assistant',
    pricing: 'Freemium',
    image: 'https://gotrialpro.com/wp-content/uploads/edd/2024/08/Perplexity-AI-Free-Trial-.png',
    url: 'https://www.perplexity.ai'
  },
  {
    id: 6,
    name: 'Canva AI',
    description: 'Tạo hình ảnh, poster, banner khuyến mãi AI chỉ từ ý tưởng. Phù hợp cho đội ngũ nhỏ muốn ra nội dung nhanh.',
    category: 'Marketing & Nội Dung Bán Hàng',
    pricing: 'Freemium',
    image: 'https://rescuemarketing.co/wp-content/uploads/2023/06/Canva-Comprehensive-Guide.png',
    url: 'https://www.canva.com/magic/'
  },
  {
    id: 7,
    name: 'Humata.ai',
    description: 'Đọc và đối thoại với file PDF như hợp đồng, báo cáo tài chính. Có thể hỏi thông tin cụ thể mà không cần đọc cả tài liệu.',
    category: 'Document Q&A / Analysis Tool',
    pricing: 'Freemium',
    image: 'https://www.humata.ai/images/og-logo.png',
    url: 'https://www.humata.ai'
  },
  {
    id: 8,
    name: 'Fireflies.ai',
    description: 'Ghi âm, chép nội dung, tóm tắt và phân tích các cuộc họp tự động. Giúp CEO không bỏ lỡ thông tin quan trọng và theo dõi hiệu suất nhóm.',
    category: 'Voice-to-Text / Meeting Assistant',
    pricing: 'Freemium',
    image: 'https://gotrialpro.com/wp-content/uploads/edd/2024/07/Fireflies-AI-Free-Trial_.png',
    url: 'https://fireflies.ai'
  }
]

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [showAllCategories, setShowAllCategories] = useState(false)

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Tất cả' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-950">
      <TopBanner />
      <HeaderNew />

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
              <span className="text-sm text-indigo-400 font-bold uppercase tracking-[0.3em]">AI Tools Directory</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              Khám Phá <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">Công Cụ AI</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl">
              Bộ sưu tập công cụ AI hỗ trợ lãnh đạo doanh nghiệp tối ưu quy trình làm việc
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
                  placeholder="Tìm kiếm công cụ AI..."
                />
                <div className="px-4 text-xs text-slate-500">
                  <kbd className="px-2 py-1 bg-slate-800 border border-slate-700">Ctrl</kbd>
                  <span className="mx-1">+</span>
                  <kbd className="px-2 py-1 bg-slate-800 border border-slate-700">K</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <div className="mx-auto px-4 sm:px-8 lg:px-[16.666vw] py-12">
        {/* Filter Bar - Geometric Style */}
        <div className="bg-slate-900 border-2 border-slate-800 p-6 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className="p-2 bg-indigo-600/20 border-2 border-indigo-500/30">
                <Filter className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-3xl text-white">{filteredTools.length}</span>
                  <span className="text-slate-400 font-semibold">công cụ AI</span>
                </div>
                <div className="h-1 w-20 bg-indigo-500 mt-1"></div>
              </div>
            </div>
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-sm text-slate-400 hover:text-indigo-400 font-bold transition-colors px-4 py-2 border-2 border-slate-700 hover:border-indigo-500/50"
            >
              {showAllCategories ? '− Thu gọn' : '+ Xem thêm'}
            </button>
          </div>

          {/* Categories - Geometric Buttons */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {displayedCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 text-sm font-bold transition-all border-2 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white'
                      : 'bg-slate-950 text-slate-400 border-slate-700 hover:border-indigo-500/50 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Category Select */}
          <div className="sm:hidden">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-semibold"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tools Grid - Modern Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool, index) => (
            <div
              key={tool.id}
              className="group relative bg-slate-900 border-2 border-slate-800 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden"
              style={{
                transitionDelay: `${index * 50}ms`
              }}
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-600/10 to-transparent"></div>
              
              {/* Image */}
              <div className="aspect-video w-full overflow-hidden relative">
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
              </div>

              {/* Content */}
              <div className="p-6 relative">
                {/* Badges */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="text-xs px-3 py-1 bg-indigo-600/20 border-2 border-indigo-500/30 text-indigo-300 font-bold truncate">
                    {tool.category}
                  </div>
                  <div className={`text-xs px-3 py-1 font-bold border-2 ${
                    tool.pricing === 'Freemium'
                      ? 'bg-green-600/10 border-green-500/30 text-green-400'
                      : 'bg-orange-600/10 border-orange-500/30 text-orange-400'
                  }`}>
                    {tool.pricing}
                  </div>
                </div>

                {/* Title */}
                <h3 className="mb-3 text-xl font-black text-white group-hover:text-indigo-400 transition-colors">
                  {tool.name}
                </h3>

                {/* Description */}
                <p className="mb-6 text-slate-400 text-sm leading-relaxed line-clamp-3">
                  {tool.description}
                </p>

                {/* Button */}
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn relative w-full bg-slate-950 border-2 border-indigo-500 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-3 flex items-center justify-center gap-2 font-bold transition-all overflow-hidden"
                >
                  <span className="relative z-10">Truy cập Tool</span>
                  <ArrowUpRight className="h-4 w-4 relative z-10 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTools.length === 0 && (
          <div className="bg-slate-900 border-2 border-slate-800 p-16 text-center">
            <div className="w-20 h-20 bg-slate-800 border-2 border-slate-700 mx-auto mb-6 flex items-center justify-center">
              <Search className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-400 text-xl font-bold">Không tìm thấy công cụ nào phù hợp</p>
            <p className="text-slate-500 text-sm mt-2">Thử thay đổi từ khóa tìm kiếm hoặc danh mục</p>
          </div>
        )}
      </div>

      {/* Newsletter Section - Geometric */}
      <section className="bg-slate-950 pt-16 pb-24 text-white border-t-2 border-slate-800">
        <div className="mx-auto px-4 sm:px-8 lg:px-[16.666vw]">
          <div className="relative bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border-2 border-indigo-500/30 p-12 max-w-4xl mx-auto overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600/20"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-600/20"></div>
            
            <div className="relative text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="flex gap-1">
                  <div className="w-1 h-8 bg-indigo-500"></div>
                  <div className="w-1 h-8 bg-purple-500"></div>
                </div>
                <span className="text-sm text-indigo-400 font-bold uppercase tracking-wider">Newsletter</span>
                <div className="flex gap-1">
                  <div className="w-1 h-8 bg-purple-500"></div>
                  <div className="w-1 h-8 bg-indigo-500"></div>
                </div>
              </div>
              
              <h2 className="text-4xl font-black mb-4">Đăng Ký Newsletter</h2>
              <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                Nhận các bài viết mới nhất và tài nguyên độc quyền về AI/GenAI qua email
              </p>
              
              <form className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-6 py-4 bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-semibold"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-2 border-indigo-500 text-white font-bold transition-all"
                >
                  Đăng Ký Ngay
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

