/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        // ssr and displayName are configured by default
        styledComponents: true,
        removeConsole: true,
        swcMinify: true,
      },
}

module.exports = nextConfig
