'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync-devices');
      if (!res.ok) {
        alert('Gagal melakukan sinkronisasi perangkat.');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsSyncing(false);
      // Refresh halaman untuk memuat data terbaru dari database
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md ${
        isSyncing
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5'
      }`}
    >
      {isSyncing ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sedang Sinkronisasi...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6"/>
            <path d="M21.34 15.57a10 10 0 1 1-.57-8.38"/>
          </svg>
          Sinkronisasi Manual
        </>
      )}
    </button>
  );
}
