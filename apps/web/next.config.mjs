/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracing: false,
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/healthz',
        destination: `${apiBaseUrl}/healthz`,
      },
      {
        source: '/readyz',
        destination: `${apiBaseUrl}/readyz`,
      },
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
// Dev server restart trigger comment
