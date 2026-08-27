import { sql } from '@/lib/db';
import Link from 'next/link';
import SyncButton from './SyncButton';

export const dynamic = 'force-dynamic';

export default async function AdminPanel(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || 'offline';

  // State Variables
  let offlineLogs: any[] = [];
  let onlineLogs: any[] = [];
  let devices: any[] = [];
  let stats: any[] = [];

  // Fetch only what's needed for the active tab
  if (tab === 'offline') {
    offlineLogs = await sql`
      SELECT id, device_id, device_name, status, created_at
      FROM notification_logs
      WHERE status = 'offline'
      ORDER BY created_at DESC
      LIMIT 30
    `;
    stats = await sql`
      SELECT device_name, device_id, COUNT(*) as offline_count
      FROM notification_logs
      WHERE status = 'offline'
      GROUP BY device_name, device_id
      ORDER BY offline_count DESC
    `;
  } else if (tab === 'online') {
    onlineLogs = await sql`
      SELECT id, device_id, device_name, status, created_at
      FROM notification_logs
      WHERE status = 'online'
      ORDER BY created_at DESC
      LIMIT 30
    `;
  } else if (tab === 'devices') {
    devices = await sql`
      SELECT device_id, device_name, status, last_synced_at
      FROM devices
      ORDER BY device_name ASC
    `;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-200">
      {/* Header / Navbar Atas */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
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
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold text-emerald-700">System Online</span>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigasi */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-28">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu Utama</p>
            <div className="flex flex-col gap-1.5">
              <Link href="?tab=offline" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tab === 'offline' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                <div className={`p-1.5 rounded-lg ${tab === 'offline' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                Riwayat Mati
              </Link>
              
              <Link href="?tab=online" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tab === 'online' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                <div className={`p-1.5 rounded-lg ${tab === 'online' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                Riwayat Nyala
              </Link>
              
              <Link href="?tab=devices" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tab === 'devices' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                <div className={`p-1.5 rounded-lg ${tab === 'devices' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                Daftar Perangkat
              </Link>
            </div>
          </div>
        </aside>

        {/* Konten Utama */}
        <div className="flex-1 w-full min-w-0">
          
          {/* Tab Content: Offline */}
          {tab === 'offline' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Kiri: Statistik */}
              <div className="xl:col-span-4 flex flex-col gap-6">
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
                      <div key={idx} className="group flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 hover:border-red-200 hover:shadow-md hover:shadow-red-50 transition-all duration-300">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700 group-hover:text-red-600 transition-colors">{stat.device_name}</span>
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

              {/* Kanan: Tabel Riwayat Offline */}
              <div className="xl:col-span-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-red-50/30 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold flex items-center gap-2 text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Riwayat Kamera Mati (Offline)
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Daftar notifikasi peringatan CCTV mati terbaru.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                          <th className="p-5 font-semibold">Waktu Kejadian</th>
                          <th className="p-5 font-semibold">Perangkat</th>
                          <th className="p-5 font-semibold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {offlineLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-red-50/50 transition-colors group">
                            <td className="p-5 whitespace-nowrap">
                              <div className="text-slate-700 font-medium">{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                              <div className="text-slate-400 text-xs mt-0.5">{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
                            </td>
                            <td className="p-5">
                              <div className="font-semibold text-slate-800">{log.device_name}</div>
                              <div className="text-slate-400 font-mono text-xs mt-0.5">{log.device_id}</div>
                            </td>
                            <td className="p-5 text-center">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-200 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> OFFLINE
                              </span>
                            </td>
                          </tr>
                        ))}
                        {offlineLogs.length === 0 && (
                          <tr>
                            <td colSpan={3} className="p-10 text-center text-slate-500 text-sm font-medium">Belum ada riwayat kamera mati.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Online */}
          {tab === 'online' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-emerald-50/30 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      Riwayat Kamera Nyala (Online)
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Daftar notifikasi pemulihan CCTV terbaru.</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                        <th className="p-5 font-semibold">Waktu Pemulihan</th>
                        <th className="p-5 font-semibold">Perangkat</th>
                        <th className="p-5 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {onlineLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-emerald-50/50 transition-colors group">
                          <td className="p-5 whitespace-nowrap">
                            <div className="text-slate-700 font-medium">{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            <div className="text-slate-400 text-xs mt-0.5">{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
                          </td>
                          <td className="p-5">
                            <div className="font-semibold text-slate-800">{log.device_name}</div>
                            <div className="text-slate-400 font-mono text-xs mt-0.5">{log.device_id}</div>
                          </td>
                          <td className="p-5 text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ONLINE
                            </span>
                          </td>
                        </tr>
                      ))}
                      {onlineLogs.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-10 text-center text-slate-500 text-sm font-medium">Belum ada riwayat kamera menyala.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Devices */}
          {tab === 'devices' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-blue-50/30 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2 text-blue-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                      Daftar Semua Perangkat (IMOU Cloud)
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Total <span className="font-bold text-blue-700">{devices.length}</span> perangkat terdaftar di sistem.
                    </p>
                  </div>
                  
                  {/* Gunakan Client Component SyncButton di sini */}
                  <SyncButton />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                        <th className="p-5 font-semibold">Nama Perangkat</th>
                        <th className="p-5 font-semibold">ID Perangkat</th>
                        <th className="p-5 font-semibold text-center">Status Terakhir</th>
                        <th className="p-5 font-semibold">Terakhir Disinkron</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {devices.map((dev) => {
                        const isOnline = dev.status === 'online';
                        return (
                          <tr key={dev.device_id} className="hover:bg-blue-50/40 transition-colors group">
                            <td className="p-5 font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{dev.device_name}</td>
                            <td className="p-5 font-mono text-xs text-slate-500">{dev.device_id}</td>
                            <td className="p-5 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
                                isOnline
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                  : dev.status === 'unknown'
                                    ? 'bg-slate-50 text-slate-500 border-slate-200'
                                    : 'bg-red-50 text-red-600 border-red-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : dev.status === 'unknown' ? 'bg-slate-400' : 'bg-red-500 animate-pulse'}`}></span>
                                {dev.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-5 text-xs text-slate-500 font-medium">
                              {new Date(dev.last_synced_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                          </tr>
                        );
                      })}
                      {devices.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                            </div>
                            <p className="text-slate-600 text-base font-semibold mb-2">Belum ada data perangkat.</p>
                            <p className="text-slate-400 text-sm max-w-sm mx-auto">Klik tombol <strong className="text-blue-600">Sinkronisasi Manual</strong> di atas untuk menarik data CCTV Anda dari server IMOU.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
