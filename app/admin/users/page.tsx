import { sql } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserListClient from "./UserListClient";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'admin') {
    redirect("/admin");
  }

  const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola akses staf dan teknisi ke sistem dashboard CCTV Kreativa.
          </p>
        </div>
      </div>

      <UserListClient users={users} currentUserEmail={session.user?.email || ""} />
    </div>
  );
}
