import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      // "Kelola Kepengurusan" uploads up to four images (4 MB each) in one request.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
