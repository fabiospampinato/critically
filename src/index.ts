
/* IMPORT */

import Utils from './utils';
import type {Options, Result} from './types';

/* MAIN */

const critically = async ( options: Options = {} ): Promise<Result> => {

  const minify = ( options.minify !== false );

  if ( !options.document && !options.html ) throw new Error ( 'You need to provide either a document or some HTML' );

  let doc = options.document || globalThis.window?.document;

  if ( options.html ) doc = Utils.document.get ( doc, options.html );

  let clone = options.html ? doc : Utils.document.clone ( doc );

  if ( options.transform ) clone = options.transform ( clone ) || clone;

  const stylesheets = await Utils.stylesheets.get ( clone );
  const families = Utils.font.getFamilies ( clone );
  const css = Utils.stylesheets.getCritical ( clone, stylesheets, families, { minify } );

  Utils.stylesheets.remove ( clone );

  if ( css ) {

    const style = doc.createElement ( 'style' );

    style.setAttribute ( 'data-critical', 'true' ); // So that we can target it later on easily

    style.innerHTML = css;

    clone.head.appendChild ( style );

  }

  const html = Utils.html.get ( clone, { includeDocType: true, minify } );

  return { clone, html, css };

};

/* EXPORT */

export default critically;
