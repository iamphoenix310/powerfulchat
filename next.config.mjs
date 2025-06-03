import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**'
      }
    ]
  },
  experimental: {
    serverActions: true
  },
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, '.')
    return config
  }
}

export default nextConfig
