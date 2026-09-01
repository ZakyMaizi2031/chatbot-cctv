import { sql } from '@/lib/db';
import Link from 'next/link';
import Pagination from '@/app/admin/Pagination';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DeviceDetailPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ page?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const detailId = params.id;
  const currentPage = parseInt(searchParams.page || '1') || 1;
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  const devRes = await sql`SELECT * FROM devices WHERE device_id = ${detailId} LIMIT 1`;
  if (devRes.length === 0) {
    notFound();
  }
  const detailDeviceData = devRes[0];

  const detailCountRes = await sql`SELECT COUNT(*) as count FROM notification_logs WHERE device_id = ${detailId}`;
  const totalDetailItems = parseInt(detailCountRes[0].count);

  let detailOnlineCount = 0;
  let detailOfflineCount = 0;
  const statsRes = await sql`
    SELECT 
      SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online_count,
      SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offline_count
    FROM notification_logs 
    WHERE device_id = ${detailId}
  `;
  if (statsRes.length > 0) {
    detailOnlineCount = parseInt(statsRes[0].online_count) || 0;
    detailOfflineCount = parseInt(statsRes[0].offline_count) || 0;
  }

  const detailLogs = await sql`
    SELECT status, created_at 
    FROM notification_logs 
    WHERE device_id = ${detailId}
    ORDER BY created_at DESC 
    LIMIT ${itemsPerPage} OFFSET ${offset}
  `;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
      {/* Device Details Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-4 md:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 flex-1">
            {/* Device Identity */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">{detailDeviceData.device_name}</h2>
              <p className="text-sm text-slate-500 font-mono mt-0.5">{detailDeviceData.device_id}</p>
            </div>

            <div className="hidden md:block h-10 w-px bg-slate-200"></div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Status Saat Ini</p>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-sm ${
                  detailDeviceData.status === 'online'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : detailDeviceData.status === 'unknown'
                      ? 'bg-slate-50 text-slate-500 border-slate-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${detailDeviceData.status === 'online' ? 'bg-emerald-500' : detailDeviceData.status === 'unknown' ? 'bg-slate-400' : 'bg-red-500 animate-pulse'}`}></span>
                  {detailDeviceData.status.toUpperCase()}
                </span>
              </div>
              
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Online</p>
                <p className="text-sm font-bold text-emerald-600">{detailOnlineCount}x</p>
              </div>
              
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Offline</p>
                <p className="text-sm font-bold text-red-600">{detailOfflineCount}x</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Terakhir Disinkronisasi</p>
                <p className="text-xs font-medium text-slate-700">
                  {detailDeviceData.last_synced_at 
                    ? new Date(detailDeviceData.last_synced_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }) + ' WIB'
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Link href="/admin?tab=devices" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Kembali
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-indigo-50/30">
          <h2 className="text-base font-bold flex items-center gap-2 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Riwayat Aktivitas Perangkat
          </h2>
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
              {detailLogs.map((log, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-4 text-center text-slate-400 font-medium text-sm">{offset + index + 1}</td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="text-slate-700 font-medium text-sm">{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}</div>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="text-slate-500 font-mono text-xs">{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })} WIB</div>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {log.status === 'online' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-200">
                        ONLINE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-200">
                        OFFLINE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {detailLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-500 text-sm font-medium">Belum ada riwayat tercatat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={Math.ceil(totalDetailItems / itemsPerPage) || 1}
          totalItems={totalDetailItems}
          itemsPerPage={itemsPerPage}
          tab="devices"
        />
      </div>
    </div>
  );
}
