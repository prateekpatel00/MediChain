/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // sodium-native and require-addon are Node.js native modules used by
      // @stellar/stellar-base for signing on the server side.
      // In the browser, Freighter extension handles ALL transaction signing,
      // so we can safely stub these out with empty modules.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^sodium-native$/,
          require.resolve('./src/utils/emptyModule.js')
        ),
        new webpack.NormalModuleReplacementPlugin(
          /^require-addon$/,
          require.resolve('./src/utils/emptyModule.js')
        )
      );

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
