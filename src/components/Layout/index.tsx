import type { ReactNode } from "react";
import { Helmet } from "react-helmet";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Gram Liu</title>
      </Helmet>
      <div id="children" className="h-screen w-screen">
        {children}
      </div>
    </>
  );
}
