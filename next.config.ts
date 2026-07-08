import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  output: "standalone",
  devIndicators: false,
};

export default nextConfig;
