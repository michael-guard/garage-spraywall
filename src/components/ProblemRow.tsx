import type { ProblemListItem } from '../types'

interface ProblemRowProps {
  problem: ProblemListItem
  onTap: (id: string) => void
}

export default function ProblemRow({ problem, onTap }: ProblemRowProps) {
  return (
    <button
      onClick={() => onTap(problem.id)}
      className="w-full text-left px-4 py-3 flex items-start gap-3 active:bg-gray-800 transition-colors"
    >
      {/* Left: name, tags, sends */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium truncate">{problem.name}</span>
          {problem.status === 'project' && (
            <span className="flex-shrink-0 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase">
              Project
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gray-500 text-xs">Sends {problem.send_count}</span>
          {problem.tags.length > 0 && (
            <div className="flex gap-1 overflow-hidden">
              {problem.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              {problem.tags.length > 3 && (
                <span className="text-[10px] text-gray-600">+{problem.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: grade + stars */}
      <div className="flex flex-col items-end flex-shrink-0">
        <span className="text-gray-300 text-lg font-mono font-semibold">{problem.grade}</span>
        {problem.rating !== null && (
          <span className="text-yellow-500 text-sm">
            {'★'.repeat(problem.rating)}
          </span>
        )}
      </div>
    </button>
  )
}
