"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  console.log('Home component loaded, user:', user?.username);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              MeetCode
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-zinc-400">Welcome, {user.username}</span>
             {/* Add logout button or dropdown here */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          
          {/* Card 1: Random Match */}
          <div className="group relative bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <h3 className="text-2xl font-bold mb-4 text-white">Random Match</h3>
            <p className="text-zinc-400 mb-8 h-12">
              Challenge a random opponent to a coding duel. Race to solve the problem first!
            </p>
            <div className="space-y-4">
               {/* Difficulty selection would go here, maybe redirect to a setup page or open modal */}
               <Button 
                 onClick={() => {
                   console.log('Find Match button clicked!');
                   router.push('/matchmaking');
                 }}
                 className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
               >
                 Find Match
               </Button>
            </div>
          </div>

          {/* Card 2: Invite Friend */}
          <div className="group relative bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]">
             <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <h3 className="text-2xl font-bold mb-4 text-white">Invite a Friend</h3>
            <p className="text-zinc-400 mb-8 h-12">
              Send a link to a friend and compete in a private room.
            </p>
            <Button disabled className="w-full h-12 text-lg bg-zinc-800 text-zinc-500 cursor-not-allowed">
              Coming Soon
            </Button>
          </div>

        </div>
        
        {/* Recent Activity Section */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
            Recent Matches (Coming Soon)
          </h2>
          <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-8 text-center text-zinc-500">
             No matches yet. Start competing!
          </div>
        </div>
      </main>
    </div>
  );
}
