/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // ── Fix: use resolve.alias instead of NormalModuleReplacementPlugin ──
      // NormalModuleReplacementPlugin was producing "sodium-native/index.js.js"
      // (double .js extension) which caused a Critical dependency webpack crash.
      // resolve.alias intercepts at module-graph resolution time — no path
      // mangling, no dynamic require analysis issues.
      config.resolve.alias = {
        ...config.resolve.alias,
        'sodium-native': path.resolve(__dirname, './src/utils/emptyModule.js'),
        'require-addon': path.resolve(__dirname, './src/utils/emptyModule.js'),
      };

      // Stub out Node.js built-ins that have no browser equivalent.
      // @stellar/stellar-sdk uses these on the server side only; Freighter
      // handles all signing in the browser.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
