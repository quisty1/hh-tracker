import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

// Данные cookie-сессии (iron-session)
export type SessionData = {
  userId?: number;
  isLoggedIn: boolean;
};

// SESSION_SECRET должен быть длинной случайной строкой (см. .env.example)
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'hh_tracker_session',
  cookieOptions: {
    // HTTPS-only cookie в production
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    // 30 дней
    maxAge: 60 * 60 * 24 * 30,
  },
};

// Читает сессию из cookies (для Server Components / Route Handlers)
export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

// Возвращает сессию только если пользователь залогинен, иначе null
export async function requireSession() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return null;
  }
  return session;
}
