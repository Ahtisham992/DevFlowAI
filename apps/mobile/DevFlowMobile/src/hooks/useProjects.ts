import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      return data.projects || [];
    },
    enabled: !!workspaceId,
  });
};

export const useAllProjects = () => {
  return useQuery({
    queryKey: ['projects', 'all'],
    queryFn: async (): Promise<Project[]> => {
      const { data } = await api.get('/projects');
      return data || [];
    },
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

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectData: Partial<Project> & { workspaceId: string }) => {
      const { data } = await api.post('/projects', projectData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...projectData }: Partial<Project> & { id: string }) => {
      const { data } = await api.patch(`/projects/${id}`, projectData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/projects/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
