/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Desabilitar warnings de keys durante o build
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Garantir que as rotas sejam tratadas corretamente
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig