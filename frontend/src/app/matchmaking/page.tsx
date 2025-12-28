"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function MatchmakingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'searching' | 'found'>('idle');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const connectToWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    // Use ws://localhost:8000/ws if dev, ideally from env
    const wsUrl = `ws://localhost:8000/ws?token=${token}`;
    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      // Send join event
      ws.send(JSON.stringify({
        event: 'queue:join',
        data: { difficulty }
      }));
      setStatus('searching');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('idle');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received:', message);

      if (message.event === 'match:found') {
        setStatus('found');
        const matchId = message.data.matchId;
        // Delay redirect slightly for visual effect
        setTimeout(() => {
            router.push(`/editor/${matchId}`);
        }, 1500);
      }
      // Handle fallback to practice?
    };

    ws.onclose = () => {
      console.log('Disconnected');
      if (status === 'searching') {
          setStatus('idle');
      }
    };

    socketRef.current = ws;
  };

  const cancelSearch = () => {
    if (socketRef.current && status === 'searching') {
      socketRef.current.send(JSON.stringify({
        event: 'queue:leave',
        data: { difficulty }
      }));
      socketRef.current.close();
      setStatus('idle');
    }
  };

  if (authLoading || !user) return <div className="bg-zinc-950 min-h-screen text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 border border-zinc-800 text-center shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Find a Match</h2>
        <p className="text-zinc-400 mb-8">Select difficulty to start searching</p>

        {status === 'idle' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-3 px-4 rounded-lg font-medium capitalize transition-all ${
                    difficulty === level
                      ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <Button 
                onClick={connectToWebSocket}
                className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700"
            >
              Start Searching
            </Button>
          </div>
        )}

        {status === 'searching' && (
          <div className="py-8">
            <div className="relative w-20 h-20 mx-auto mb-6">
               <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold animate-pulse">Looking for opponent...</h3>
            <p className="text-zinc-500 mt-2">Difficulty: <span className="capitalize">{difficulty}</span></p>
            
            <Button 
                onClick={cancelSearch}
                variant="ghost" 
                className="mt-8 text-red-400 hover:text-red-300 hover:bg-red-900/10"
            >
              Cancel
            </Button>
          </div>
        )}

        {status === 'found' && (
          <div className="py-8">
             <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">Match Found!</h3>
             <p className="text-zinc-400">Preparing battleground...</p>
          </div>
        )}
      </div>
    </div>
  );
}
