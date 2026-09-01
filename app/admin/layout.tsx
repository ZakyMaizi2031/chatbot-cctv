import React from 'react';
import Sidebar from './Sidebar';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-200">
      
      {/* Sidebar - Client Component */}
      <Sidebar user={session?.user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header / Navbar Atas */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 shadow-sm h-[73px] flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="truncate">
              <h1 className="text-base sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 truncate">
                Kreativa CCTV Center
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">System Monitoring Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-100 shadow-sm">
              <span className="relative flex h-2 sm:h-3 w-2 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 sm:h-3 w-2 sm:w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] sm:text-sm font-semibold text-emerald-700 whitespace-nowrap">System Online</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Based on Route/Tab */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-5">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
