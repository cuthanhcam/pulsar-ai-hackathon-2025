import { Brain, Target, Sparkles, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Learning',
    description: 'Personalized knowledge systematization from any material or keyword',
    gradient: 'from-blue-500 to-cyan-500',
    position: 'top-0 left-0',
  },
  {
    icon: Target,
    title: 'Smart Assessment',
    description: 'Review and validate your understanding after each lesson',
    gradient: 'from-purple-500 to-pink-500',
    position: 'top-0 right-0',
  },
  {
    icon: Sparkles,
    title: 'Career Guidance',
    description: 'Continuous skill assessment with career path orientation',
    gradient: 'from-indigo-500 to-purple-600',
    position: 'bottom-0 left-1/2 -translate-x-1/2',
  },
]

export default function FeaturesModern() {
  return (
    <div className="py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
          Transform Your Learning
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-500">
            Experience
          </span>
        </h2>
        <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Powered by advanced AI to create the perfect learning path for you
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative bg-zinc-900 border border-zinc-800 hover:border-orange-500/30 transition-all duration-500 p-10 overflow-hidden rounded-2xl"
            style={{
              opacity: 1,
              transform: 'none',
              transitionDelay: `${index * 100}ms`
            }}
          >
            {/* Orange glow on hover */}
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl rounded-full"></div>

            <div className="relative">
              {/* Icon */}
              <div className="mb-8">
                <div className="inline-flex p-4 bg-zinc-800 border border-zinc-700 group-hover:border-orange-500/50 transition-all duration-300 rounded-xl">
                  <feature.icon className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-black text-white mb-4 group-hover:text-orange-400 transition-colors leading-tight tracking-tight">
                {feature.title}
              </h3>
              <p className="text-zinc-400 text-base leading-relaxed mb-8">
                {feature.description}
              </p>

              {/* Learn more link */}
              <button className="flex items-center gap-2 text-sm font-bold text-orange-500 group-hover:text-orange-400 transition-colors uppercase tracking-wider">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Number badge - Factory style */}
            <div className="absolute top-6 right-6 w-12 h-12 border border-zinc-800 bg-zinc-950/50 flex items-center justify-center rounded-lg">
              <span className="text-zinc-700 font-black text-xl">{index + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
