import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async (): Promise<Workspace[]> => {
      const { data } = await api.get('/workspaces');
      return data;
    },
  });
};
