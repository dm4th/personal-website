import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bundle /info markdown files into the agent stream serverless function
  outputFileTracingIncludes: {
    '/api/agent/stream': ['./info/**/*'],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // Only upload source maps in CI (SENTRY_AUTH_TOKEN must be set)
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
});
