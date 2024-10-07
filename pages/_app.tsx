import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/shadcn.css";
import "../styles/global.scss";
import {
  Noto_Sans_Mono,
  Open_Sans,
  Roboto_Slab
} from "next/font/google";
import clsx from "clsx";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});
const notoSansMono = Noto_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-noto-sans-mono",
});
const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Gram Liu</title>
      </Head>
      <main
        className={clsx(
          openSans.variable,
          notoSansMono.variable,
          robotoSlab.variable,
          "font-sans"
        )}
      >
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
