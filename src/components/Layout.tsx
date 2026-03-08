import Head from "next/head";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Gram Liu</title>
      </Head>
      <div id="children" className="h-screen w-screen">
        {children}
      </div>
    </>
  );
}
