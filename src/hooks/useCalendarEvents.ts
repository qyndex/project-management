import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CalendarEvent, CalendarEventInsert, CalendarEventUpdate } from '../types/database';

interface UseCalendarEventsResult {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  createEvent: (event: Omit<CalendarEventInsert, 'project_id'>) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, updates: CalendarEventUpdate) => Promise<CalendarEvent | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useCalendarEvents(projectId: string | null): UseCalendarEventsResult {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!projectId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setEvents(data ?? []);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Realtime subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`calendar_events:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchEvents]);

  const createEvent = useCallback(async (event: Omit<CalendarEventInsert, 'project_id'>): Promise<CalendarEvent | null> => {
    if (!projectId) return null;

    const { data, error: insertError } = await supabase
      .from('calendar_events')
      .insert({ ...event, project_id: projectId })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }

    setEvents((prev) => [...prev, data].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    ));
    return data;
  }, [projectId]);

  const updateEvent = useCallback(async (id: string, updates: CalendarEventUpdate): Promise<CalendarEvent | null> => {
    const { data, error: updateError } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return null;
    }

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? data : e)).sort(
        (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )
    );
    return data;
  }, []);

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setEvents((prev) => prev.filter((e) => e.id !== id));
    return true;
  }, []);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}
