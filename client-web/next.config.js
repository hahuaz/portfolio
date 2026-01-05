/** @type {import('next').NextConfig} */
const nextConfig = {
  // webpack: (
  //   config,
  //   { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  // ) => {
  //   config.module.rules.push({
  //     test: /\.svg$/,
  //     use: ['@svgr/webpack'],
  //   });
  //   // Important: return the modified config
  //   return config;
  // },

  distDir: 'dist',

  // static site generation
  output: 'export',
};

module.exports = nextConfig;
