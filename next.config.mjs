/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bundle /info markdown files into the agent stream serverless function
  outputFileTracingIncludes: {
    '/api/agent/stream': ['./info/**/*'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
