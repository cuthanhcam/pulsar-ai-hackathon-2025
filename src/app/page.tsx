'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Sparkles, Code, Brain, Zap, ArrowRight, Github, Linkedin, Mail } from 'lucide-react'
import Link from 'next/link'

// Lazy load heavy components
const TopBanner = dynamic(() => import('@/components/TopBanner'), {
  ssr: true,
  loading: () => null
})
const HeaderNew = dynamic(() => import('@/components/HeaderNew'), {
  ssr: true,
  loading: () => <div className="h-20 bg-zinc-950" />
})
const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false,
  loading: () => null
})

// Dynamic import for heavy canvas component - defer load
const TechCanvas = dynamic(() => import('@/components/TechCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-zinc-950" />
})

export default function Home() {
  const [selectedMember, setSelectedMember] = useState(0)

  const teamMembers = [
    {
      image: '/images/thebuilderteams/truongduongbaominh.png',
      hoverImage: '/images/thebuilderteams/hover/truongduongbaominhhover.png',
      name: 'Trương Dương Bảo Minh',
      role: 'Frontend Developer and AI Engineer',
      quote: '"Building PulsarTeam has been an incredible journey. Our AI-powered platform is transforming how people learn, making education accessible and personalized for everyone."'
    },
    {
      image: '/images/thebuilderteams/cuthanhcam.png',
      hoverImage: '/images/thebuilderteams/hover/cuthanhcamhover.png',
      name: 'Cù Thanh Cầm',
      role: 'Project Manager and Backend Developer',
      quote: `"PulsarTeam's mission is to redefine education through cutting-edge AI. We're empowering learners worldwide, delivering a personalized experience for all."`
    },
    {
      image: '/images/thebuilderteams/trantuananh.png',
      hoverImage: '/images/thebuilderteams/hover/trantuananhhover.png',
      name: 'Trần Tuấn Anh',
      role: 'Backend Developer and Data Analyst',
      quote: '"At PulsarTeam, we shaping the future of learning with AI innovation, creating a more inclusive, personalized, and accessible educational experience for everyone."'
    }
  ]

  return (
    <main className="min-h-screen bg-zinc-950">
      <TopBanner />
      <HeaderNew />
      
      {/* Hero Section - Optimized Height */}
      <section className="relative h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
        {/* Tech Canvas Background */}
        <div className="absolute inset-0">
          <TechCanvas />
        </div>
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-xs sm:text-sm font-bold text-orange-500 uppercase tracking-wider">AI-Powered Learning</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-[0.95] tracking-tight">
            Master Any Skill
            <br />
            with <span className="text-orange-500">AI</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Personalized learning powered by cutting-edge AI. Generate custom courses and achieve your goals faster.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link href="/ai-tutor">
              <button className="group px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center gap-2">
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            
            <Link href="#about">
              <button className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-orange-500/50 text-white font-bold rounded-xl transition-all">
                Learn More
              </button>
            </Link>
          </div>
          
          {/* Stats - Compact */}
          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-orange-500 mb-1">AI</div>
              <div className="text-xs text-zinc-500 font-semibold uppercase">Powered</div>
            </div>
            <div className="text-center border-x border-zinc-800">
              <div className="text-2xl sm:text-3xl font-black text-white mb-1">∞</div>
              <div className="text-xs text-zinc-500 font-semibold uppercase">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-white mb-1">24/7</div>
              <div className="text-xs text-zinc-500 font-semibold uppercase">Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Factory.ai Style */}
      <section id="about" className="relative py-20 bg-zinc-950">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1">
                <div className="w-1.5 h-12 bg-orange-500"></div>
                <div className="w-1.5 h-12 bg-white/60"></div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">Platform</div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
                  Built for <span className="text-orange-500">Learners</span>
                </h2>
              </div>
            </div>
            <p className="text-lg text-zinc-400 leading-relaxed">
              PulsarTeam combines cutting-edge AI with intuitive design to deliver 
              a learning experience that adapts to you.
            </p>
          </div>

          {/* Features Bento Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large Feature 1 */}
            <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-orange-500/5 to-zinc-900 border-2 border-zinc-800 hover:border-orange-500/50 rounded-2xl p-8 transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-orange-500 mb-1">AI</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Powered</div>
                </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Intelligent Course Generation</h3>
              <p className="text-zinc-400 leading-relaxed max-w-xl">
                Our AI analyzes your goals, skill level, and learning style to create 
                personalized courses in seconds. Every path is unique to you.
                </p>
              </div>
              
            {/* Small Feature 1 */}
            <div className="bg-zinc-900 border-2 border-zinc-800 hover:border-orange-500/50 rounded-2xl p-6 transition-all group">
              <div className="w-12 h-12 bg-orange-500/10 border-2 border-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Interactive</h3>
              <p className="text-sm text-zinc-400">
                Learn by doing with real-world exercises
              </p>
              </div>
              
            {/* Small Feature 2 */}
            <div className="bg-zinc-900 border-2 border-zinc-800 hover:border-orange-500/50 rounded-2xl p-6 transition-all group">
              <div className="w-12 h-12 bg-orange-500/10 border-2 border-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Instant</h3>
              <p className="text-sm text-zinc-400">
                Generate courses in seconds, not hours
              </p>
            </div>

            {/* Large Feature 2 */}
            <div className="md:col-span-2 bg-zinc-900 border-2 border-zinc-800 hover:border-orange-500/50 rounded-2xl p-8 transition-all group">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-4xl font-black text-white mb-2">Track Progress</div>
                  <p className="text-zinc-400 text-sm mb-4">
                    Beautiful visualizations show your learning journey with interactive mindmaps
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-xs text-orange-500 font-bold">Real-time Updates</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl"></div>
                    <div className="relative w-full h-full border-4 border-orange-500/30 rounded-full flex items-center justify-center">
                      <div className="text-3xl font-black text-orange-500">100%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Augment Code Style */}
      <section className="relative py-20 bg-zinc-900/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1">
                <div className="w-1.5 h-12 bg-orange-500"></div>
                <div className="w-1.5 h-12 bg-white/60"></div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">Team</div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
                  The <span className="text-orange-500">Builders</span>
                </h2>
            </div>
            </div>
          </div>

          {/* Featured Testimonial */}
          <div className="relative mx-auto mb-12 max-w-[889px]">
            <div 
              className="group relative flex min-h-[300px] md:min-h-[400px] cursor-pointer flex-col justify-between overflow-hidden rounded-[13px] border border-white/10 text-left backdrop-blur-sm transition-all duration-300 hover:border-orange-500"
              style={{
                background: 'linear-gradient(135deg, rgb(0, 0, 0) 0%, rgb(44, 54, 58) 100%)',
                height: '458px'
              }}
            >
              {/* Quote Content */}
              <div className="flex flex-1 items-center justify-center pt-5 pb-2.5 md:py-10">
                <div 
                  className="px-5 text-center leading-relaxed font-light text-white md:px-16 text-2xl md:text-3xl transition-all duration-300"
                  style={{ textIndent: '-0.4em', marginLeft: '-0.1em' }}
                >
                  {teamMembers[selectedMember].quote}
        </div>
      </div>

              {/* Author Info */}
              <div className="flex flex-col gap-4 px-4 pb-4 md:flex-row md:items-center md:justify-between md:px-16 md:pb-12">
                <div className="flex items-center gap-4">
                  <div className="border-frame border-gold h-16 w-16 rounded-xl p-1">
                    <div className="relative h-full w-full rounded-lg overflow-hidden bg-zinc-800">
                      {/* Normal Image */}
                      <Image 
                        src={teamMembers[selectedMember].image}
                        alt={teamMembers[selectedMember].name}
                        fill
                        className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                        sizes="64px"
                      />
                      {/* Hover Image */}
                      <Image 
                        src={teamMembers[selectedMember].hoverImage}
                        alt={`${teamMembers[selectedMember].name} hover`}
                        fill
                        className="object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                        sizes="64px"
                      />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-xl font-bold truncate text-white transition-all duration-300">
                      {teamMembers[selectedMember].name}
                </div>
                    <div className="text-sm text-zinc-400 break-words transition-all duration-300">
                      {teamMembers[selectedMember].role}
                </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-2xl font-black text-orange-500">PulsarTeam</div>
                </div>
              </div>
                            </div>
                          </div>

          {/* Avatar Grid - 3 Team Members */}
          <div className="mx-auto max-w-[889px] px-4 md:px-8">
            <div className="flex flex-wrap justify-center gap-2">
              {/* 3 Team Members */}
              {teamMembers.map((member, index) => {
                const isActive = selectedMember === index;
                
                return (
                  <button 
                    key={index}
                    onClick={() => setSelectedMember(index)}
                    className="group relative h-[44px] w-[44px] md:h-[45px] md:w-[45px] transition-all duration-200 hover:scale-110 focus:outline-none overflow-hidden"
                    title={member.name}
                  >
                    {/* Corner dots */}
                    <div className={`corner-dot corner-dot-tl transition-opacity duration-200 ${isActive || 'group-hover:opacity-0'} ${isActive ? 'opacity-0' : 'opacity-100'}`}></div>
                    <div className={`corner-dot corner-dot-tr transition-opacity duration-200 ${isActive || 'group-hover:opacity-0'} ${isActive ? 'opacity-0' : 'opacity-100'}`}></div>
                    <div className={`corner-dot corner-dot-bl transition-opacity duration-200 ${isActive || 'group-hover:opacity-0'} ${isActive ? 'opacity-0' : 'opacity-100'}`}></div>
                    <div className={`corner-dot corner-dot-br transition-opacity duration-200 ${isActive || 'group-hover:opacity-0'} ${isActive ? 'opacity-0' : 'opacity-100'}`}></div>
                    
                    {/* Avatar content */}
                    <div 
                      className="relative h-full w-full transition-all duration-200 bg-zinc-800 overflow-hidden"
                      style={{ 
                        border: isActive 
                          ? '2px solid rgb(249, 115, 22)' // Active: cam
                          : '1px solid rgb(255, 255, 255)' // Non-active: trắng
                      }}
                    >
                      <Image 
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="45px"
                      />
                          </div>
                  </button>
                );
              })}
                            </div>
                          </div>
                        </div>
      </section>

      {/* CTA Section - Factory.ai Style */}
      <section className="relative py-20 bg-zinc-950">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-zinc-900 to-zinc-900 border-2 border-orange-500/20 rounded-3xl">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
            
            <div className="relative p-12 sm:p-16 lg:p-20">
              <div className="max-w-3xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">Start Free</span>
                      </div>

                {/* Heading */}
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-none">
                  Begin Your
                  <br />
                  <span className="text-orange-500">Learning Journey</span>
                        </h2>
                        
                <p className="text-lg sm:text-xl text-zinc-400 mb-8 leading-relaxed max-w-2xl">
                  Join thousands of learners using AI to master new skills. 
                  Get 500 free credits to start. Begin your journey in seconds.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/ai-tutor">
                    <button className="group px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 inline-flex items-center gap-3">
                      <span className="text-lg">Get Started Free</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  
                  <Link href="/dashboard">
                    <button className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-orange-500/50 text-white font-bold rounded-xl transition-all">
                      View Dashboard
                    </button>
                  </Link>
                                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-6 mt-10 pt-10 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-semibold text-white">500 Free Credits</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-semibold text-white">Instant Credit Delivery</span>
                                          </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-semibold text-white">AI-Powered Learning</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
