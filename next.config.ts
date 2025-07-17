import type { NextConfig } from "next";
import UnoCSS from '@unocss/webpack';

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.plugins = config.plugins || [];
    config.plugins.push(UnoCSS());
    return config;
  },
};

export default nextConfig;
