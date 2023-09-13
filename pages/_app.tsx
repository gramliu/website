import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/fonts.scss";
import "../styles/shadcn.css";
import "../styles/global.scss";
import { MDXProvider } from "@mdx-js/react";
import { ReactNode } from "react";
import { MDXComponents } from "mdx/types";
import { MergeComponents } from "@mdx-js/react/lib";

const mdxComponents = {
  a: ({ children, ...props }: { children: ReactNode }) => (
    <a
      {...props}
      target="_blank"
      rel="noreferrer"
      className="hoverLink text-highlight no-underline"
    >
      {children}
    </a>
  ),
} as MDXComponents | MergeComponents;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Gram Liu</title>
      </Head>
      <MDXProvider components={mdxComponents}>
        <Component {...pageProps} />
      </MDXProvider>
    </>
  );
}

export default MyApp;
