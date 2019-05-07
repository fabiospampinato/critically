
/* IMPORT */

import './types';
import Utils from './utils';

/* CRITICALLY */

async function critically ( options: Options = {} ): Promise<Result> {

  const minify = !( options.minify === false );

  if ( !options.document && !options.html ) throw new Error ( 'You need to provide either a document or some HTML' );

  let doc = options.document || document;

  if ( options.html ) doc = Utils.document.get ( options.html, doc );

  let clone = options.html ? doc : Utils.document.clone ( doc );

  if ( options.transform ) clone = options.transform ( clone ) || clone;

  const stylesheets = await Utils.stylesheets.get ( clone ),
        families = Utils.font.getFamilies ( clone ),
        css = Utils.stylesheets.getCritical ( clone, stylesheets, families, { minify } );

  Utils.stylesheets.remove ( clone );

  if ( css ) {

    const style = doc.createElement ( 'style' );

    style.setAttribute ( 'data-critical', 'true' ); // So that we can target it later easily

    style.innerHTML = css;

    clone.head.appendChild ( style );

  }

  const html = Utils.html.get ( clone, { includeDocType: true, minify } );

  return { html, css };

}

/* EXPORT */

export default critically;
