import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

// Cookie session payload (iron-session)
export type SessionData = {
  userId?: number;
  isLoggedIn: boolean;
};

// SESSION_SECRET must be a long random string (see .env.example)
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'hh_tracker_session',
  cookieOptions: {
    // HTTPS-only cookie in production
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    // 30 days
    maxAge: 60 * 60 * 24 * 30,
  },
};

// Reads the session from cookies (Server Components / Route Handlers)
export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

// Returns the session only when the user is logged in, otherwise null
export async function requireSession() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return null;
  }
  return session;
}
