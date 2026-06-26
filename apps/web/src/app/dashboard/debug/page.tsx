'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { 
    Bug, 
    AlertTriangle, 
    Lightbulb, 
    CheckCircle2,
    Loader2,
    Play
} from 'lucide-react';
import api from '@/lib/axios';

interface DebugResult {
    rootCause: string;
    solution: string;
    fixedCode: string;
}

export default function DebugPage() {
    const [code, setCode] = useState('// Paste broken code here...\nfunction calculateTotal(items) {\n  let total = 0;\n  for(let i=0; i<=items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}');
    const [errorMessage, setErrorMessage] = useState('TypeError: Cannot read properties of undefined (reading \'price\')');
    const [selectedModel, setSelectedModel] = useState('llama3');
    const [isDebugging, setIsDebugging] = useState(false);
    const [result, setResult] = useState<DebugResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { data: models = [] } = useQuery({
        queryKey: ['models'],
        queryFn: async () => {
            const { data } = await api.get<{ name: string }[]>('/ai/models');
            return data.filter(m => m.name.toLowerCase().includes('llama'));
        },
    });

    const handleDebug = async () => {
        if (!code.trim() || !errorMessage.trim()) return;
        setIsDebugging(true);
        setError(null);
        setResult(null);

        try {
            const { data } = await api.post<DebugResult>('/ai/debug', {
                code,
                errorMessage,
                model: selectedModel
            });
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to debug code. Ensure Ollama is running and returning valid JSON.');
        } finally {
            setIsDebugging(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Bug className="w-8 h-8 text-primary" />
                        AI Debugger
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Paste your broken code and the error stack trace to get an instant root cause and fix.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="flex-1 sm:flex-none text-sm bg-background border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
                        disabled={isDebugging}
                    >
                        {models.map((m) => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                        {models.length === 0 && <option value="llama3">llama3 (Default)</option>}
                    </select>
                    
                    <button
                        onClick={handleDebug}
                        disabled={isDebugging || !code.trim() || !errorMessage.trim()}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                    >
                        {isDebugging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {isDebugging ? 'Debugging...' : 'Debug Code'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 min-h-[1000px] lg:min-h-[600px] lg:h-[calc(100vh-200px)]">
                {/* Input Panel */}
                <div className="flex flex-col gap-4">
                    <div className="border rounded-xl overflow-hidden flex flex-col bg-card shadow-sm h-[400px] lg:h-3/5">
                        <div className="bg-muted px-4 py-2 border-b text-sm font-medium flex items-center gap-2">
                            <CodeMirror className="w-4 h-4" />
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
                    
                    <div className="border rounded-xl overflow-hidden flex flex-col bg-card shadow-sm h-[250px] lg:h-2/5">
                        <div className="bg-destructive/10 text-destructive px-4 py-2 border-b border-destructive/20 text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Error Message / Stack Trace
                        </div>
                        <textarea
                            value={errorMessage}
                            onChange={(e) => setErrorMessage(e.target.value)}
                            className="flex-1 w-full p-4 text-sm font-mono bg-destructive/5 text-destructive resize-none focus:outline-none custom-scrollbar"
                            placeholder="Paste the stack trace or error message here..."
                        />
                    </div>
                </div>

                {/* Results Panel */}
                <div className="border rounded-xl flex flex-col bg-card shadow-sm overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b text-sm font-medium">
                        Debug Results
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-muted/10 custom-scrollbar">
                        {error && (
                            <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-start gap-3 border border-destructive/20">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="text-sm">{error}</div>
                            </div>
                        )}

                        {!isDebugging && !result && !error && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                                <Bug className="w-16 h-16 mb-4" />
                                <p>Provide code and error, then click Debug Code.</p>
                            </div>
                        )}

                        {isDebugging && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                                    <Loader2 className="w-12 h-12 animate-spin text-primary relative" />
                                </div>
                                <p className="animate-pulse">AI is investigating the issue...</p>
                            </div>
                        )}

                        {result && !isDebugging && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Root Cause */}
                                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 shadow-sm text-destructive">
                                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        Root Cause
                                    </h3>
                                    <p className="text-sm leading-relaxed opacity-90">
                                        {result.rootCause}
                                    </p>
                                </div>

                                {/* Solution */}
                                <div className="bg-background border rounded-xl p-5 shadow-sm">
                                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                                        Solution
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {result.solution}
                                    </p>
                                </div>

                                {/* Fixed Code */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2 px-1">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        Fixed Code
                                    </h3>
                                    <div className="border rounded-xl overflow-hidden shadow-sm">
                                        <CodeMirror
                                            value={result.fixedCode}
                                            theme="dark"
                                            extensions={[javascript({ jsx: true, typescript: true })]}
                                            readOnly
                                            className="text-sm"
                                            basicSetup={{ lineNumbers: true }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
