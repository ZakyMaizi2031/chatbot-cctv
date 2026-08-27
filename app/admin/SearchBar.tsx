'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

export default function SearchBar({ tab, placeholder = "Cari nama CCTV..." }: { tab: string, placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Debounce logic for automatic search while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only push if the search term actually changed compared to the URL
      if (searchTerm !== currentSearch) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm) {
          params.set('search', searchTerm);
        } else {
          params.delete('search');
        }
        
        // Reset to page 1 when filtering
        params.set('page', '1');
        params.set('tab', tab);
        
        router.push(`?${params.toString()}`);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm, currentSearch, router, searchParams, tab]);

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="appearance-none bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all w-64"
      />
      <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      {searchTerm && (
        <button 
          onClick={() => setSearchTerm('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
          title="Hapus Pencarian"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
    </div>
  );
}
