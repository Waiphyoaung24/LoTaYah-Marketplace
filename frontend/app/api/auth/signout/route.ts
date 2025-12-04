import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteSession } from '@/lib/redis/session';
import { revalidatePath } from 'next/cache';

export async function POST() {
  try {
    const supabase = await createClient();

    // Sign out from Supabase
    await supabase.auth.signOut();

    // Delete Redis session and clear cookie
    await deleteSession();

    // Revalidate all pages
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
