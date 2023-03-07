# Critically

Tiny performant library for extracting the critical CSS.

Compared to [`critical`](https://github.com/addyosmani/critical) this library:

- Is so much smaller, at about 2kb in size. `critical` instead needs to download a whole browser.
- It works in the browser too, which is useful if you need to store the previous state of the app or a skeleton of it.
- Will output slightly larger strings, as only simple minification techniques are performed.
- Is much faster.

## Install

```sh
npm install --save critically
```

## API

This library provides the following interface:

```ts
type Options = {
  document?: Document, // The document from which to extract the critical CSS
  html?: string, // The HTML string from which to extract the critical CSS
  minify?: boolean, // Whether to enable minification or not
  transform?: ( doc: Document ) => Document | void // A function that will be run before extracting the critical CSS, useful for removing unneeded elements from the document
};

type Result = {
  clone: Document, // The cloned document object
  html: string, // Full HTML with the critical CSS embedded in it
  css: string // Only the critical CSS
};

async function critically ( options: Options ): Promise<Result>;
```

You need to provide either an HTML string or a document object. The document will be cloned, so you can modify it safely via the `transform` function.

## Usage

```ts
import critically from 'critically';

const {clone, html, css} = await critically ({ document });
```

## License

MIT © Fabio Spampinato
