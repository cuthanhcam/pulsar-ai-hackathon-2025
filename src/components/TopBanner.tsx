export default function TopBanner() {
  return (
    <div className="bg-zinc-950 border-b-2 border-zinc-900/50">
      <div className="mx-auto py-2.5 px-4 sm:px-8 lg:px-[16.666vw]">
        <div className="flex justify-center items-center">
          <div className="flex items-center gap-4 px-4 text-white">
            <div className="hidden md:flex gap-1">
              <div className="w-1 h-4 bg-orange-500 animate-pulse"></div>
              <div className="w-1 h-4 bg-white/60 animate-pulse delay-75"></div>
            </div>
            <p className="text-center text-xs sm:text-sm font-bold uppercase tracking-wider">
              <span className="text-orange-500">AI-Powered Learning</span>
              <span className="hidden sm:inline-block mx-3 text-zinc-700">•</span>
              <span className="hidden sm:inline-block text-white">Personalized Education</span>
              <span className="hidden sm:inline-block mx-3 text-zinc-700">•</span>
              <span className="text-zinc-400">Real Impact</span>
            </p>
            <div className="hidden md:flex gap-1">
              <div className="w-1 h-4 bg-white/60 animate-pulse delay-75"></div>
              <div className="w-1 h-4 bg-orange-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
