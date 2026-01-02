
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Play, Send, FileCode, Clock, CheckCircle2, Terminal, Timer as TimerIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function EditorPage() {
  const { matchId } = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [code, setCode] = useState('// Write your solution here\n');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState<'problem' | 'submissions'>('problem');
  const [timeEncoded, setTimeEncoded] = useState<string>('00:00');
  const socketRef = useRef<WebSocket | null>(null);

  // Timer Logic
  useEffect(() => {
    // Mode check
    const isPractice = searchParams.get('mode') === 'practice' || (matchId as string).startsWith('practice-');
    const startTimeParam = searchParams.get('startTime');
    let startTime = startTimeParam ? parseInt(startTimeParam) : Date.now();

    // If practice, we just start counting from now (or 0)
    // If match, we sync with startTime
    
    // For match with future start time (buffer 5s), we show negative or 0 until start
    
    const interval = setInterval(() => {
        const now = Date.now();
        let diff = now - startTime;

        if (diff < 0) {
            // Match hasn't started yet
             setTimeEncoded(`Starting in ${Math.ceil(Math.abs(diff) / 1000)}s`);
             return;
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeEncoded(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [matchId, searchParams]);


  // Mock data for now (later fetch from API based on matchId)
  const problem = {
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ]
  };

  useEffect(() => {
    // Connect to WebSocket
    const token = localStorage.getItem('token');
    if (!token || !matchId) return;

    const wsUrl = `ws://localhost:8000/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('Connected to Game WebSocket');
        ws.send(JSON.stringify({
            event: 'match:join',
            data: { matchId }
        }));
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Editor Received:', message);
        // Handle events like opponent progress, etc.
    };

    socketRef.current = ws;

    return () => {
        ws.close();
    };
  }, [matchId]);

  const handleRun = () => {
    setOutput('Running test cases...\n> Test Case 1: Passed\n> Test Case 2: Passed');
  };

  const handleSubmit = () => {
    setOutput('Submitting...\nAccepted! Runtime: 56ms');
  };

  return (
    <div className="flex h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black text-white overflow-hidden font-sans">
        
        {/* Left Panel: Problem Description */}
        <div className="w-1/2 flex flex-col border-r border-white/5 bg-zinc-900/30 backdrop-blur-sm">
            {/* Header */}
            <div className="h-14 border-b border-white/5 flex items-center px-6 bg-zinc-900/50 backdrop-blur-md">
                <div className="flex space-x-6">
                    <button 
                        onClick={() => setActiveTab('problem')}
                        className={`text-sm font-medium h-14 border-b-2 flex items-center space-x-2 transition-colors ${
                            activeTab === 'problem' 
                            ? 'border-blue-500 text-blue-400' 
                            : 'border-transparent text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        <FileCode className="w-4 h-4" />
                        <span>Problem</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('submissions')}
                        className={`text-sm font-medium h-14 border-b-2 flex items-center space-x-2 transition-colors ${
                            activeTab === 'submissions' 
                            ? 'border-blue-500 text-blue-400' 
                            : 'border-transparent text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        <span>Submissions</span>
                    </button>
                </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="flex items-center space-x-3 mb-6">
                    <h1 className="text-3xl font-bold text-white">{problem.title}</h1>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {problem.difficulty}
                    </span>
                </div>

                <div className="prose prose-invert max-w-none">
                    <p className="text-zinc-300 text-lg leading-relaxed mb-8">{problem.description}</p>
                    
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
                        Examples
                    </h3>
                    <div className="space-y-4">
                        {problem.examples.map((ex, i) => (
                            <Card key={i} className="bg-zinc-900/50 border-white/5 p-4">
                                <div className="space-y-2 font-mono text-sm">
                                    <div>
                                        <span className="text-zinc-500">Input:</span> 
                                        <span className="text-zinc-200 ml-2">{ex.input}</span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-500">Output:</span>
                                        <span className="text-emerald-400 ml-2">{ex.output}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="w-1/2 flex flex-col bg-zinc-950/50">
            {/* Editor Header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md">
                 <div className="flex items-center space-x-4">
                     <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-white/5 border border-white/5">
                        <span className="text-xs text-zinc-400 font-mono">Python 3</span>
                     </div>
                     
                     {/* Timer Display */}
                     <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <TimerIcon className="w-4 h-4" />
                        <span className="text-sm font-medium font-mono tabular-nums">{timeEncoded}</span>
                     </div>
                 </div>
                 
                 <div className="flex items-center space-x-3">
                     <Button 
                        onClick={handleRun} 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 px-4 text-zinc-300 hover:text-white hover:bg-white/10"
                     >
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        Run
                     </Button>
                     <Button 
                        onClick={handleSubmit} 
                        size="sm" 
                        className="h-9 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 border-0"
                     >
                        <Send className="w-4 h-4 mr-2" />
                        Submit
                     </Button>
                 </div>
            </div>

            {/* Editor Area */}
            <div className="flex-grow relative">
                <Editor
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 15,
                        fontFamily: 'var(--font-mono)',
                        lineHeight: 24,
                        padding: { top: 24 },
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        roundedSelection: true,
                    }}
                />
            </div>

            {/* Console/Output */}
            <div className="h-1/3 border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl flex flex-col">
                <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 bg-white/5">
                    <div className="flex items-center space-x-2 text-zinc-400">
                        <Terminal className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Console</span>
                    </div>
                    <button 
                        onClick={() => setOutput('')} 
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase font-medium"
                    >
                        Clear
                    </button>
                </div>
                <div className="flex-1 p-4 font-mono text-sm text-zinc-300 overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                    {output ? (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                            {output}
                        </div>
                    ) : (
                        <span className="text-zinc-600 italic">Run your code to see output...</span>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
