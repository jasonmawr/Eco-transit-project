/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracing: false,
  async rewrites() {
    // Only apply API proxy rewrites in development to avoid hardcoding localhost in production
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/healthz',
          destination: 'http://localhost:3001/healthz',
        },
        {
          source: '/readyz',
          destination: 'http://localhost:3001/readyz',
        },
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/api/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
// Dev server restart trigger comment
