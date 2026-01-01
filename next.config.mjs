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
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
  pageExtensions: ["md", "mdx", "tsx", "ts", "jsx", "js"],
  async headers() {
    return [
      {
        source: "/Gram_Liu_Resume.pdf",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
  webpack: (config, { dev }) => {
    config.module.rules.push({
      test: /\.txt$/,
      use: "raw-loader",
    });
    return config;
  },
};

export default withMdx(nextConfig);
