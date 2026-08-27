'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function DashboardCharts({ trendData, onlineCount, offlineCount }: { 
  trendData: { date: string, count: number }[],
  onlineCount: number,
  offlineCount: number
}) {
  const pieData = [
    { name: 'Nyala (Online)', value: onlineCount, color: '#10b981' }, // emerald-500
    { name: 'Mati (Offline)', value: offlineCount, color: '#ef4444' }, // red-500
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
      
      {/* Line Chart: Tren Kerusakan Harian */}
      <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-indigo-200 transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            Tren Pemutusan Koneksi (7 Hari)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Analisis lonjakan notifikasi peringatan CCTV mati per harinya.
          </p>
        </div>
        <div className="p-6 flex-1 w-full h-[320px]">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}
                  itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Kamera Mati"
                  stroke="#ef4444" 
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                  activeDot={{ r: 8, fill: '#ef4444', stroke: '#fff', strokeWidth: 3 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center flex-col text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <p className="font-semibold text-slate-500">Sistem Sangat Stabil!</p>
                <p className="text-sm mt-1">Belum ada laporan CCTV terputus seminggu terakhir.</p>
             </div>
          )}
        </div>
      </div>

      {/* Pie Chart: Rasio Online vs Offline */}
      <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-emerald-200 transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            Kesehatan Jaringan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Persentase CCTV yang sedang aktif.
          </p>
        </div>
        <div className="p-6 flex-1 w-full h-[320px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-slate-600 font-medium ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text for Doughnut */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[25px] text-center pointer-events-none flex flex-col items-center justify-center">
              <span className="block text-4xl font-black text-slate-800 leading-none">{onlineCount + offlineCount}</span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total CCTV</span>
            </div>
        </div>
      </div>
    </div>
  );
}
