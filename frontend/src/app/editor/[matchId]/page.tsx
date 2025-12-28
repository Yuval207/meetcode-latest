"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function EditorPage() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const [code, setCode] = useState('// Write your solution here\n');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState<'problem' | 'submissions'>('problem');
  const socketRef = useRef<WebSocket | null>(null);

  // Mock data for now (later fetch from API based on matchId)
  const problem = {
    title: "Two Sum",
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
    setOutput('Running test cases...\nTest Case 1: Passed\nTest Case 2: Passed');
  };

  const handleSubmit = () => {
    setOutput('Submitting...\nAccepted! Runtime: 56ms');
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
        {/* Left Panel: Problem Description */}
        <div className="w-1/2 border-r border-zinc-800 flex flex-col">
            <div className="h-12 border-b border-zinc-800 flex items-center px-4 bg-zinc-900">
                <div className="flex space-x-4">
                    <button 
                        onClick={() => setActiveTab('problem')}
                        className={`text-sm font-medium h-12 border-b-2 px-2 ${activeTab === 'problem' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-400 hover:text-white'}`}
                    >
                        Problem
                    </button>
                    <button 
                        onClick={() => setActiveTab('submissions')}
                        className={`text-sm font-medium h-12 border-b-2 px-2 ${activeTab === 'submissions' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-400 hover:text-white'}`}
                    >
                        Submissions
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
                <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
                <div className="prose prose-invert max-w-none">
                    <p className="text-zinc-300 mb-6">{problem.description}</p>
                    
                    <h3 className="text-lg font-semibold mb-3">Examples</h3>
                    <div className="space-y-4">
                        {problem.examples.map((ex, i) => (
                            <div key={i} className="bg-zinc-900 p-4 rounded-lg">
                                <p className="font-mono text-sm text-zinc-400">Input: <span className="text-zinc-200">{ex.input}</span></p>
                                <p className="font-mono text-sm text-zinc-400 mt-1">Output: <span className="text-zinc-200">{ex.output}</span></p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="w-1/2 flex flex-col">
            {/* Editor Header */}
            <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900">
                 <div className="text-sm text-zinc-400">Python 3</div>
                 <div className="flex items-center space-x-2">
                     <Button onClick={handleRun} variant="secondary" size="sm" className="h-8">Run</Button>
                     <Button onClick={handleSubmit} size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700">Submit</Button>
                 </div>
            </div>

            {/* Editor */}
            <div className="flex-grow relative">
                <Editor
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                    }}
                />
            </div>

            {/* Console/Output */}
            <div className="h-1/3 border-t border-zinc-800 bg-zinc-900 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-zinc-400">Console</span>
                    <button onClick={() => setOutput('')} className="text-xs text-zinc-500 hover:text-zinc-300">Clear</button>
                </div>
                <div className="flex-1 font-mono text-sm text-zinc-300 overflow-y-auto whitespace-pre-wrap">
                    {output || <span className="text-zinc-600 italic">Run execution to see output...</span>}
                </div>
            </div>
        </div>
    </div>
  );
}
