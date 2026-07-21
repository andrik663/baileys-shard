import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "baileys",
    "@whiskeysockets/baileys",
    "pino",
    "qr-image",
    "qrcode",
    "glob",
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Baileys uses native bindings in some optional deps — ignore them
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "sharp",
        "canvas",
      ];
    }
    return config;
  },
};

export default nextConfig;
