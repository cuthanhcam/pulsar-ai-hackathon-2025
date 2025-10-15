import { BookOpen, CheckCircle, MessageSquare } from 'lucide-react'

export default function FeaturesNew() {
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center py-10">
      <div className="w-full max-w-3xl">
        <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 duration-700">
          {/* Card 1 */}
          <div className="relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-slate-800/80 backdrop-blur-sm px-4 py-3 transition-all duration-500 shadow-lg hover:shadow-xl hover:bg-slate-800 [&>*]:flex [&>*]:items-center [&>*]:gap-2 [grid-area:stack] hover:-translate-y-5 hover:z-10 bg-opacity-80 hover:bg-opacity-100 border-blue-500/20 hover:border-blue-500/40">
            <div>
              <span className="relative inline-block rounded-full bg-blue-800/80 p-1.5 shadow-inner">
                <BookOpen className="size-4 text-blue-300" />
              </span>
              <p className="text-lg font-medium text-blue-500">Knowledge Systematization</p>
            </div>
            <p className="whitespace-nowrap text-lg font-light text-white">Personalize your learning path</p>
            <p className="text-gray-400 text-sm">From material or keyword</p>
          </div>

          {/* Card 2 */}
          <div className="relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-slate-800/80 backdrop-blur-sm px-4 py-3 transition-all duration-500 shadow-lg hover:shadow-xl hover:bg-slate-800 [&>*]:flex [&>*]:items-center [&>*]:gap-2 [grid-area:stack] translate-x-12 translate-y-8 hover:-translate-y-5 hover:z-20 bg-opacity-80 hover:bg-opacity-100 border-purple-500/20 hover:border-purple-500/40">
            <div>
              <span className="relative inline-block rounded-full bg-blue-800/80 p-1.5 shadow-inner">
                <CheckCircle className="size-4 text-purple-300" />
              </span>
              <p className="text-lg font-medium text-purple-500">AI Supporter</p>
            </div>
            <p className="whitespace-nowrap text-lg font-light text-white">Review knowledge after each lesson</p>
            <p className="text-gray-400 text-sm">Ensure deep understanding</p>
          </div>

          {/* Card 3 */}
          <div className="relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-slate-800/80 backdrop-blur-sm px-4 py-3 transition-all duration-500 shadow-lg hover:shadow-xl hover:bg-slate-800 [&>*]:flex [&>*]:items-center [&>*]:gap-2 [grid-area:stack] translate-x-24 translate-y-16 hover:translate-y-0 hover:z-30 bg-opacity-80 hover:bg-opacity-100 border-green-500/20 hover:border-green-500/40">
            <div>
              <span className="relative inline-block rounded-full bg-blue-800/80 p-1.5 shadow-inner">
                <MessageSquare className="size-4 text-green-300" />
              </span>
              <p className="text-lg font-medium text-green-500">AI Assistant</p>
            </div>
            <p className="whitespace-nowrap text-lg font-light text-white">Continuous interaction, skill assessment</p>
            <p className="text-gray-400 text-sm">Career path orientation</p>
          </div>
        </div>
      </div>
    </div>
  )
}
