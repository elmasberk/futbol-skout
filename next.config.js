/** @type {import('next').NextConfig} */
const nextConfig = {
  // Capacitor için statik export gerekli
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // Static export'ta next/image optimize edemez
  },
}
module.exports = nextConfig
