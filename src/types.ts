
/* MAIN */

type Options = {
  document?: Document,
  html?: string,
  minify?: boolean,
  transform?: ( doc: Document ) => Document | void
};

type Result = {
  clone: Document,
  html: string,
  css: string
};

/* EXPORT */

export type {Options, Result};
