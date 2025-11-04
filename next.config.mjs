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

    // Handle PDFKit font files (.afm files)
    config.module.rules.push({
      test: /\.afm$/,
      type: 'asset/source',
    });

    // Server-side: Keep PDFKit external to access font files from node_modules
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('pdfkit');
      }
    }

    // Client-side: Exclude server-only modules from bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
        child_process: false,
      };

      config.externals = config.externals || [];
      config.externals.push({
        pdfkit: 'pdfkit',
      });
    }

    return config;
  },
 
  
};



export default nextConfig;
