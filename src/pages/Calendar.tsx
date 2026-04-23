import { useState, useMemo } from 'react';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { useProject } from '../hooks/useProject';
import EventModal from '../components/EventModal';
import type { CalendarEvent, CalendarEventInsert, CalendarEventUpdate } from '../types/database';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // getDay() returns 0=Sun, we want 0=Mon
  let startWeekday = firstDay.getDay() - 1;
  if (startWeekday < 0) startWeekday = 6;

  return { daysInMonth, startWeekday };
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function isEventOnDay(event: CalendarEvent, day: Date): boolean {
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
  return start <= dayEnd && end >= dayStart;
}

export default function Calendar() {
  const { projectId } = useProject();
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useCalendarEvents(projectId);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  const { daysInMonth, startWeekday } = useMemo(
    () => getMonthData(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const eventsForDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(viewYear, viewMonth, d);
      map[d] = events.filter((e) => isEventOnDay(e, day));
    }
    return map;
  }, [events, viewYear, viewMonth, daysInMonth]);

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setSelectedDate(undefined);
    setModalOpen(true);
  };

  const handleSaveEvent = async (data: Omit<CalendarEventInsert, 'project_id'> | CalendarEventUpdate) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, data as CalendarEventUpdate);
    } else {
      await createEvent(data as Omit<CalendarEventInsert, 'project_id'>);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Loading calendar">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading calendar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm" role="alert">
        Failed to load calendar: {error}
      </div>
    );
  }

  const isToday = (day: number) =>
    isSameDay(new Date(viewYear, viewMonth, day), today);

  return (
    <>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Calendar</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-800 min-w-[180px] text-center">
              {monthLabel}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="ml-2 px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
              aria-label="Go to today"
            >
              Today
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingEvent(null);
            setSelectedDate(undefined);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="New event"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Event
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 bg-gray-50">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: startWeekday }, (_, i) => (
            <div key={`empty-${i}`} className="border-b border-r border-gray-100 h-28 bg-gray-50/50" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayEvents = eventsForDay[day] ?? [];
            const todayClass = isToday(day);

            return (
              <div
                key={day}
                className="border-b border-r border-gray-100 h-28 p-1.5 cursor-pointer hover:bg-indigo-50/50 transition-colors group"
                onClick={() => handleDayClick(day)}
                role="button"
                tabIndex={0}
                aria-label={`${monthLabel} ${day}${dayEvents.length > 0 ? `, ${dayEvents.length} events` : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDayClick(day);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                      todayClass
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 group-hover:text-indigo-600'
                    }`}
                  >
                    {day}
                  </span>
                </div>

                <div className="space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, 3).map((evt) => (
                    <button
                      key={evt.id}
                      onClick={(e) => handleEventClick(evt, e)}
                      className="w-full text-left px-1.5 py-0.5 rounded text-xs font-medium truncate hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: `${evt.color ?? '#6366f1'}20`,
                        color: evt.color ?? '#6366f1',
                      }}
                      aria-label={`Event: ${evt.title}`}
                    >
                      {evt.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-xs text-gray-400 pl-1">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EventModal
        event={editingEvent}
        isOpen={modalOpen}
        defaultDate={selectedDate}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
          setSelectedDate(undefined);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </>
  );
}
