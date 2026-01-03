/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Skip API routes during static export
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
