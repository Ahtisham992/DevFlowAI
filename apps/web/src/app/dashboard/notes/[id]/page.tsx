'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Loader2, Tag, X, Clock, RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import debounce from 'lodash.debounce';
import api from '@/lib/axios';

// Dynamically import MDEditor to avoid SSR window errors
const MDEditor = dynamic(
    () => import('@uiw/react-md-editor').then((mod) => mod.default),
    { ssr: false, loading: () => <div className="h-[600px] animate-pulse bg-muted rounded-xl" /> }
);

interface Note {
    id: string;
    title: string;
    content?: string;
    tags: string[];
    updatedAt: string;
}

interface NoteVersion {
    id: string;
    title: string;
    content?: string;
    createdAt: string;
}

export default function NoteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { theme } = useTheme();
    const id = params?.id as string;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle');

    // Fetch note
    const { data: note, isLoading } = useQuery({
        queryKey: ['note', id],
        queryFn: async () => {
            const { data } = await api.get<Note>(`/notes/${id}`);
            return data;
        },
    });

    // Fetch versions
    const { data: versions = [] } = useQuery({
        queryKey: ['note', id, 'versions'],
        queryFn: async () => {
            const { data } = await api.get<NoteVersion[]>(`/notes/${id}/versions`);
            return data;
        },
    });

    // Populate initial state
    useEffect(() => {
        if (note && saveStatus === 'idle') {
            setTitle(note.title || '');
            setContent(note.content || '');
            setTags(note.tags || []);
            setSaveStatus('saved');
        }
    }, [note]);

    // Mutation to save note
    const saveMutation = useMutation({
        mutationFn: async (payload: { title: string; content: string; tags: string[] }) => {
            await api.patch(`/notes/${id}`, payload);
        },
        onSuccess: () => {
            setSaveStatus('saved');
            // Refetch versions list since a new one was just created
            queryClient.invalidateQueries({ queryKey: ['note', id, 'versions'] });
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
        onError: () => {
            setSaveStatus('error');
        },
    });

    // Keyboard shortcut for manual save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveMutation.mutate({ title, content, tags });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [title, content, tags, saveMutation]);

    // Debounced save
    const debouncedSave = useMemo(
        () =>
            debounce((newTitle: string, newContent: string, newTags: string[]) => {
                saveMutation.mutate({ title: newTitle, content: newContent, tags: newTags });
            }, 1000),
        [saveMutation]
    );

    // Handlers
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        setSaveStatus('saving');
        debouncedSave(newTitle, content, tags);
    };

    const handleContentChange = (val?: string) => {
        const newContent = val || '';
        setContent(newContent);
        setSaveStatus('saving');
        debouncedSave(title, newContent, tags);
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim() !== '') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (!tags.includes(newTag)) {
                const newTags = [...tags, newTag];
                setTags(newTags);
                setSaveStatus('saving');
                debouncedSave(title, content, newTags);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = tags.filter((t) => t !== tagToRemove);
        setTags(newTags);
        setSaveStatus('saving');
        debouncedSave(title, content, newTags);
    };

    const handleRestoreVersion = (version: NoteVersion) => {
        setTitle(version.title);
        setContent(version.content || '');
        setSaveStatus('saving');
        debouncedSave(version.title, version.content || '', tags);
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Editor Area */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/notes')}
                        className="p-2 hover:bg-muted rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    <input
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Note Title"
                        className="text-3xl font-bold bg-transparent border-none outline-none flex-1 placeholder:text-muted-foreground focus:ring-0"
                    />

                    {/* Save Status Indicator */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {saveStatus === 'saving' && (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        )}
                        {saveStatus === 'saved' && (
                            <>
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Saved</span>
                            </>
                        )}
                        {saveStatus === 'error' && (
                            <span className="text-red-500">Failed to save</span>
                        )}
                    </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap ml-12">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs font-medium"
                        >
                            {tag}
                            <button
                                onClick={() => handleRemoveTag(tag)}
                                className="text-muted-foreground hover:text-foreground rounded-full p-0.5 hover:bg-background transition"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Add tag..."
                        className="text-xs bg-transparent border-none outline-none w-24 focus:ring-0"
                    />
                </div>

                {/* Markdown Editor */}
                <div data-color-mode={theme === 'dark' ? 'dark' : 'light'} className="mt-4 border rounded-xl overflow-hidden shadow-sm">
                    <MDEditor
                        value={content}
                        onChange={handleContentChange}
                        height={650}
                        preview="live"
                        className="!border-none"
                    />
                </div>
            </div>

            {/* Version History Sidebar */}
            <div className="w-full md:w-72 border-l pl-6 space-y-4">
                <div className="flex items-center gap-2 font-semibold">
                    <Clock className="w-4 h-4" />
                    <h3>Version History</h3>
                </div>
                
                {versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No versions yet.</p>
                ) : (
                    <div className="space-y-3 pr-2 h-[800px] overflow-y-auto">
                        {versions.map((version) => (
                            <div key={version.id} className="p-3 border rounded-lg bg-card hover:bg-muted transition text-sm space-y-2">
                                <p className="font-medium truncate">{version.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(version.createdAt).toLocaleString()}
                                </p>
                                <div className="flex justify-end mt-2">
                                    <button 
                                        onClick={() => handleRestoreVersion(version)}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Restore
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
