import './globals.css';
import React from 'react';
import { Outfit, Inter } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'EcoTransit — Nền tảng di chuyển xanh & tích lũy điểm thưởng tại TP.HCM',
  description: 'Lập kế hoạch đi lại bằng xe buýt và tàu metro, tích lũy điểm thưởng từ ảnh chụp vé, đổi voucher và chia sẻ hoá đơn thời gian di chuyển xanh thú vị.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${outfit.variable} ${inter.variable}`}>
      <body className="antialiased min-h-screen bg-eco-soft text-eco-ink">
        {children}
      </body>
    </html>
  );
}
