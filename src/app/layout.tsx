
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/context/CartContext';
import PromotionalBanner from '@/components/layout/PromotionalBanner';
import AppHeader from '@/components/layout/AppHeader';

export const metadata: Metadata = {
  title: 'FlashPrint Designs',
  description: 'Diseñamos y personalizamos el mismo día. Camisetas, Hoodies, Gorras y más.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <CartProvider>
          <PromotionalBanner />
          <AppHeader />
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
