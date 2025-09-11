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
        // Aplicar headers JSON para rotas administrativas específicas
        source: '/api/admin/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
        ],
      },
      {
        // Outras rotas da API que precisam de JSON (adicione conforme necessário)
        source: '/api/guests/:path*',
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