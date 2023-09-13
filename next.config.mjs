import nextMdx from "@next/mdx";

const withMdx = nextMdx({
  // By default only the .mdx extension is supported.
  extension: /\.mdx?$/,
  options: {
    /* providerImportSource: …, otherOptions… */
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.gr-assets.com",
        port: "",
        pathname: "/images/S/compressed.photo.goodreads.com/**",
      },
    ],
  },
  pageExtensions: ["md", "mdx", "tsx", "ts", "jsx", "js"],
};

export default withMdx(nextConfig);
