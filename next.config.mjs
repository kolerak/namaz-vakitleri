/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Chrome Eklentisi için şart
    qualities: [75, 80, 100],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "tr.wikipedia.org" },
      { protocol: "https", hostname: "api.teleport.org" },
    ],
  },
  reactStrictMode: true,
};
export default nextConfig;
