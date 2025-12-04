import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  getSession, 
  createSession, 
  updateSession, 
  deleteSession,
  needsTokenRefresh 
} from '@/lib/redis/session';

/**
 * GET - Check authentication status
 * Returns user data if authenticated
 */
export async function GET() {
  try {
    const session = await getSession();

    // No Redis session - check Supabase
    if (!session) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ authenticated: false, user: null });
      }

      // Create Redis session from Supabase session
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      if (supabaseSession) {
        await createSession({
          userId: user.id,
          accessToken: supabaseSession.access_token,
          refreshToken: supabaseSession.refresh_token,
          expiresAt: supabaseSession.expires_at 
            ? supabaseSession.expires_at * 1000 
            : Date.now() + 3600000,
        });
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return NextResponse.json({
        authenticated: true,
        user: profile || {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0],
          is_admin: false,
          store_verified: false,
        },
      });
    }

    // Refresh token if needed
    if (await needsTokenRefresh()) {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: session.refreshToken,
      });

      if (error || !data.session) {
        await deleteSession();
        return NextResponse.json({ authenticated: false, user: null });
      }

      await updateSession({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at 
          ? data.session.expires_at * 1000 
          : Date.now() + 3600000,
      });
    }

    // Get user profile from database
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.userId)
      .single();

    return NextResponse.json({
      authenticated: true,
      user: profile || { id: session.userId, is_admin: false, store_verified: false },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}

/**
 * POST - Manually refresh session
 */
export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: session.refreshToken,
    });

    if (error || !data.session) {
      await deleteSession();
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    await updateSession({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at 
        ? data.session.expires_at * 1000 
        : Date.now() + 3600000,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
