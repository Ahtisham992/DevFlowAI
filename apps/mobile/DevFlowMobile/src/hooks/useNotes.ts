import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  projectId?: string;
}

export const useNotes = (projectId?: string) => {
  return useQuery({
    queryKey: ['notes', projectId],
    queryFn: async (): Promise<Note[]> => {
      const url = projectId ? `/notes?projectId=${projectId}` : '/notes';
      const { data } = await api.get(url);
      return data;
    },
  });
};

export const useNote = (noteId: string) => {
  return useQuery({
    queryKey: ['notes', noteId],
    queryFn: async (): Promise<Note> => {
      const { data } = await api.get(`/notes/${noteId}`);
      return data;
    },
    enabled: !!noteId,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteData: Partial<Note>) => {
      const { data } = await api.post('/notes', noteData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...noteData }: Partial<Note> & { id: string }) => {
      const { data } = await api.patch(`/notes/${id}`, noteData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/notes/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};

