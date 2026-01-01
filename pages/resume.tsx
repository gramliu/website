import Head from "next/head";
import Layout from "../src/components/Layout";

export default function Resume() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Layout>
        <div className="flex justify-center items-center min-h-screen p-8">
          <iframe
            src="/Gram_Liu_Resume.pdf"
            className="w-full max-w-4xl h-[90vh] border-0"
            title="Resume"
          />
        </div>
      </Layout>
    </>
  );
}
