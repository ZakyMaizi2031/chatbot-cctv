import { sql } from '@/lib/db';
import SyncButton from './SyncButton';
import Pagination from './Pagination';
import DatePicker from './DatePicker';
import SearchBar from './SearchBar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPanel(props: { searchParams: Promise<{ tab?: string, page?: string, date?: string, search?: string, history?: string }> }) {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || 'dashboard';
  const currentPage = parseInt(searchParams.page || '1') || 1;
  const filterDate = searchParams.date || null;
  const searchQuery = searchParams.search || null;
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  // State Variables
  let offlineLogs: any[] = [];
  let onlineLogs: any[] = [];
  let devices: any[] = [];
  let stats: any[] = [];
  
  // History Modal Variables
  let historyLogs: any[] = [];
  let historyDeviceName = '';
  let totalHistoryItems = 0;
  const historyId = searchParams.history || null;
  
  if (historyId) {
    const historyCountRes = await sql`SELECT COUNT(*) as count FROM notification_logs WHERE device_id = ${historyId} AND status = 'offline'`;
    totalHistoryItems = parseInt(historyCountRes[0].count);

    historyLogs = await sql`
      SELECT status, created_at 
      FROM notification_logs 
      WHERE device_id = ${historyId} AND status = 'offline'
      ORDER BY created_at DESC 
      LIMIT ${itemsPerPage} OFFSET ${offset}
    `;
    const nameRes = await sql`SELECT device_name FROM devices WHERE device_id = ${historyId} LIMIT 1`;
    if (nameRes.length > 0) {
      historyDeviceName = nameRes[0].device_name;
    }
  }

  // Dashboard Specific Variables
  let totalDevices = 0;
  let onlineCount = 0;
  let offlineCount = 0;
  let recentLogs: any[] = [];
  let totalOfflineItems = 0;
  let totalOnlineItems = 0;

  // Fetch only what's needed for the active tab
  if (tab === 'dashboard') {
    stats = await sql`
      SELECT 
        COALESCE(d.device_name, MAX(n.device_name)) as device_name, 
        n.device_id, 
        COUNT(n.id) as offline_count
      FROM notification_logs n
      LEFT JOIN devices d ON n.device_id = d.device_id
      WHERE n.status = 'offline'
      GROUP BY n.device_id, d.device_name
      ORDER BY offline_count DESC
    `;
    
    // Get summary counts
    const deviceCounts = await sql`
      SELECT status, COUNT(*) as count 
      FROM devices 
      GROUP BY status
    `;
    deviceCounts.forEach((row: any) => {
      const count = parseInt(row.count);
      totalDevices += count;
      if (row.status === 'online') onlineCount += count;
      if (row.status === 'offline') offlineCount += count;
    });

    // Get recent activity
    recentLogs = await sql`
      SELECT id, device_id, device_name, status, created_at
      FROM notification_logs
      ORDER BY created_at DESC
      LIMIT 6
    `;

  } else if (tab === 'offline') {
    const dateCondition = filterDate ? sql`AND DATE(created_at AT TIME ZONE 'Asia/Jakarta') = ${filterDate}` : sql``;
    const searchCondition = searchQuery ? sql`AND (device_name ILIKE ${'%' + searchQuery + '%'} OR device_id ILIKE ${'%' + searchQuery + '%'})` : sql``;
    
    const countResult = await sql`SELECT COUNT(*) FROM notification_logs WHERE status = 'offline' ${dateCondition} ${searchCondition}`;
    totalOfflineItems = parseInt(countResult[0].count);

    offlineLogs = await sql`
      SELECT id, device_id, device_name, status, created_at
      FROM notification_logs
      WHERE status = 'offline' ${dateCondition} ${searchCondition}
      ORDER BY created_at DESC
      LIMIT ${itemsPerPage} OFFSET ${offset}
    `;
  } else if (tab === 'online') {
    const dateCondition = filterDate ? sql`AND DATE(created_at AT TIME ZONE 'Asia/Jakarta') = ${filterDate}` : sql``;
    const searchCondition = searchQuery ? sql`AND (device_name ILIKE ${'%' + searchQuery + '%'} OR device_id ILIKE ${'%' + searchQuery + '%'})` : sql``;
    
    const countResult = await sql`SELECT COUNT(*) FROM notification_logs WHERE status = 'online' ${dateCondition} ${searchCondition}`;
    totalOnlineItems = parseInt(countResult[0].count);

    onlineLogs = await sql`
      SELECT id, device_id, device_name, status, created_at
      FROM notification_logs
      WHERE status = 'online' ${dateCondition} ${searchCondition}
      ORDER BY created_at DESC
      LIMIT ${itemsPerPage} OFFSET ${offset}
    `;
  } else if (tab === 'devices') {
    const searchCondition = searchQuery ? sql`WHERE device_name ILIKE ${'%' + searchQuery + '%'} OR device_id ILIKE ${'%' + searchQuery + '%'}` : sql``;
    
    const countResult = await sql`SELECT COUNT(*) FROM devices ${searchCondition}`;
    totalDevices = parseInt(countResult[0].count);

    devices = await sql`
      SELECT device_id, device_name, status, last_synced_at
      FROM devices
      ${searchCondition}
      ORDER BY device_name ASC
      LIMIT ${itemsPerPage} OFFSET ${offset}
    `;
  }

  return (
    <>
            
            {/* Tab Content: Dashboard */}
            {!historyId && tab === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
                
                {/* Section 1: Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Cameras Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kamera</p>
                      <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalDevices}</h3>
                    </div>
                  </div>

                  {/* Online Cameras Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kamera Aktif</p>
                      <div className="flex items-end gap-1.5 mt-0.5">
                        <h3 className="text-2xl font-bold text-emerald-600">{onlineCount}</h3>
                        <span className="text-xs text-emerald-500 font-medium mb-1">Beroperasi</span>
                      </div>
                    </div>
                  </div>

                  {/* Offline Cameras Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 border border-red-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kamera Mati</p>
                      <div className="flex items-end gap-1.5 mt-0.5">
                        <h3 className="text-2xl font-bold text-red-600">{offlineCount}</h3>
                        <span className="text-xs text-red-500 font-medium mb-1">Perlu Perhatian</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  {/* Section 2: Frekuensi Kerusakan */}
                  <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                      <h2 className="text-base font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20v-6M6 20V10M18 20V4" />
                        </svg>
                        Frekuensi Kerusakan Kamera
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Analisis kamera yang paling sering terputus (offline).
                      </p>
                    </div>
                    <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto max-h-[500px]">
                      {stats.map((stat, idx) => (
                        <Link href={`?tab=${tab}&history=${stat.device_id}`} key={idx} className="group flex flex-col justify-between bg-white p-4 rounded-xl border border-slate-100 hover:border-red-200 hover:shadow-md hover:shadow-red-50 transition-all duration-300">
                          <div className="flex justify-between items-start mb-3">
                            <div className="bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-[10px] font-bold border border-red-100 shadow-sm">
                              {stat.offline_count}x Mati
                            </div>
                            <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-red-500 group-hover:bg-red-50 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 text-sm group-hover:text-red-600 transition-colors line-clamp-1" title={stat.device_name}>{stat.device_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0">{stat.device_id}</span>
                          </div>
                        </Link>
                      ))}
                      {stats.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          </div>
                          <p className="text-base font-semibold text-slate-700">Semua kamera beroperasi dengan normal.</p>
                          <p className="text-sm text-slate-500 mt-1">Belum ada catatan kamera terputus dari sistem.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Recent Activity Feed */}
                  <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                      <h2 className="text-base font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        Aktivitas Terakhir
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Kejadian koneksi terbaru di seluruh jaringan.
                      </p>
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto">
                      <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                        {recentLogs.map((log) => {
                          const isOnline = log.status === 'online';
                          return (
                            <div key={log.id} className="relative pl-6">
                              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-slate-400">
                                  {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' })} WIB
                                </span>
                                <span className="font-bold text-slate-800 mt-1 leading-snug">
                                  {log.device_name}
                                </span>
                                <span className={`text-sm font-medium mt-1 ${isOnline ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {isOnline ? 'Kembali Online (Normal)' : 'Terputus (Offline)'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {recentLogs.length === 0 && (
                          <div className="text-center py-10">
                            <p className="text-sm text-slate-400">Belum ada aktivitas terekam.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Tab Content: Offline History */}
            {!historyId && tab === 'offline' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-red-50/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold flex items-center gap-2 text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Riwayat Kamera Mati (Offline)
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Daftar notifikasi peringatan CCTV mati terbaru.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <SearchBar tab="offline" />
                      <DatePicker tab="offline" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                          <th className="py-2 px-4 font-semibold text-center w-12">No</th>
                          <th className="py-2 px-4 font-semibold">Tanggal Kejadian</th>
                          <th className="py-2 px-4 font-semibold">Jam</th>
                          <th className="py-2 px-4 font-semibold">Nama Perangkat</th>
                          <th className="py-2 px-4 font-semibold">ID Perangkat</th>
                          <th className="py-2 px-4 font-semibold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {offlineLogs.map((log, index) => (
                          <tr key={log.id} className="hover:bg-red-50/50 transition-colors group">
                            <td className="py-2.5 px-4 text-center text-slate-400 font-medium text-sm">{offset + index + 1}</td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <div className="text-slate-700 font-medium text-sm">{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}</div>
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <div className="text-slate-500 font-mono text-xs">{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })} WIB</div>
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="font-semibold text-slate-800 text-sm">{log.device_name}</div>
                            </td>
                            <td className="py-2.5 px-4 font-mono text-xs text-slate-500">
                              {log.device_id}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-200 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> OFFLINE
                              </span>
                            </td>
                          </tr>
                        ))}
                        {offlineLogs.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-10 text-center text-slate-500 text-sm font-medium">Belum ada riwayat kamera mati.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalOfflineItems / itemsPerPage) || 1}
                    totalItems={totalOfflineItems}
                    itemsPerPage={itemsPerPage}
                    tab="offline"
                  />
                </div>
              </div>
            )}

            {/* Tab Content: Online History */}
            {!historyId && tab === 'online' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-emerald-50/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold flex items-center gap-2 text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Riwayat Kamera Nyala (Online)
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Daftar notifikasi pemulihan CCTV terbaru.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <SearchBar tab="online" />
                      <DatePicker tab="online" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                          <th className="py-2 px-4 font-semibold text-center w-12">No</th>
                          <th className="py-2 px-4 font-semibold">Tanggal Pemulihan</th>
                          <th className="py-2 px-4 font-semibold">Jam</th>
                          <th className="py-2 px-4 font-semibold">Nama Perangkat</th>
                          <th className="py-2 px-4 font-semibold">ID Perangkat</th>
                          <th className="py-2 px-4 font-semibold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {onlineLogs.map((log, index) => (
                          <tr key={log.id} className="hover:bg-emerald-50/50 transition-colors group">
                            <td className="py-2.5 px-4 text-center text-slate-400 font-medium text-sm">{offset + index + 1}</td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <div className="text-slate-700 font-medium text-sm">{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}</div>
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <div className="text-slate-500 font-mono text-xs">{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })} WIB</div>
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="font-semibold text-slate-800 text-sm">{log.device_name}</div>
                            </td>
                            <td className="py-2.5 px-4 font-mono text-xs text-slate-500">
                              {log.device_id}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ONLINE
                              </span>
                            </td>
                          </tr>
                        ))}
                        {onlineLogs.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-10 text-center text-slate-500 text-sm font-medium">Belum ada riwayat kamera menyala.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalOnlineItems / itemsPerPage) || 1}
                    totalItems={totalOnlineItems}
                    itemsPerPage={itemsPerPage}
                    tab="online"
                  />
                </div>
              </div>
            )}

            {/* Tab Content: Devices List */}
            {!historyId && tab === 'devices' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-blue-50/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold flex items-center gap-2 text-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                        Daftar Semua Perangkat (IMOU Cloud)
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Total <span className="font-bold text-blue-700">{totalDevices}</span> perangkat terdaftar di sistem.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <SearchBar tab="devices" />
                      {/* Sync Button */}
                      <SyncButton />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                          <th className="py-2 px-4 font-semibold text-center w-12">No</th>
                          <th className="py-2 px-4 font-semibold">Nama Perangkat</th>
                          <th className="py-2 px-4 font-semibold">ID Perangkat</th>
                          <th className="py-2 px-4 font-semibold text-center">Status Terakhir</th>
                          <th className="py-2 px-4 font-semibold">Terakhir Disinkron</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {devices.map((dev, index) => {
                          const isOnline = dev.status === 'online';
                          return (
                            <tr key={dev.device_id} className="hover:bg-blue-50/40 transition-colors group">
                              <td className="py-2.5 px-4 text-center text-slate-400 font-medium text-sm">{offset + index + 1}</td>
                              <td className="py-2.5 px-4">
                                <Link href={`/admin/devices/${dev.device_id}`} className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors underline decoration-transparent hover:decoration-blue-700">
                                  {dev.device_name}
                                </Link>
                              </td>
                              <td className="py-2.5 px-4 font-mono text-xs text-slate-500">{dev.device_id}</td>
                              <td className="py-2.5 px-4 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${
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
                              <td className="py-2.5 px-4 text-slate-500 text-xs">
                                {new Date(dev.last_synced_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' })}
                              </td>
                            </tr>
                          );
                        })}
                        {devices.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-12 text-center">
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
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalDevices / itemsPerPage) || 1}
                    totalItems={totalDevices}
                    itemsPerPage={itemsPerPage}
                    tab="devices"
                  />
                </div>
              </div>
            )}


            {/* History Page View */}
            {historyId && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-indigo-50/30 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold flex items-center gap-2 text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Riwayat Kerusakan: {historyDeviceName || 'Tidak Diketahui'}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1 font-mono">ID: {historyId}</p>
                    </div>
                    <Link href={`?tab=${tab}`} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                      Kembali
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                          <th className="py-2 px-4 font-semibold text-center w-12">No</th>
                          <th className="py-2 px-4 font-semibold">Tanggal Kejadian</th>
                          <th className="py-2 px-4 font-semibold">Jam</th>
                          <th className="py-2 px-4 font-semibold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {historyLogs.map((log, index) => (
                          <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 px-4 text-center text-slate-400 font-medium text-sm">{offset + index + 1}</td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <div className="text-slate-700 font-medium text-sm">{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}</div>
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <div className="text-slate-500 font-mono text-xs">{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })} WIB</div>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-200">
                                  OFFLINE
                                </span>
                            </td>
                          </tr>
                        ))}
                        {historyLogs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-10 text-center text-slate-500 text-sm font-medium">Belum ada riwayat tercatat.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalHistoryItems / itemsPerPage) || 1}
                    totalItems={totalHistoryItems}
                    itemsPerPage={itemsPerPage}
                    tab={tab}
                  />
                </div>
              </div>
            )}
            
    </>
  );
}
