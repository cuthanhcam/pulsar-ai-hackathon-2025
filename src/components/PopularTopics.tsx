'use client'

const topics = [
  'React',
  'JavaScript',
  'Python',
  'Machine Learning',
  'AI Development',
  'Node.js',
  'UI/UX Design',
  'Data Science',
  'Web Development',
  'Mobile Development'
]

export default function PopularTopics() {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      <p className="text-gray-400 text-sm w-full text-center mb-2">Popular topics:</p>
      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        {topics.map((topic, index) => (
          <div key={index} style={{ opacity: 1, transform: 'none' }}>
            <div className="inline-flex items-center rounded-full border text-xs font-semibold border-transparent px-3 py-1 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-600/40 cursor-pointer transition-all hover:scale-105 active:scale-95 mb-1">
              {topic}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
