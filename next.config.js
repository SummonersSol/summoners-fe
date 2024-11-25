/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'summoners-be.kidas.app',
          },
          {
            protocol: 'https',
            hostname: 'raw.githubusercontent.com',
          },
          {
            protocol: 'http',
            hostname: 'localhost',
            port: '8081',
          },
        ]
    },
    eslint: {
      dirs: ["src"],
    },
    transpilePackages: ["next-mdx-remote"],
}

module.exports = nextConfig
