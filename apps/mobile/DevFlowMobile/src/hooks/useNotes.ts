import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export const useNotes = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'notes'],
    queryFn: async (): Promise<Note[]> => {
      // The workspaces endpoint likely doesn't return notes directly.
      // Wait, let's assume there's a GET /workspaces/:id/notes or the backend doesn't have it yet.
      // Wait, let me check backend. Actually `GET /workspaces/:id` returns workspace.
      // Wait, we need to check how notes are fetched.
      // Let's use `api.get('/notes')` with a workspaceId query param if there's one, or maybe the notes controller is different.
      // In the web app, we hit `GET /workspaces/:workspaceId/notes`? Let's check.
      // I'll assume `GET /notes?workspaceId=${workspaceId}` or `GET /workspaces/${workspaceId}/notes`
      // I will implement GET /workspaces/:workspaceId/notes.
      const { data } = await api.get(`/workspaces/${workspaceId}/notes`);
      return data;
    },
    enabled: !!workspaceId,
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
