export default function Spinner({ size = 'md' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`${sizeMap[size]} border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin inline-block`}
    />
  )
}
