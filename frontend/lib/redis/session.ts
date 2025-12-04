import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';

/**
 * Simple Session Management with Upstash Redis
 * 
 * Features:
 * - User Authentication: Remember logged-in state across pages/refreshes
 * - Personalization: Store auth status and user preferences
 * - Security: HttpOnly cookies, secure flags, proper expiration
 */

// Initialize Redis with read-your-writes consistency
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  readYourWrites: true, // Ensures session consistency
});

// Configuration
const SESSION_COOKIE = 'session_id';
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

/**
 * Session data stored in Redis
 */
export interface SessionData {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// ============================================
// Cookie Management
// ============================================

/**
 * Get session ID from cookie
 */
export async function getSessionId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

/**
 * Set session ID cookie with security flags
 */
export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,                                    // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production',    // HTTPS only in production
    sameSite: 'lax',                                  // CSRF protection
    maxAge: SESSION_TTL,
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

// ============================================
// Session Management
// ============================================

/**
 * Create a new session
 */
export async function createSession(data: SessionData): Promise<string> {
  const sessionId = crypto.randomUUID();
  
  // Store session data as hash in Redis
  await redis.hset(`session:${sessionId}`, {
    userId: data.userId,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt.toString(),
  });
  
  // Set expiration
  await redis.expire(`session:${sessionId}`, SESSION_TTL);
  
  // Set cookie
  await setSessionCookie(sessionId);
  
  return sessionId;
}

/**
 * Get session data
 */
export async function getSession(): Promise<SessionData | null> {
  const sessionId = await getSessionId();
  if (!sessionId) return null;
  
  const data = await redis.hgetall(`session:${sessionId}`);
  if (!data || Object.keys(data).length === 0) return null;
  
  return {
    userId: data.userId as string,
    accessToken: data.accessToken as string,
    refreshToken: data.refreshToken as string,
    expiresAt: Number(data.expiresAt),
  };
}

/**
 * Update session tokens (for refresh)
 */
export async function updateSession(updates: Partial<SessionData>): Promise<boolean> {
  const sessionId = await getSessionId();
  if (!sessionId) return false;
  
  const updateData: Record<string, string> = {};
  if (updates.accessToken) updateData.accessToken = updates.accessToken;
  if (updates.refreshToken) updateData.refreshToken = updates.refreshToken;
  if (updates.expiresAt) updateData.expiresAt = updates.expiresAt.toString();
  
  if (Object.keys(updateData).length > 0) {
    await redis.hset(`session:${sessionId}`, updateData);
    await redis.expire(`session:${sessionId}`, SESSION_TTL);
  }
  
  return true;
}

/**
 * Delete session (logout)
 */
export async function deleteSession(): Promise<void> {
  const sessionId = await getSessionId();
  if (sessionId) {
    await redis.del(`session:${sessionId}`);
  }
  await clearSessionCookie();
}

// ============================================
// Session Validation (Security)
// ============================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null && session.expiresAt > Date.now();
}

/**
 * Check if token needs refresh (expires in < 5 minutes)
 */
export async function needsTokenRefresh(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  
  const fiveMinutes = 5 * 60 * 1000;
  return session.expiresAt < Date.now() + fiveMinutes;
}

/**
 * Get user ID from session (for authorization checks)
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId || null;
}

export { redis };
