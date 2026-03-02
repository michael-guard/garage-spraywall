import { useNavigate } from 'react-router-dom'

interface BottomBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onFilterOpen: () => void
  isSavedActive: boolean
  onSavedToggle: () => void
}

export default function BottomBar({
  searchValue,
  onSearchChange,
  onFilterOpen,
  isSavedActive,
  onSavedToggle,
}: BottomBarProps) {
  const navigate = useNavigate()

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-3 pt-2 z-30" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      {/* Search input */}
      <div className="relative mb-2">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" aria-hidden="true">🔍</span>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          aria-label="Search problems"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Buttons row */}
      <div className="flex items-center justify-around">
        {/* Wall photo uploader */}
        <button onClick={() => navigate('/wall')} className="text-gray-400 p-2" aria-label="Wall photos">
          <svg viewBox="0 0 640 640" className="w-6 h-6" fill="currentColor" aria-hidden="true">
            <path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM224 176C250.5 176 272 197.5 272 224C272 250.5 250.5 272 224 272C197.5 272 176 250.5 176 224C176 197.5 197.5 176 224 176zM368 288C376.4 288 384.1 292.4 388.5 299.5L476.5 443.5C481 450.9 481.2 460.2 477 467.8C472.8 475.4 464.7 480 456 480L184 480C175.1 480 166.8 475 162.7 467.1C158.6 459.2 159.2 449.6 164.3 442.3L220.3 362.3C224.8 355.9 232.1 352.1 240 352.1C247.9 352.1 255.2 355.9 259.7 362.3L286.1 400.1L347.5 299.6C351.9 292.5 359.6 288.1 368 288.1z"/>
          </svg>
        </button>

        {/* Saved / favorites toggle */}
        <button
          onClick={onSavedToggle}
          aria-label={isSavedActive ? 'Show all problems' : 'Show saved only'}
          aria-pressed={isSavedActive}
          className={`p-2 ${isSavedActive ? 'text-yellow-400' : 'text-gray-400'}`}
        >
          <svg viewBox="0 0 640 640" className="w-6 h-6" fill="currentColor" aria-hidden="true">
            <path d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"/>
          </svg>
        </button>

        {/* Filter */}
        <button onClick={onFilterOpen} className="text-gray-400 p-2" aria-label="Filters">
          <svg viewBox="0 0 640 640" className="w-6 h-6" fill="currentColor" aria-hidden="true">
            <path d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z"/>
          </svg>
        </button>

        {/* Create problem */}
        <button
          onClick={() => navigate('/problems/new')}
          aria-label="Create new problem"
          className="text-blue-500 p-2 flex-shrink-0"
        >
          <svg viewBox="0 0 640 640" className="w-8 h-8" fill="currentColor" aria-hidden="true">
            <path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM296 408L296 344L232 344C218.7 344 208 333.3 208 320C208 306.7 218.7 296 232 296L296 296L296 232C296 218.7 306.7 208 320 208C333.3 208 344 218.7 344 232L344 296L408 296C421.3 296 432 306.7 432 320C432 333.3 421.3 344 408 344L344 344L344 408C344 421.3 333.3 432 320 432C306.7 432 296 421.3 296 408z"/>
          </svg>
        </button>
      </div>
    </nav>
  )
}
