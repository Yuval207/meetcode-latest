"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sword, Users, Zap, Trophy, Github } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-zinc-800 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black text-white selection:bg-blue-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/20 glass backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold tracking-tight">
              Meet<span className="text-blue-500">Code</span>
            </h1>
          </div>
          <div className="flex items-center space-x-6">
             <div className="flex items-center space-x-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-medium text-zinc-300">{user.username}</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        <div className="text-center mb-16 space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight pb-2">
              Code. <span className="text-gradient">Compete.</span> Conquer.
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              The ultimate real-time coding battleground. Challenge friends or match with random opponents to prove your algorithmic mastery.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Card 1: Random Match */}
          <Card hover gradient className="group cursor-pointer border-blue-500/20 hover:border-blue-500/50">
            <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sword className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle>Random Match</CardTitle>
                <CardDescription>Ranked matchmaking system</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-zinc-400 mb-6">
                Challenge a random opponent to a coding duel. Gain ELO points and climb the global leaderboard.
              </p>
               <Button 
                 onClick={() => router.push('/matchmaking')}
                 className="w-full bg-blue-600 hover:bg-blue-500 text-white"
               >
                 Find Match
                 <Zap className="w-4 h-4 ml-2" />
               </Button>
            </CardContent>
          </Card>

          {/* Card 2: Invite Friend */}
          <Card hover className="group border-emerald-500/20 hover:border-emerald-500/50 opacity-100">
             <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle>Invite a Friend</CardTitle>
                <CardDescription>Private room battles</CardDescription>
             </CardHeader>
             <CardContent>
                <p className="text-zinc-400 mb-6">
                  Create a private lobby and send the link to a friend for a friendly 1v1 coding session.
                </p>
                <Button variant="outline" disabled className="w-full border-zinc-700 text-zinc-500 cursor-not-allowed hover:bg-transparent">
                  Coming Soon
                </Button>
             </CardContent>
          </Card>

        </div>
        
        {/* Recent Activity Section */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold flex items-center">
                <Trophy className="w-6 h-6 text-yellow-500 mr-3" />
                Recent Matches
             </h2>
             <Button variant="ghost" size="sm" className="text-zinc-400">View All</Button>
          </div>
          
          <div className="glass-card rounded-xl p-1 text-center">
              <div className="py-12 flex flex-col items-center justify-center text-zinc-500 space-y-4">
                 <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center">
                    <Github className="w-8 h-8 opacity-20" />
                 </div>
                 <p>No matches yet. Start competing to fill your history!</p>
              </div>
          </div>
        </div>
      </main>
    </div>
  );
}
