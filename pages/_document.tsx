import { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";
import { siteMetadata } from "../src/config/site";
import { env } from "../src/env";

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
        {env.GOOGLE_ANALYTICS_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${env.GOOGLE_ANALYTICS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${env.GOOGLE_ANALYTICS_ID}');
            `}
            </Script>
          </>
        )}
      </body>
    </Html>
  );
}
