'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { 
    Code, 
    AlertCircle, 
    CheckCircle2, 
    Lightbulb, 
    Activity,
    Loader2,
    Play
} from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

interface AnalysisIssue {
    type: 'bug' | 'security' | 'performance' | 'style';
    description: string;
    line: number | string;
}

interface AnalysisResult {
    summary: string;
    issues: AnalysisIssue[];
    suggestions: string[];
    complexity: string;
}

export default function CodeAnalysisPage() {
    const [code, setCode] = useState('// Paste your code here...\nfunction calculateTotal(items) {\n  let total = 0;\n  for(let i=0; i<=items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}');
    const [selectedModel, setSelectedModel] = useState('llama3');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch models list
    const { data: models = [] } = useQuery({
        queryKey: ['models'],
        queryFn: async () => {
            const { data } = await api.get<{ name: string }[]>('/ai/models');
            return data;
        },
    });

    const handleAnalyze = async () => {
        if (!code.trim()) return;
        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const { data } = await api.post<AnalysisResult>('/ai/analyze-code', {
                code,
                model: selectedModel
            });
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to analyze code. Make sure Ollama is running and returning valid JSON.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getIssueIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'bug': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'security': return <AlertCircle className="w-4 h-4 text-orange-500" />;
            case 'performance': return <Activity className="w-4 h-4 text-blue-500" />;
            default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getIssueColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'bug': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'security': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'performance': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Code className="w-8 h-8 text-primary" />
                        AI Code Analysis
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Paste your code below to get instant feedback, bug detection, and optimization suggestions.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="text-sm bg-background border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
                        disabled={isAnalyzing}
                    >
                        {models.map((m) => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                        {models.length === 0 && <option value="llama3">llama3 (Default)</option>}
                    </select>
                    
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !code.trim()}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                {/* Editor Panel */}
                <div className="border rounded-xl overflow-hidden flex flex-col bg-card shadow-sm">
                    <div className="bg-muted px-4 py-2 border-b text-sm font-medium flex items-center justify-between">
                        Source Code
                        <span className="text-xs text-muted-foreground font-normal">JavaScript / TypeScript</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
                        <CodeMirror
                            value={code}
                            height="100%"
                            theme="dark"
                            extensions={[javascript({ jsx: true, typescript: true })]}
                            onChange={(val) => setCode(val)}
                            className="text-sm"
                            basicSetup={{
                                lineNumbers: true,
                                highlightActiveLineGutter: true,
                                foldGutter: true,
                            }}
                        />
                    </div>
                </div>

                {/* Results Panel */}
                <div className="border rounded-xl flex flex-col bg-card shadow-sm overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b text-sm font-medium">
                        Analysis Results
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
                        {error && (
                            <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-start gap-3 border border-destructive/20">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="text-sm">{error}</div>
                            </div>
                        )}

                        {!isAnalyzing && !result && !error && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                                <Code className="w-16 h-16 mb-4" />
                                <p>Enter code and click analyze to see results</p>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                                    <Loader2 className="w-12 h-12 animate-spin text-primary relative" />
                                </div>
                                <p className="animate-pulse">AI is reviewing your code...</p>
                            </div>
                        )}

                        {result && !isAnalyzing && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Summary Card */}
                                <div className="bg-background border rounded-xl p-5 shadow-sm">
                                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        Summary
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {result.summary}
                                    </p>
                                </div>

                                {/* Issues */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2 px-1">
                                        <AlertCircle className="w-5 h-5" />
                                        Detected Issues
                                        <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full ml-auto">
                                            {result.issues.length} found
                                        </span>
                                    </h3>
                                    
                                    {result.issues.length === 0 ? (
                                        <div className="bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl p-4 text-sm flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            No critical issues detected. Great job!
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {result.issues.map((issue, idx) => (
                                                <div key={idx} className={cn("border rounded-lg p-4 flex gap-3", getIssueColor(issue.type))}>
                                                    <div className="mt-0.5 shrink-0">{getIssueIcon(issue.type)}</div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold capitalize text-sm">{issue.type}</span>
                                                            {issue.line && (
                                                                <span className="text-xs opacity-70">Line: {issue.line}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm opacity-90">{issue.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Suggestions */}
                                {result.suggestions && result.suggestions.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold flex items-center gap-2 px-1">
                                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                                            Suggestions
                                        </h3>
                                        <div className="bg-background border rounded-xl overflow-hidden">
                                            {result.suggestions.map((suggestion, idx) => (
                                                <div key={idx} className="p-4 border-b last:border-0 flex gap-3 text-sm">
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium text-xs">
                                                        {idx + 1}
                                                    </div>
                                                    <p className="text-muted-foreground mt-0.5 leading-relaxed">{suggestion}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Complexity */}
                                {result.complexity && (
                                    <div className="bg-background border rounded-xl p-4 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-blue-500" />
                                            <span className="font-medium">Time Complexity</span>
                                        </div>
                                        <span className="font-mono text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg">
                                            {result.complexity}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
