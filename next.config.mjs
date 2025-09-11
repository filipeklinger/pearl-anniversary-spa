/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    forceSwcTransforms: true,
  },
  async headers() {
    return [
      {
        // Aplicar headers JSON apenas para rotas que não são do NextAuth
        source: '/api/(?!auth).*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
        ],
      },
    ]
  },
}

export default nextConfig