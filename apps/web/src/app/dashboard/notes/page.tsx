'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, Trash2, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface Note {
    id: string;
    title: string;
    content?: string;
    tags: string[];
    projectId?: string;
    updatedAt: string;
}

export default function NotesPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [activeTag, setActiveTag] = useState('');

    const { data: notes = [], isLoading } = useQuery({
        queryKey: ['notes', search, activeTag],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (activeTag) params.append('tag', activeTag);
            const { data } = await api.get<Note[]>(`/notes?${params.toString()}`);
            return data;
        },
    });

    const allTags = [...new Set(notes.flatMap((n) => n.tags))];

    const createMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/notes', { title, content: '', tags: [] });
            return data;
        },
        onSuccess: (note) => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            setShowModal(false);
            setTitle('');
            router.push(`/dashboard/notes/${note.id}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/notes/${id}`),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['notes'] });
            const previous = queryClient.getQueryData(['notes']);
            queryClient.setQueryData(['notes', search, activeTag], (old: Note[]) =>
                old.filter((n) => n.id !== id),
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            queryClient.setQueryData(['notes'], context?.previous);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Notes</h1>
                    <p className="text-muted-foreground text-sm">
                        Your markdown knowledge base
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition"
                >
                    <Plus className="w-4 h-4" />
                    New Note
                </button>
            </div>

            {/* Search */}
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Tags filter */}
            {allTags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setActiveTag('')}
                        className={`px-3 py-1 rounded-full text-xs border transition ${activeTag === '' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                        All
                    </button>
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition ${activeTag === tag ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                        >
                            <Tag className="w-3 h-3" />
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Notes grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-xl p-4 h-32 animate-pulse bg-muted" />
                    ))}
                </div>
            ) : notes.length === 0 ? (
                <div className="border rounded-xl p-12 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No notes yet</p>
                    <p className="text-sm mt-1">Create your first note to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                            className="border rounded-xl p-4 space-y-3 hover:shadow-sm transition cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <h3 className="font-semibold text-sm">{note.title}</h3>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteMutation.mutate(note.id);
                                    }}
                                    className="text-muted-foreground hover:text-red-500 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {note.content && (
                                <p className="text-xs text-muted-foreground line-clamp-3">
                                    {note.content.replace(/[#*`]/g, '')}
                                </p>
                            )}
                            {note.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    {note.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 rounded-full bg-muted text-xs"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background border rounded-xl p-6 w-full max-w-md space-y-4">
                        <h2 className="text-lg font-bold">New Note</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="My note title"
                                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                onKeyDown={(e) => e.key === 'Enter' && createMutation.mutate()}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => createMutation.mutate()}
                                disabled={!title || createMutation.isPending}
                                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                            >
                                {createMutation.isPending ? 'Creating...' : 'Create & Open'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}