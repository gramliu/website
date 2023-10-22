import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/fonts.scss";
import "../styles/shadcn.css";
import "../styles/global.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Gram Liu</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
