/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  allowedDevOrigins: ['192.168.33.25', 'aaz15pz6hna1va.halehapa.com'],
};

module.exports = nextConfig;
