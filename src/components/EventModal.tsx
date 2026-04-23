import { useState, useEffect, type FormEvent } from 'react';
import type { CalendarEvent, CalendarEventInsert, CalendarEventUpdate } from '../types/database';

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  defaultDate?: string; // ISO date string for pre-filling start date
  onClose: () => void;
  onSave: (data: Omit<CalendarEventInsert, 'project_id'> | CalendarEventUpdate) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const COLOR_OPTIONS = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ec4899', label: 'Pink' },
];

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export default function EventModal({ event, isOpen, defaultDate, onClose, onSave, onDelete }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);

  const isEditing = event !== null;

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? '');
      setAllDay(event.all_day);
      setStartDate(event.all_day ? toDateOnly(event.start_date) : toDatetimeLocal(event.start_date));
      setEndDate(event.all_day ? toDateOnly(event.end_date) : toDatetimeLocal(event.end_date));
      setColor(event.color ?? '#6366f1');
    } else {
      setTitle('');
      setDescription('');
      setAllDay(false);
      const dateStr = defaultDate ?? new Date().toISOString().slice(0, 10);
      setStartDate(`${dateStr}T09:00`);
      setEndDate(`${dateStr}T10:00`);
      setColor('#6366f1');
    }
  }, [event, isOpen, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const startIso = allDay ? `${startDate}T00:00:00` : startDate;
    const endIso = allDay ? `${endDate}T23:59:59` : endDate;

    const data = {
      title,
      description: description || null,
      start_date: new Date(startIso).toISOString(),
      end_date: new Date(endIso).toISOString(),
      all_day: allDay,
      color,
    };

    await onSave(data);
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!event || !onDelete) return;
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setSaving(true);
    await onDelete(event.id);
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Edit event' : 'New event'}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="event-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Event name"
              aria-label="Event title"
            />
          </div>

          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="event-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Add details..."
              aria-label="Event description"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="event-all-day"
              type="checkbox"
              checked={allDay}
              onChange={(e) => {
                setAllDay(e.target.checked);
                if (e.target.checked) {
                  setStartDate(startDate.slice(0, 10));
                  setEndDate(endDate.slice(0, 10));
                } else {
                  setStartDate(`${startDate.slice(0, 10)}T09:00`);
                  setEndDate(`${endDate.slice(0, 10)}T10:00`);
                }
              }}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              aria-label="All day event"
            />
            <label htmlFor="event-all-day" className="text-sm text-gray-700">
              All day
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-start" className="block text-sm font-medium text-gray-700 mb-1">
                Start
              </label>
              <input
                id="event-start"
                type={allDay ? 'date' : 'datetime-local'}
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="Start date"
              />
            </div>

            <div>
              <label htmlFor="event-end" className="block text-sm font-medium text-gray-700 mb-1">
                End
              </label>
              <input
                id="event-end"
                type={allDay ? 'date' : 'datetime-local'}
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="End date"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.value ? 'border-gray-900 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  aria-label={`Color: ${c.label}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                aria-label="Delete event"
              >
                Delete event
              </button>
            ) : (
              <span />
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isEditing ? 'Save changes' : 'Create event'}
              >
                {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
