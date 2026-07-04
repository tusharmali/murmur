/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root (other lockfiles exist higher up on this machine).
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
