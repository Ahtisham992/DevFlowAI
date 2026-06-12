'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Bot, User, PlusCircle, MessageSquare, Loader2, Square } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

interface Conversation {
    id: string;
    title: string;
    model: string;
    updatedAt: string;
}

interface Message {
    id?: string;
    role: string;
    content: string;
}

const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
};

export default function ChatPage() {
    const queryClient = useQueryClient();
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [selectedModel, setSelectedModel] = useState('llama3');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Fetch conversations list
    const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const { data } = await api.get<Conversation[]>('/ai/conversations');
            return data;
        },
    });

    // Fetch models list
    const { data: models = [] } = useQuery({
        queryKey: ['models'],
        queryFn: async () => {
            const { data } = await api.get<{ name: string }[]>('/ai/models');
            return data;
        },
    });

    // Fetch messages when conversationId changes
    useEffect(() => {
        if (conversationId) {
            api.get<Message[]>(`/ai/conversations/${conversationId}/messages`).then((res) => {
                setMessages(res.data);
            });
        } else {
            setMessages([]);
        }
    }, [conversationId]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return;
        
        const currentInput = input;
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: currentInput }]);
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
        setIsStreaming(true);

        abortControllerRef.current = new AbortController();

        try {
            const token = getCookie('accessToken');
            const res = await fetch('http://localhost:3001/ai/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: currentInput, conversationId, model: selectedModel }),
                signal: abortControllerRef.current.signal,
            });

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(Boolean);

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.substring(6);
                        if (dataStr === '[DONE]') {
                            break;
                        }
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.conversationId && !conversationId) {
                                setConversationId(data.conversationId);
                                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                            }
                            if (data.content) {
                                setMessages((prev) => {
                                    const newMsgs = [...prev];
                                    const lastIndex = newMsgs.length - 1;
                                    if (newMsgs[lastIndex]) {
                                        newMsgs[lastIndex] = {
                                            ...newMsgs[lastIndex],
                                            content: newMsgs[lastIndex].content + data.content
                                        };
                                    }
                                    return newMsgs;
                                });
                            }
                        } catch (e) {
                            console.error('SSE Parse Error', e);
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Stream aborted');
            } else {
                console.error('Streaming error', error);
            }
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const handleNewChat = () => {
        handleStop();
        setConversationId(null);
    };

    return (
        <div className="flex h-full border rounded-xl overflow-hidden bg-card">
            {/* Sidebar */}
            <div className="w-64 border-r flex flex-col bg-muted/30">
                <div className="p-4 border-b">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition shadow-sm"
                    >
                        <PlusCircle className="w-4 h-4" />
                        New Chat
                    </button>
                    
                    <div className="mt-4">
                        <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Model</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            disabled={!!conversationId}
                            className="w-full text-sm bg-background border rounded-md px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        >
                            {models.map((m) => (
                                <option key={m.name} value={m.name}>{m.name}</option>
                            ))}
                            {models.length === 0 && <option value="llama3">llama3 (Default)</option>}
                        </select>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {isLoadingConversations ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setConversationId(conv.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg text-sm text-left transition",
                                    conversationId === conv.id
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-muted text-muted-foreground"
                                )}
                            >
                                <MessageSquare className="w-4 h-4 shrink-0" />
                                <span className="truncate">{conv.title || 'New Conversation'}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col relative">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                        <Bot className="w-16 h-16 mb-4 opacity-20" />
                        <h2 className="text-xl font-semibold mb-2 text-foreground">DevFlow AI Assistant</h2>
                        <p className="text-center max-w-md">
                            I am connected to your local Ollama instance running Llama 3. Ask me anything about your code, projects, or architecture!
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn("flex gap-4 max-w-4xl mx-auto", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                    msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border"
                                )}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "px-4 py-3 rounded-2xl max-w-[80%]",
                                    msg.role === 'user' 
                                        ? "bg-primary text-primary-foreground" 
                                        : "bg-muted/50 border text-foreground prose prose-sm dark:prose-invert max-w-full"
                                )}>
                                    {msg.role === 'user' ? (
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    ) : (
                                        <ReactMarkdown
                                            components={{
                                                code({node, inline, className, children, ...props}: any) {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            style={vscDarkPlus as any}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            className="rounded-lg !my-2 border"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className="bg-muted-foreground/20 px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {msg.content || '...'}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-background border-t">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="max-w-4xl mx-auto relative flex items-end gap-2"
                    >
                        <div className="flex-1 relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask DevFlow AI..."
                                className="w-full resize-none rounded-xl border bg-card px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary min-h-[52px] max-h-[200px]"
                                rows={1}
                            />
                        </div>
                        <div className="flex gap-2">
                            {isStreaming ? (
                                <button
                                    type="button"
                                    onClick={handleStop}
                                    className="bg-destructive text-destructive-foreground p-3 rounded-xl hover:opacity-90 transition shrink-0 h-[52px] w-[52px] flex items-center justify-center shadow-sm"
                                    title="Stop generating"
                                >
                                    <Square className="w-5 h-5 fill-current" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="bg-primary text-primary-foreground p-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 shrink-0 h-[52px] w-[52px] flex items-center justify-center shadow-sm"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
