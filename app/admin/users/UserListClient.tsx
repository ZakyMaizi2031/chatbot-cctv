'use client';

import { useState } from "react";
import { addUser } from "./actions";

export default function UserListClient({ users, currentUserEmail }: { users: any[], currentUserEmail: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const res = await addUser(newEmail, newName);
    if (res?.error) {
      setError(res.error);
    } else {
      setIsAdding(false);
      setNewEmail("");
      setNewName("");
    }
    setLoading(false);
  };



  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-base font-bold text-slate-800">Daftar Admin Aktif</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-600/20 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Tambah Admin
        </button>
      </div>

      {isAdding && (
        <div className="p-5 border-b border-slate-100 bg-blue-50/30">
          <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Alamat Email Google</label>
              <input 
                type="email" 
                required
                placeholder="nama@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Nama Lengkap (Opsional)</label>
              <input 
                type="text" 
                placeholder="Nama Staf"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto flex gap-2">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 text-xs font-medium mt-3">{error}</p>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <th className="py-3 px-6 w-12 text-center">No</th>
              <th className="py-3 px-6">Pengguna</th>
              <th className="py-3 px-6">Role</th>
              <th className="py-3 px-6">Tanggal Ditambahkan</th>

            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {users.map((user, index) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 text-center text-slate-400 font-medium">{index + 1}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img src={user.image} alt={user.name || "User"} className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border border-indigo-200 shadow-sm">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-800">{user.name || "Belum Login"}</div>
                      <div className="text-slate-500 text-xs">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-200">
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-500">
                  {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
