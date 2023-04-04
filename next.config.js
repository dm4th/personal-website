const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add an alias for prismjs
    config.resolve.alias['prismjs'] = path.resolve(__dirname, 'node_modules/prismjs');

    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;
