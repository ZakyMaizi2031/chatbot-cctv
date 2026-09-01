'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';

import { signOut } from 'next-auth/react';

export default function Sidebar({ user }: { user: any }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  let currentTab = searchParams.get('tab') || 'dashboard';
  if (pathname?.includes('/admin/devices/')) {
    currentTab = 'devices';
  }
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  // Prevent hydration mismatch by not rendering collapsed styling until mounted
  const collapsed = mounted ? isCollapsed : false;

  const links = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    },
    {
      id: 'offline',
      label: 'Riwayat Mati',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      )
    },
    {
      id: 'online',
      label: 'Riwayat Nyala',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      )
    },
    {
      id: 'devices',
      label: 'Daftar Perangkat',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      )
    }
  ];

  if (user?.role === 'admin') {
    links.push({
      id: 'users',
      label: 'Manajemen Pengguna',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    });
  }

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside 
        className={`hidden md:flex bg-white border-r border-slate-200 flex-col transition-all duration-300 ease-in-out sticky top-0 h-screen flex-shrink-0 z-40 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
      {/* Header Logo */}
      <div className="h-[73px] flex items-center justify-between px-4 border-b border-slate-200 flex-shrink-0">
        <div className={`flex items-center gap-3 overflow-hidden transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <span className="font-bold text-slate-800 truncate">CCTV Center</span>
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className={`p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors ${collapsed ? 'mx-auto' : ''}`}
          title={collapsed ? "Perluas Sidebar" : "Sembunyikan Sidebar"}
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
        {!collapsed && (
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Menu Utama</p>
        )}
        
        {links.map((link) => {
          const isActive = currentTab === link.id;
          return (
            <Link 
              key={link.id}
              href={`/admin?tab=${link.id}`} 
              title={collapsed ? link.label : ''}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {link.icon}
              </div>
              
              <span className={`whitespace-nowrap transition-all duration-300 ${
                collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
              }`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer Info & Profile */}
      <div className={`mt-auto overflow-hidden transition-all duration-300 ${
        collapsed ? 'opacity-0 h-0 hidden' : 'opacity-100'
      }`}>
        {/* Status Indicator */}
        <div className="p-4 pt-0">
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-700 truncate">System Online</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200/60 bg-white/50">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {user?.image ? (
                <img src={user.image} alt={user.name || "User"} className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 border border-blue-200 shadow-sm">
                  {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-800 truncate">{user?.name || user?.email || "Admin"}</span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Keluar Sesi
            </button>
          </div>
        </div>
      </div>

      {collapsed && (
        <div className="mt-auto p-4 flex justify-center border-t border-slate-200/60 bg-white/50">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Keluar"
            className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      )}

      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)] z-50 flex items-center justify-around px-2 h-16 pb-safe">
        {links.map((link) => {
          const isActive = currentTab === link.id;
          return (
            <Link
              key={link.id}
              href={`/admin?tab=${link.id}`}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all duration-300 ${
                isActive ? 'bg-blue-50' : 'bg-transparent'
              }`}>
                {/* Clone the icon to make it slightly smaller on mobile if needed, but h-5 w-5 is fine */}
                {link.icon}
              </div>
              <span className={`text-[10px] font-medium leading-none ${
                isActive ? 'font-bold' : ''
              }`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
