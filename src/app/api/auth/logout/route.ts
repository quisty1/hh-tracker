// POST|GET /api/auth/logout — destroy the session and redirect to /login
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

function origin() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export async function POST() {
  const session = await getSession();
  session.destroy();
  // 303 — so the browser follows POST with a GET to /login
  return NextResponse.redirect(new URL('/login', origin()), { status: 303 });
}

export async function GET() {
  const session = await getSession();
  session.destroy();
  return NextResponse.redirect(new URL('/login', origin()));
}
