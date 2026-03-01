const GRADES = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10']

const TAGS = [
  'Compression', 'Crimpy', 'Cut Feet', 'Dead Point',
  'Dyno', 'Juggy', 'Layback', 'Lock Off',
  'Pinchy', 'Pocket', 'Powerful', 'Pumpy',
  'Reachy', 'Slopey', 'Technical', 'Undercling',
]

interface MetadataFormProps {
  name: string
  onNameChange: (name: string) => void
  grade: string
  onGradeChange: (grade: string) => void
  tags: string[]
  onTagsChange: (tags: string[]) => void
  startType: 'sit' | 'stand'
  onStartTypeChange: (type: 'sit' | 'stand') => void
  status: 'project' | 'sent'
  onStatusChange: (status: 'project' | 'sent') => void
  rating: number | null
  onRatingChange: (rating: number | null) => void
}

export default function MetadataForm({
  name,
  onNameChange,
  grade,
  onGradeChange,
  tags,
  onTagsChange,
  startType,
  onStartTypeChange,
  status,
  onStatusChange,
  rating,
  onRatingChange,
}: MetadataFormProps) {
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag))
    } else {
      onTagsChange([...tags, tag])
    }
  }

  return (
    <div className="p-4 space-y-6 overflow-y-auto">
      {/* Name */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Problem name"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Grade */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Grade *</label>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => onGradeChange(g)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                grade === g
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Style Tags (optional)</label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                tags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Start type */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Start Type</label>
        <div className="flex bg-gray-800 rounded-full p-1 w-fit">
          <button
            onClick={() => onStartTypeChange('sit')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              startType === 'sit' ? 'bg-blue-600 text-white' : 'text-gray-400'
            }`}
          >
            Sit
          </button>
          <button
            onClick={() => onStartTypeChange('stand')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              startType === 'stand' ? 'bg-blue-600 text-white' : 'text-gray-400'
            }`}
          >
            Stand
          </button>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Status</label>
        <div className="flex bg-gray-800 rounded-full p-1 w-fit">
          <button
            onClick={() => {
              onStatusChange('project')
              onRatingChange(null)
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === 'project' ? 'bg-blue-600 text-white' : 'text-gray-400'
            }`}
          >
            Project
          </button>
          <button
            onClick={() => onStatusChange('sent')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === 'sent' ? 'bg-blue-600 text-white' : 'text-gray-400'
            }`}
          >
            Sent
          </button>
        </div>
      </div>

      {/* Star rating (shown when sent) */}
      {status === 'sent' && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3].map((star) => (
              <button
                key={star}
                onClick={() => onRatingChange(rating === star ? null : star)}
                className="text-2xl w-10 h-10 flex items-center justify-center"
              >
                {rating !== null && star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
