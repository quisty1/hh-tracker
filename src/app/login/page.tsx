// Login page: redirect to the dashboard if already signed in
import { redirect } from 'next/navigation';
import { LoginView } from '@/components/login-view';
import { getSession } from '@/lib/session';

export default async function LoginPage() {
  const session = await getSession();
  if (session.isLoggedIn && session.userId) {
    redirect('/');
  }

  return <LoginView />;
}
