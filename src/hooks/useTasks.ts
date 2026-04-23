import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Task, TaskInsert, TaskUpdate, TaskStatus } from '../types/database';

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (task: Omit<TaskInsert, 'project_id'>) => Promise<Task | null>;
  updateTask: (id: string, updates: TaskUpdate) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  moveTask: (id: string, status: TaskStatus, sortOrder: number) => Promise<boolean>;
  reorderTasks: (updates: Array<{ id: string; sort_order: number; status: TaskStatus }>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useTasks(projectId: string | null): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTasks(data ?? []);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Realtime subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          // Re-fetch on any change to keep state consistent
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchTasks]);

  const createTask = useCallback(async (task: Omit<TaskInsert, 'project_id'>): Promise<Task | null> => {
    if (!projectId) return null;

    const { data, error: insertError } = await supabase
      .from('tasks')
      .insert({ ...task, project_id: projectId })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }

    setTasks((prev) => [...prev, data]);
    return data;
  }, [projectId]);

  const updateTask = useCallback(async (id: string, updates: TaskUpdate): Promise<Task | null> => {
    const { data, error: updateError } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return null;
    }

    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setTasks((prev) => prev.filter((t) => t.id !== id));
    return true;
  }, []);

  const moveTask = useCallback(async (id: string, status: TaskStatus, sortOrder: number): Promise<boolean> => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, sort_order: sortOrder } : t))
    );

    const { error: moveError } = await supabase
      .from('tasks')
      .update({ status, sort_order: sortOrder })
      .eq('id', id);

    if (moveError) {
      setError(moveError.message);
      await fetchTasks(); // Revert on error
      return false;
    }
    return true;
  }, [fetchTasks]);

  const reorderTasks = useCallback(
    async (updates: Array<{ id: string; sort_order: number; status: TaskStatus }>): Promise<boolean> => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => {
          const update = updates.find((u) => u.id === t.id);
          return update ? { ...t, status: update.status, sort_order: update.sort_order } : t;
        })
      );

      // Batch update via individual calls (Supabase doesn't support batch upsert well for RLS)
      const results = await Promise.all(
        updates.map((u) =>
          supabase
            .from('tasks')
            .update({ status: u.status, sort_order: u.sort_order })
            .eq('id', u.id)
        )
      );

      const failed = results.find((r) => r.error);
      if (failed?.error) {
        setError(failed.error.message);
        await fetchTasks();
        return false;
      }
      return true;
    },
    [fetchTasks]
  );

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
    refetch: fetchTasks,
  };
}
