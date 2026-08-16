import type { Metadata, Viewport } from 'next';
import { Bitter, Karla } from 'next/font/google';
import './globals.css';

const bitter = Bitter({
  subsets: ['latin'],
  variable: '--font-bitter',
  weight: ['500', '600', '700'],
});

const karla = Karla({
  subsets: ['latin'],
  variable: '--font-karla',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Contados — ¿en qué va su ayuda?',
  description:
    'Cuente por WhatsApp qué pasó tras el terremoto y sepa en qué paso va su caso, qué sigue y dónde hacerlo en su municipio.',
};

export const viewport: Viewport = {
  themeColor: '#edece6',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO" className={`${bitter.variable} ${karla.variable}`}>
      <body>{children}</body>
    </html>
  );
}
