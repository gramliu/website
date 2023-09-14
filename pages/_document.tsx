import { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";
import { env } from "../src/env";

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="title" content="Gram Liu" />
        <meta
          name="description"
          content="Hi! I'm Gram and I build things, from web apps to full stack to IoT. I'm a senior at Carnegie Mellon University pursuing a major in Electrical and Computer Engineering. I am a big fan of technology and how it changes the way we think about and address problems from education to health care, consistently pushing the boundaries of what we think is possible."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gramliu.com/" />
        <meta property="og:title" content="Gram Liu" />
        <meta
          property="og:description"
          content="Hi! I'm Gram and I build things, from web apps to full stack to IoT. I'm a senior at Carnegie Mellon University pursuing a major in Electrical and Computer Engineering. I am a big fan of technology and how it changes the way we think about and address problems from education to health care, consistently pushing the boundaries of what we think is possible."
        />
        <meta property="og:image" content="/images/profilePhoto.jpg" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://gramliu.com/" />
        <meta property="twitter:title" content="Gram Liu" />
        <meta
          property="twitter:description"
          content="Hi! I'm Gram and I build things, from web apps to full stack to IoT. I'm a senior at Carnegie Mellon University pursuing a major in Electrical and Computer Engineering. I am a big fan of technology and how it changes the way we think about and address problems from education to health care, consistently pushing the boundaries of what we think is possible."
        />
        <meta property="twitter:image" content="/images/profilePhoto.jpg" />
        <link rel="icon" href="/images/logo.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
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
      </body>
    </Html>
  );
}
