import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-400/20 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            Kreativa CCTV
          </span>
        </div>
        <div>
          <Link 
            href="/admin" 
            className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
          >
            Masuk Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto w-full -mt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in-up">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          Sistem Monitoring Real-time Aktif
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Pantau Status CCTV Anda Secara <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Otomatis.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Terintegrasi langsung dengan IMOU Cloud. Dapatkan notifikasi langsung ke Telegram saat kamera offline dan pantau riwayat lengkapnya di Dasbor Admin.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <Link 
            href="/admin"
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95"
          >
            Buka Dashboard Admin
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
          <a 
            href="https://t.me/your_telegram_bot_link_here" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-white text-slate-700 font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#229ED9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-18.6 7.227c-1.2.466-1.184 1.39.227 1.822l4.814 1.503 11.233-7.086c.535-.327 1.025-.152.623.205l-9.1 8.214-.383 5.71c.563 0 .81-.257 1.123-.563l2.695-2.617 5.603 4.14c1.034.57 1.777.275 2.032-.93l3.676-17.3c.358-1.428-.52-2.072-1.632-1.58z"/></svg>
            Grup Telegram
          </a>
        </div>
      </main>

      {/* Feature Highlight / Stats */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Real-time Webhook</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Mendeteksi otomatis kamera yang terputus dari jaringan IMOU dalam hitungan detik.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Smart Verification</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Verifikasi Ping otomatis untuk mencegah notifikasi palsu akibat koneksi internet tidak stabil.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Pencatatan Riwayat</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Semua kejadian mati dan nyala direkam secara permanen ke database untuk audit masa depan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
