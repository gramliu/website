/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    images: {
      dangerouslyAllowSvg: true,
      allowFutureImage: true,
    },
  },
};

module.exports = nextConfig;
