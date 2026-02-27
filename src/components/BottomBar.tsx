export default function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-4 py-3 flex items-center justify-around">
      <button className="text-gray-400 text-xs flex flex-col items-center gap-1">
        <span className="text-lg">🔍</span>
        <span>Search</span>
      </button>
      <button className="text-gray-400 text-xs flex flex-col items-center gap-1">
        <span className="text-lg">⚙️</span>
        <span>Filter</span>
      </button>
      <button className="text-gray-400 text-xs flex flex-col items-center gap-1">
        <span className="text-lg">🖼️</span>
        <span>Wall</span>
      </button>
      <button className="text-gray-400 text-xs flex flex-col items-center gap-1">
        <span className="text-lg">⭐</span>
        <span>Saved</span>
      </button>
      <button className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold">
        +
      </button>
    </div>
  )
}
