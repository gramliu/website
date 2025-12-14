import Markdoc from "@markdoc/markdoc";

// Keep this config intentionally minimal; extend with custom tags/nodes as needed.
export const markdocConfig = {};

export type MarkdocContent = any;

export function parseMarkdoc(source: string): MarkdocContent {
  const ast = Markdoc.parse(source);
  return Markdoc.transform(ast, markdocConfig);
}

