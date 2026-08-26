import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminPanel() {
  // Ambil semua log terbaru (50 data terakhir)
  const logs = await sql`
    SELECT id, device_id, device_name, status, created_at
    FROM notification_logs
    ORDER BY created_at DESC
    LIMIT 50
  `;

  // Hitung jumlah offline per device
  const stats = await sql`
    SELECT device_name, device_id, COUNT(*) as offline_count
    FROM notification_logs
    WHERE status = 'offline'
    GROUP BY device_name, device_id
    ORDER BY offline_count DESC
  `;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-200">
      {/* Header / Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">
                Kreativa CCTV Center
              </h1>
              <p className="text-xs text-slate-500 font-medium">System Monitoring Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold text-slate-600">System Online</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Bagian Kiri: Statistik (Lebih Lebar Sedikit) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Frekuensi Kerusakan
                </h2>
                <p className="text-sm text-slate-500 mt-1">Kamera yang paling sering offline.</p>
              </div>
              <div className="p-4 space-y-3">
                {stats.map((stat, idx) => (
                  <div key={idx} className="group flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-300">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">{stat.device_name}</span>
                      <span className="text-xs text-slate-400 font-mono mt-0.5">{stat.device_id}</span>
                    </div>
                    <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-red-100 shadow-sm">
                      {stat.offline_count}x Mati
                    </div>
                  </div>
                ))}
                {stats.length === 0 && (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Semua kamera beroperasi normal.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bagian Kanan: Log Riwayat */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Log Peristiwa
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Daftar 50 notifikasi terbaru yang dikirim ke Telegram.</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="p-5 font-semibold">Waktu Kejadian</th>
                      <th className="p-5 font-semibold">Perangkat</th>
                      <th className="p-5 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {logs.map((log) => {
                      const isOffline = log.status === 'offline';
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="p-5 whitespace-nowrap">
                            <div className="text-slate-700 font-medium">
                              {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="text-slate-400 text-xs mt-0.5">
                              {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="font-semibold text-slate-800">{log.device_name}</div>
                            <div className="text-slate-400 font-mono text-xs mt-0.5">{log.device_id}</div>
                          </td>
                          <td className="p-5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                              isOffline 
                                ? 'bg-red-50 text-red-600 border-red-200' 
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                              {log.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-12 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <p className="text-slate-500 text-sm font-medium">Belum ada riwayat notifikasi.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
