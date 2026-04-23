import { createContext, useContext } from 'react';
import type { Project } from '../types/database';

interface ProjectContextValue {
  project: Project | null;
  projectId: string | null;
  loading: boolean;
  error: string | null;
}

export const ProjectContext = createContext<ProjectContextValue>({
  project: null,
  projectId: null,
  loading: true,
  error: null,
});

export function useProject(): ProjectContextValue {
  return useContext(ProjectContext);
}
