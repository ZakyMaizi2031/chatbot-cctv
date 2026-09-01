import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "./LoginButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/admin");
  }

  const awaitedSearchParams = await searchParams;
  const isAccessDenied = awaitedSearchParams.error === "AccessDenied";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md w-full p-8 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-600/30 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kreativa CCTV</h1>
          <p className="text-slate-500 text-sm">Masuk untuk mengelola perangkat dan melihat notifikasi.</p>
        </div>

        {isAccessDenied && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <p className="font-semibold mb-1">Akses Ditolak</p>
              <p className="text-red-500">Email Anda tidak terdaftar dalam sistem kami. Silakan hubungi admin untuk mendaftar.</p>
            </div>
          </div>
        )}

        <div className="pt-4">
          <LoginButton />
        </div>

      </div>
    </div>
  );
}
