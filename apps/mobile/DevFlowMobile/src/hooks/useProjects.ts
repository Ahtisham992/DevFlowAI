import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export interface Project {
  id: string;
  name: string;
  description: string;
  framework: string;
  createdAt: string;
  repoUrl?: string;
}

export const useProjects = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'projects'],
    queryFn: async (): Promise<Project[]> => {
      const { data } = await api.get(`/workspaces/${workspaceId}`);
      // The workspaces endpoint returns the workspace with its projects included
      return data.projects || [];
    },
    enabled: !!workspaceId,
  });
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: async (): Promise<Project> => {
      const { data } = await api.get(`/projects/${projectId}`);
      return data;
    },
    enabled: !!projectId,
  });
};
