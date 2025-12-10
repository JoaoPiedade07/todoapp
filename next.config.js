/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Desabilitar warnings de keys durante o build
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig