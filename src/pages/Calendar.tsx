const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Calendar() {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => <div key={d} className="text-center font-semibold text-sm py-2">{d}</div>)}
        {Array.from({ length: daysInMonth }, (_, i) => (
          <div key={i + 1} className="border rounded p-2 h-20 text-sm hover:bg-indigo-50 cursor-pointer">
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
