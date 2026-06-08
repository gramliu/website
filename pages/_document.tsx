import { Head, Html, Main, NextScript } from "next/document";
import { siteMetadata } from "../src/config/site";

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="title" content={siteMetadata.title} />
        <meta name="description" content={siteMetadata.description} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteMetadata.url} />
        <meta property="og:title" content={siteMetadata.title} />
        <meta property="og:description" content={siteMetadata.description} />
        <meta property="og:image" content={siteMetadata.ogImage} />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={siteMetadata.url} />
        <meta property="twitter:title" content={siteMetadata.title} />
        <meta
          property="twitter:description"
          content={siteMetadata.description}
        />
        <meta property="twitter:image" content={siteMetadata.ogImage} />
        <link rel="icon" href={siteMetadata.favicon} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
