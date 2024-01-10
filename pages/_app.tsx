import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/shadcn.css";
import "../styles/global.scss";
import {
  Red_Hat_Display,
  Source_Code_Pro,
  Roboto_Slab,
} from "next/font/google";
import clsx from "clsx";

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat-display",
});
const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
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
          redHatDisplay.variable,
          sourceCodePro.variable,
          robotoSlab.variable,
        )}
      >
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
