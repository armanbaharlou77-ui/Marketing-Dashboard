/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath: "/dashboard",
  trailingSlash: true,
  output: "export",
  allowedDevOrigins: ["192.168.100.54"],
  images: {
    unoptimized: true,
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  logging: {
    level: "error",
  },
};

export default nextConfig;
