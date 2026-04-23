import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import KanbanBoard from './pages/KanbanBoard';
import Calendar from './pages/Calendar';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow px-6 py-3 flex gap-4">
          <Link to="/" className="font-semibold text-indigo-600">Board</Link>
          <Link to="/calendar" className="font-semibold text-gray-600 hover:text-indigo-600">Calendar</Link>
        </nav>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<KanbanBoard />} />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
