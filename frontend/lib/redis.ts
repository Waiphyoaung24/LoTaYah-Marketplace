/**
 * Redis Session Management - Re-exports
 */
export { 
  redis,
  getSessionId,
  setSessionCookie,
  clearSessionCookie,
  createSession,
  getSession,
  updateSession,
  deleteSession,
  isAuthenticated,
  needsTokenRefresh,
  getSessionUserId,
  type SessionData,
} from './redis/session';
