export default function Rating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button 
          key={i} 
          onClick={() => onChange(i)} 
          className={`text-2xl ${value >= i ? "text-yellow-400" : "text-gray-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
