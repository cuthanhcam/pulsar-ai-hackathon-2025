/** @type {import('next').NextConfig} */
const nextConfig = {
  // EXTREME Performance optimizations
  swcMinify: true,
  productionBrowserSourceMaps: false,
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable all source maps in development too
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Note: compiler.removeConsole is not supported in Turbopack mode
  // Turbopack handles tree-shaking automatically, no need for modularizeImports

  // Aggressive webpack optimization
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // EXTREME optimization for dev mode
      config.cache = {
        type: 'filesystem',
        compression: 'gzip',
        cacheDirectory: '.next/cache/webpack',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      }
      
      // Disable source maps for faster builds
      config.devtool = false
      
      // Optimize module resolution
      config.resolve.symlinks = false
      config.resolve.cacheWithContext = false
      
      // Minimize module parsing
      config.module.noParse = /node_modules\/(react|react-dom|next)\/dist/
    }
    
    // Optimize all modes
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return module.size() > 160000
            },
            name(module) {
              const hash = require('crypto').createHash('sha1')
              hash.update(module.identifier())
              return hash.digest('hex').substring(0, 8)
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: false,
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
        maxInitialRequests: 25,
        minSize: 20000,
      },
    }
    
    return config
  },

  // Allow Tailscale tunnel + external packages for Gemini AI
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
    serverComponentsExternalPackages: ['@google/generative-ai'],
    // Turbopack auto-optimizes imports, no manual config needed
    
    // TURBOPACK - Maximum speed
    turbo: {
      resolveAlias: {
        // Use lighter alternatives
        canvas: './empty-module.js',
      },
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
