import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: [
    "baileys",
    "@whiskeysockets/baileys",
    "pino",
    "qr-image",
    "qrcode",
    "glob",
    "sharp",
    "canvas",
  ],
};

export default nextConfig;
