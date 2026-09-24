export default function ProgressBar({ percent = 0 }) {
  const safePercent = Math.max(0, Math.min(100, percent))

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span>Progress</span>
        <span className="font-semibold text-gray-700">{safePercent}%</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-600 rounded-full transition-all duration-500"
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  )
}
