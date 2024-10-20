/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "img.clerk.com",
        },
        {
          protocol: "https",
          hostname: "images.clerk.dev",
        },
        {
          protocol: "https",
          hostname: "uploadthing.com",
        },
        {
          protocol: "https",
          hostname: "placehold.co",
        },
        {
            protocol: "https",
            hostname: "utfs.io", // Add this line to allow images from utfs.io
          },
      ],
      domains: ['firebasestorage.googleapis.com'], // Add the Firebase storage domain
    },
  };
  
  export default nextConfig;
  