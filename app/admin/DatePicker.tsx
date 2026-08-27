'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

export default function DatePicker({ tab }: { tab: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDate = searchParams.get('date') || '';
  
  const [date, setDate] = useState(currentDate);

  // Sync state if URL changes externally
  useEffect(() => {
    setDate(currentDate);
  }, [currentDate]);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedDate = e.target.value;
      setDate(selectedDate);
      
      const params = new URLSearchParams(searchParams.toString());
      if (selectedDate) {
        params.set('date', selectedDate);
      } else {
        params.delete('date');
      }
      
      // Reset to page 1 when filtering
      params.set('page', '1');
      params.set('tab', tab);
      
      router.push(`?${params.toString()}`);
    },
    [router, searchParams, tab]
  );

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="appearance-none bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm transition-all"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      {date && (
        <button 
          onClick={() => {
            setDate('');
            const params = new URLSearchParams(searchParams.toString());
            params.delete('date');
            params.set('page', '1');
            router.push(`?${params.toString()}`);
          }}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Hapus Filter Tanggal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
    </div>
  );
}
