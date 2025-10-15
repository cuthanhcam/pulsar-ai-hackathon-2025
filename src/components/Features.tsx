'use client'

import { BookOpen, Bot, Sparkles, ArrowRight, Check } from 'lucide-react'

export default function Features() {
  const features = [
    {
      title: 'Knowledge Systematization',
      subtitle: 'Personalize your learning path',
      description: 'AI analyzes your topic and creates a structured curriculum tailored to your learning goals',
      icon: BookOpen,
      color: 'from-blue-500 via-blue-600 to-cyan-500',
      benefits: ['Custom curriculum', 'Adaptive pacing', 'Topic breakdown']
    },
    {
      title: 'AI Supporter',
      subtitle: 'Review knowledge after each lesson',
      description: 'Interactive quizzes and assessments ensure deep understanding of every concept',
      icon: Bot,
      color: 'from-purple-500 via-purple-600 to-pink-500',
      benefits: ['Smart quizzes', 'Instant feedback', 'Progress tracking']
    },
    {
      title: 'AI Assistant',
      subtitle: 'Continuous interaction, skill assessment',
      description: '24/7 AI companion guides you through challenges and recommends career paths',
      icon: Sparkles,
      color: 'from-orange-500 via-red-500 to-pink-500',
      benefits: ['24/7 support', 'Career guidance', 'Skill assessment']
    }
  ]

  return (
    <section className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
            Powerful Learning Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to master any subject with AI-powered assistance
          </p>
        </div>

        {/* Features Grid with 3D Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.2}s both`
                }}
              >
                {/* Card */}
                <div className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 h-full overflow-hidden group-hover:-translate-y-2">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  {/* Icon with Gradient Background */}
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-lg font-semibold text-blue-600 mb-4">
                    {feature.subtitle}
                  </p>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Benefits List */}
                  <ul className="space-y-2 mb-6">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Learn More Link */}
                  <button className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-4">
            <button className="group relative px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105">
              <span className="relative z-10 flex items-center gap-3">
                Start Your Learning Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 blur opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>
            <p className="text-sm text-gray-500">No credit card required • Free to start</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
