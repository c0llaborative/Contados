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
    'Sepa en cuál paso de la ruta de atención está trabado su hogar tras el terremoto, qué sigue y qué puede hacer hoy.',
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
