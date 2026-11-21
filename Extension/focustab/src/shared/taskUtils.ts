import { Task } from './schema';

export function generateTaskId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function createTask(text: string): Task {
  return {
    id: generateTaskId(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}

export function toggleTaskCompletion(task: Task): Task {
  return {
    ...task,
    completed: !task.completed,
    completedAt: !task.completed ? new Date().toISOString() : null,
  };
}

export const MAX_TASK_LENGTH = 120;
export const MAX_ACTIVE_TASKS = 50;
