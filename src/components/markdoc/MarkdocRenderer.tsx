import Markdoc from "@markdoc/markdoc";
import Link from "next/link";
import React, { type ComponentPropsWithoutRef, type ReactNode } from "react";

type AnchorProps = ComponentPropsWithoutRef<"a"> & { href?: string };

function SmartLink({ href = "", children, ...props }: AnchorProps) {
  const isInternal =
    href.startsWith("/") || href.startsWith("#") || href.startsWith("?");

  if (isInternal) {
    return (
      <Link
        href={href}
        className="hoverLink text-highlight no-underline"
        {...(props as unknown as Omit<
          ComponentPropsWithoutRef<typeof Link>,
          "href"
        >)}
      >
        {children as ReactNode}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="hoverLink text-highlight no-underline"
      {...props}
    >
      {children}
    </a>
  );
}

const components = {
  a: SmartLink,
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-6"
      {...props}
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary mt-10 mb-4"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="text-xl md:text-2xl font-bold tracking-tight text-text-primary mt-8 mb-3"
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="text-base md:text-lg leading-8 text-text-primary mb-5" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc pl-6 text-text-primary mb-6 space-y-2" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal pl-6 text-text-primary mb-6 space-y-2" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="text-base md:text-lg leading-8" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-l-2 border-divider pl-4 text-text-faded italic my-6"
      {...props}
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="overflow-x-auto rounded-md border border-gray-500 bg-bgcolor-primary p-4 my-6 text-sm"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="font-mono text-sm" {...props} />
  ),
} as const;

export default function MarkdocRenderer({
  content,
}: {
  content: any;
}) {
  const rendered = Markdoc.renderers.react(content as any, React, { components });
  return <>{rendered}</>;
}

