import type { ReactNode } from "react";
import { Helmet } from "react-helmet";
import styles from "./index.module.scss";

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
      <div id="children" className={styles.container}>
        {children}
      </div>
    </>
  );
}
