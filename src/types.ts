
/* TYPES */

type Options = {
  document?: Document,
  html?: string,
  minify?: boolean,
  transform?: ( doc: Document ) => Document | void
};

type Result = {
  html: string,
  css: string
};

/* EXPORT */

export {Options, Result};
