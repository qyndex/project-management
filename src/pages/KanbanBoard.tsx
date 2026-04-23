import { DndContext, DragEndEvent, closestCenter, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { useState, useMemo } from 'react';
import Column from '../components/Column';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { useTasks } from '../hooks/useTasks';
import { useProject } from '../hooks/useProject';
import type { Task, TaskStatus, TaskInsert, TaskUpdate } from '../types/database';

const COLUMNS: Array<{ id: TaskStatus; label: string }> = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

export default function KanbanBoard() {
  const { projectId } = useProject();
  const { tasks, loading, error, createTask, updateTask, deleteTask, moveTask } = useTasks(projectId);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasksByColumn = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const task of tasks) {
      grouped[task.status].push(task);
    }
    // Sort within each column by sort_order
    for (const col of Object.keys(grouped) as TaskStatus[]) {
      grouped[col].sort((a, b) => a.sort_order - b.sort_order);
    }
    return grouped;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const targetColumn = String(over.id) as TaskStatus;
    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.status === targetColumn) return;

    // Place at end of target column
    const targetTasks = tasksByColumn[targetColumn];
    const newSortOrder = targetTasks.length > 0
      ? Math.max(...targetTasks.map((t) => t.sort_order)) + 1
      : 0;

    moveTask(String(active.id), targetColumn, newSortOrder);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = async (data: Omit<TaskInsert, 'project_id'> | TaskUpdate) => {
    if (editingTask) {
      await updateTask(editingTask.id, data as TaskUpdate);
    } else {
      const insertData = data as Omit<TaskInsert, 'project_id'>;
      // Set sort_order to end of the target column
      const status = insertData.status ?? 'todo';
      const colTasks = tasksByColumn[status];
      const sortOrder = colTasks.length > 0
        ? Math.max(...colTasks.map((t) => t.sort_order)) + 1
        : 0;
      await createTask({ ...insertData, sort_order: sortOrder });
    }
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Loading tasks">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm" role="alert">
        Failed to load tasks: {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Board</h1>
        <button
          onClick={handleCreateTask}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="New task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.label}
              count={tasksByColumn[col.id].length}
            >
              {tasksByColumn[col.id].map((task) => (
                <TaskCard key={task.id} task={task} onClick={handleEditTask} />
              ))}
            </Column>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="bg-white rounded-lg shadow-xl border border-indigo-200 p-3 w-64 rotate-3">
              <p className="text-sm font-medium text-gray-900">{activeTask.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        task={editingTask}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </>
  );
}
