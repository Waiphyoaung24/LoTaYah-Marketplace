import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSession } from '@/lib/redis/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const userName = name || email.split('@')[0];

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: userName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create user profile if doesn't exist
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (profileError?.code === 'PGRST116') {
        await supabase.from('users').insert({
          id: data.user.id,
          email,
          name: userName,
          is_admin: false,
          store_verified: false,
        });
      }
    }

    // Email confirmation required
    if (data.user && !data.session) {
      return NextResponse.json({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: userName,
          is_admin: false,
          store_verified: false,
        },
        requiresEmailConfirmation: true,
        message: 'Please check your email to confirm your account.',
      });
    }

    // Session available (email confirmation disabled)
    if (data.session) {
      await createSession({
        userId: data.user!.id,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at 
          ? data.session.expires_at * 1000 
          : Date.now() + 3600000,
      });

      return NextResponse.json({
        user: {
          id: data.user!.id,
          email: data.user!.email,
          name: userName,
          is_admin: false,
          store_verified: false,
        },
      });
    }

    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
