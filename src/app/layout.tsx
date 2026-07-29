import type { Metadata } from 'next';
import { Manrope, Source_Serif_4 } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

// UI-шрифт (CSS-переменная --font-dm-sans для совместимости с токенами)
const manrope = Manrope({
  variable: '--font-dm-sans',
  subsets: ['latin', 'cyrillic'],
});

// Display-шрифт для заголовков
const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'HH Tracker',
  description: 'Личный трекер откликов на hh.ru',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${sourceSerif.variable} h-full antialiased`}
      // Тема из localStorage до гидрации — без мигания
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
