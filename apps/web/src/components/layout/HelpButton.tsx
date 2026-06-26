'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { HelpCircle, FolderGit2, FileText, Bot, Code, Activity, Search, BookOpen, Bug, MessageSquare } from 'lucide-react';

export function HelpButton() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <button
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50 hover:shadow-xl group"
                    title="Help & Guide"
                >
                    <HelpCircle className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                </button>
            </SheetTrigger>
            <SheetContent className="w-[85vw] sm:w-[500px] overflow-y-auto border-l shadow-2xl p-0">
                <div className="p-6 pb-0">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-primary" />
                            DevFlow AI Guide
                        </SheetTitle>
                    </SheetHeader>
                    <p className="text-muted-foreground leading-relaxed mb-8">
                        Welcome to your AI-powered developer workspace. Here's how to get the most out of our features.
                    </p>
                </div>
                
                <div className="px-6 pb-8 space-y-8">
                    {/* Workspaces Section */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                            <FolderGit2 className="w-5 h-5 text-primary" />
                            Workspaces & Projects
                        </h3>
                        <div className="bg-muted/30 border rounded-xl p-4 space-y-3 text-sm text-muted-foreground">
                            <p>
                                <strong className="text-foreground font-medium">Workspaces</strong> act as the root folders for your projects. Start by creating a Workspace to keep everything organized.
                            </p>
                            <p>
                                Inside a Workspace, you can add <strong className="text-foreground font-medium">Projects</strong> by giving them a name, description, and specifying the framework.
                            </p>
                            <div className="bg-primary/5 text-primary border border-primary/20 p-3 rounded-lg flex items-start gap-2">
                                <Search className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium">Pro tip: Our AI automatically reads your project descriptions to understand the architecture and context of your codebase!</p>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                            <FileText className="w-5 h-5 text-primary" />
                            Notes
                        </h3>
                        <div className="bg-muted/30 border rounded-xl p-4 space-y-2 text-sm text-muted-foreground">
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Keep track of snippets, architectural ideas, and to-do lists.</li>
                                <li>Tag notes and link them directly to specific projects for context.</li>
                                <li>The markdown editor natively supports code highlighting.</li>
                            </ul>
                        </div>
                    </div>

                    {/* AI Features Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                            <Bot className="w-5 h-5 text-primary" />
                            Local AI Features
                        </h3>
                        
                        <div className="space-y-3">
                            <div className="bg-muted/30 border rounded-xl p-4 flex gap-3">
                                <div className="mt-0.5"><MessageSquare className="w-4 h-4 text-primary" /></div>
                                <div>
                                    <h4 className="text-sm font-medium text-foreground mb-1">AI Chat Assistant</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">A conversational agent powered by Llama 3 that acts as your pair programmer. It is fully aware of your projects.</p>
                                </div>
                            </div>

                            <div className="bg-muted/30 border rounded-xl p-4 flex gap-3">
                                <div className="mt-0.5"><Activity className="w-4 h-4 text-primary" /></div>
                                <div>
                                    <h4 className="text-sm font-medium text-foreground mb-1">Code Analysis</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Paste any code snippet to instantly detect bugs, security vulnerabilities, and receive performance optimization suggestions.</p>
                                </div>
                            </div>

                            <div className="bg-muted/30 border rounded-xl p-4 flex gap-3">
                                <div className="mt-0.5"><Bug className="w-4 h-4 text-primary" /></div>
                                <div>
                                    <h4 className="text-sm font-medium text-foreground mb-1">AI Debugger</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Paste your broken code along with the Error Stack Trace. The AI will analyze the flow and provide the root cause and exact fixed code.</p>
                                </div>
                            </div>

                            <div className="bg-muted/30 border rounded-xl p-4 flex gap-3">
                                <div className="mt-0.5"><Code className="w-4 h-4 text-primary" /></div>
                                <div>
                                    <h4 className="text-sm font-medium text-foreground mb-1">Docs Generator</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Paste your raw, undocumented code and the AI will generate beautiful Markdown documentation for it.</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-center text-muted-foreground pt-2 italic">
                            All AI features run locally and privately on your machine.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
