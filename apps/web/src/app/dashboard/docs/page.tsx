'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
    FileSignature,
    Loader2,
    Play,
    AlertCircle
} from 'lucide-react';
import api from '@/lib/axios';

interface DocsResult {
    documentation: string;
}

export default function DocsPage() {
    const [code, setCode] = useState('// Paste code to generate documentation...\n/**\n * Example function\n */\nfunction connectToDatabase(uri, options = {}) {\n  // connection logic\n  return db;\n}');
    const [selectedModel, setSelectedModel] = useState('llama3');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<DocsResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { data: models = [] } = useQuery({
        queryKey: ['models'],
        queryFn: async () => {
            const { data } = await api.get<{ name: string }[]>('/ai/models');
            return data;
        },
    });

    const handleGenerate = async () => {
        if (!code.trim()) return;
        setIsGenerating(true);
        setError(null);
        setResult(null);

        try {
            const { data } = await api.post<DocsResult>('/ai/generate-docs', {
                code,
                model: selectedModel
            });
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to generate docs. Ensure Ollama is running.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileSignature className="w-8 h-8 text-primary" />
                        Docs Generator
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Instantly generate beautiful markdown documentation for your code using AI.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="text-sm bg-background border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
                        disabled={isGenerating}
                    >
                        {models.map((m) => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                        {models.length === 0 && <option value="llama3">llama3 (Default)</option>}
                    </select>
                    
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !code.trim()}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {isGenerating ? 'Generating...' : 'Generate Docs'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                {/* Input Panel */}
                <div className="border rounded-xl overflow-hidden flex flex-col bg-card shadow-sm">
                    <div className="bg-muted px-4 py-2 border-b text-sm font-medium">
                        Source Code
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
                        <CodeMirror
                            value={code}
                            height="100%"
                            theme="dark"
                            extensions={[javascript({ jsx: true, typescript: true })]}
                            onChange={(val) => setCode(val)}
                            className="text-sm h-full"
                            basicSetup={{ lineNumbers: true }}
                        />
                    </div>
                </div>

                {/* Results Panel */}
                <div className="border rounded-xl flex flex-col bg-card shadow-sm overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b text-sm font-medium">
                        Generated Markdown
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-muted/10 custom-scrollbar">
                        {error && (
                            <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-start gap-3 border border-destructive/20">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="text-sm">{error}</div>
                            </div>
                        )}

                        {!isGenerating && !result && !error && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                                <FileSignature className="w-16 h-16 mb-4" />
                                <p>Provide code and click Generate Docs.</p>
                            </div>
                        )}

                        {isGenerating && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                                    <Loader2 className="w-12 h-12 animate-spin text-primary relative" />
                                </div>
                                <p className="animate-pulse">AI is writing documentation...</p>
                            </div>
                        )}

                        {result && !isGenerating && (
                            <div className="bg-background border rounded-xl p-6 shadow-sm prose prose-sm dark:prose-invert max-w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                                    {result.documentation}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
