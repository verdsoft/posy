/** @type {import('next').NextConfig} */
const nextConfig = {
  // Replace next-transpile-modules with native transpilePackages
  transpilePackages: ['jspdf', 'canvg', 'core-js'],

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  devIndicators: false,

  webpack(config, { isServer }) {
    console.log('isServer:', isServer);
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false, // fix for .mjs issues in jspdf/canvg/core-js
      },
    });

    return config;
  },
 
  
};

export default nextConfig;
