'use server';

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addUser(email: string, name: string) {
  try {
    if (!email) return { error: "Email wajib diisi" };
    
    await sql`
      INSERT INTO users (email, name, role) 
      VALUES (${email}, ${name || null}, 'admin')
      ON CONFLICT (email) DO NOTHING
    `;
    
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add user:", error);
    return { error: "Gagal menambah pengguna." };
  }
}

