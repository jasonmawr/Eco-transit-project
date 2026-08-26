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
  title: 'Lướt Khói Chạm Xanh — Nền tảng di chuyển xanh & tích lũy điểm thưởng tại TP.HCM',
  description: 'Lướt Khói Chạm Xanh: Lập kế hoạch đi lại bằng xe buýt và tàu Metro Số 1 Bến Thành - Suối Tiên, tích lũy điểm thưởng từ ảnh chụp vé, đổi voucher Xanh SM và chia sẻ hành trình xanh.',
  keywords: [
    'Lướt Khói Chạm Xanh',
    'Metro Số 1 TP.HCM',
    'Metro Bến Thành Suối Tiên',
    'Xe buýt điện VinBus TP.HCM',
    'Giao thông xanh TP.HCM',
    'Lộ trình Metro',
    'Đổi voucher Xanh SM',
    'XanhWrap',
    'Du lịch xanh Sài Gòn'
  ],
  authors: [{ name: 'Chiến dịch Lướt Khói Chạm Xanh' }],
  creator: 'Lướt Khói Chạm Xanh',
  publisher: 'Chiến dịch Lướt Khói Chạm Xanh TP.HCM',
  metadataBase: new URL('https://eco-transit-project-web.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Lướt Khói Chạm Xanh — Hành Trình Xanh Cùng Metro Số 1 TP.HCM',
    description: 'Khám phá các ga Metro Số 1, tối ưu lộ trình xe buýt - metro, quét vé tích điểm và đổi voucher quà tặng hấp dẫn cùng chiến dịch Lướt Khói Chạm Xanh!',
    url: 'https://eco-transit-project-web.vercel.app',
    siteName: 'Lướt Khói Chạm Xanh',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/images/places/cho_ben_thanh_main.png',
        width: 1200,
        height: 630,
        alt: 'Lướt Khói Chạm Xanh TP.HCM',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lướt Khói Chạm Xanh — Di chuyển xanh thông minh tại TP.HCM',
    description: 'Lập lộ trình Metro Số 1 & Bus, tích điểm đổi voucher Xanh SM và quà tặng độc quyền.',
    images: ['/images/places/cho_ben_thanh_main.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'j0KL4O2c5k5miA7pf0PbAKfl3yakUmsN90NHhh9Rl-k',
  },
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Lướt Khói Chạm Xanh',
    'applicationCategory': 'TravelApplication',
    'operatingSystem': 'All',
    'description': 'Nền tảng hỗ trợ lập kế hoạch di chuyển xanh bằng Metro Tuyến 1 và xe buýt, tích điểm từ vé, đổi voucher Xanh SM và khám phá các điểm đến xanh tại TP.HCM.',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'VND',
    },
    'inLanguage': 'vi',
  };

  return (
    <html lang="vi" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-eco-soft text-eco-ink">
        {children}
      </body>
    </html>
  );
}
