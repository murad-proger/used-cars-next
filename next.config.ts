import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "iat.ru",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "a.d-cd.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.carjunction.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "turbo.azstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.ed.edmunds-media.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;