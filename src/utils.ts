
/* UTILS */

const Utils = {

  document: {

    clone ( doc: Document ): Document {

      const clone = Utils.document.create ( doc ),
            html = doc.documentElement.outerHTML;

      clone.write ( html );

      return clone;

    },

    create ( doc: Document ): Document {

      return doc.implementation.createHTMLDocument ();

    },

    get ( html: string, doc: Document ): Document {

      const d = Utils.document.create ( doc );

      d.write ( html );

      return d;

    },

    isRendered ( doc: Document ): boolean { // If the document is not rendered/mounted some style-related features won't be retrievable

      const getStyle = doc.defaultView ? doc.defaultView.getComputedStyle : getComputedStyle; // Improved support for Node.js

      return !!getStyle ( doc.documentElement! ).fontFamily; // If there's no font-family set then the document is not rendered/mounted

    }

  },

  html: {

    get ( doc: Document, options: { includeDocType: boolean, minify: boolean } = { includeDocType: true, minify: true } ): string {

      let html = doc.documentElement.outerHTML;

      if ( options.includeDocType ) {

        const doctype = Utils.html.getDocType ( doc );

        html = `${doctype}${html}`;

      }

      return options.minify ? Utils.html.minify ( html ) : html;

    },

    getDocType ( doc: Document ): string {

      if ( !doc.doctype || typeof XMLSerializer === 'undefined' ) return '<!DOCTYPE html>'; // Improved support for Node.js

      return new XMLSerializer ().serializeToString ( doc.doctype );

    },

    minify ( html: string ): string {

      if ( html.includes ( '<pre' ) ) return html.trim (); // Bailing out of minification because it will probably break things

      return html.trim ().replace ( />\s+</g, '><' ); // This might be sligthly unsafe

    }

  },

  css: {

    minify ( css: string ): string {

      return css.trim ().replace ( /\s*([{}|:;,])\s+/g, '$1' ).replace ( /;}/g, '}' ); // This might be sligthly unsafe

    }

  },

  stylesheet: {

    get ( css: string, doc: Document ): StyleSheet | null {

      const style = doc.createElement ( 'style' );

      style.setAttribute ( 'media', 'not screen and ( min-width: 1px )' ); // Un-matchable media query, ensuring this stylesheet won't mess-up the document

      style.innerText = css;

      doc.head.appendChild ( style );

      const {sheet} = style;

      doc.head.removeChild ( style );

      return sheet;

    },

    getCritical ( doc: Document, stylesheet, families: string[], options: { minify: boolean } ): string {

      let css = '';

      const {rules} = stylesheet,
            rulesFont: CSSFontFaceRule[] = [];

      for ( let id in rules ) {

        const {cssText, selectorText, style, styleMap} = rules[id];

        if ( !cssText ) continue;

        if ( selectorText ) { // Regular selector

          if ( styleMap && !styleMap.size ) continue; // No styles set

          const selector = selectorText.replace ( /(\w)\:+(?:[a-z0-9_-]+)(?:\([^)]*\))?/gmi, '$1' ); // Removing pseudoselectors, or the selector may be mistakenly deleted

          if ( doc.querySelectorAll ( selector ).length ) css += ` ${cssText}`;

        } else if ( cssText.startsWith ( '@font-face' ) ) { // @font-face

          const {fontFamily} = style;

          if ( !fontFamily ) continue;

          if ( families.length ) { // Checking now

            if ( families.includes ( Utils.font.sanitizeFamily ( fontFamily ) ) ) css += ` ${cssText}`;

          } else { // Checking later

            rulesFont.push ( rules[id] );

          }

        }

      }

      rulesFont.forEach ( rule => {

        const {cssText, style} = rule,
              {fontFamily} = style;

        if ( !fontFamily ) return;

        const re = new RegExp ( `font(-family)?:.*?${Utils.font.sanitizeFamily ( fontFamily )}.*?[;}]`, 'gi' );

        if ( re.test ( css ) ) css+= ` ${cssText}`;

      });

      if ( options.minify ) css = Utils.css.minify ( css );

      return css;

    }

  },

  stylesheets: {

    async get ( doc: Document ): Promise<StyleSheet[]> {

      if ( Utils.document.isRendered ( doc ) && doc.styleSheets.length ) { // Stylesheets found

        return Object.values ( doc.styleSheets );

      } else { // Creating stylesheets from <style> and <link rel="stylesheet"> nodes

        const stylesheets: StyleSheet[] = [],
              nodes = Utils.stylesheets.getNodes ( doc );

        for ( let i = 0, l = nodes.length; i < l; i++ ) {

          const node = nodes[i],
                {innerText} = node,
                href = node.getAttribute ( 'href' ),
                css = href ? await fetch ( href, { credentials: 'include' } ).then ( res => res.text () ) : innerText,
                stylesheet = Utils.stylesheet.get ( css, doc );

          if ( !stylesheet || stylesheet.disabled ) continue;

          stylesheets.push ( stylesheet );

        }

        return stylesheets;

      }

    },

    getCritical ( doc: Document, stylesheets: StyleSheet[], families: string[], options: { minify: boolean } ): string {

      return stylesheets.map ( stylesheet => Utils.stylesheet.getCritical ( doc, stylesheet, families, options ) ).join ( '' );

    },

    getNodes ( doc: Document ): HTMLElement[] {

      const positive: HTMLElement[] = Array.from ( doc.querySelectorAll ( 'style, link[rel="stylesheet"]' ) ),
            negative: HTMLElement[] = Array.from ( doc.querySelectorAll ( 'svg style' ) );

      return positive.filter ( node => !negative.includes ( node ) );

    },

    remove ( doc: Document ): void {

      const nodes = Utils.stylesheets.getNodes ( doc );

      nodes.forEach ( node => {

        const {parentNode} = node;

        if ( !parentNode ) return;

        parentNode.removeChild ( node );

      });

    }

  },

  font: {

    sanitizeFamily ( family: string ): string {

      return family.trim ().replace ( /^"(.*)"$/g, '$1' );

    },

    getFamilies ( doc: Document ): string[] {

      if ( !Utils.document.isRendered ( doc ) ) return [];

      const getStyle = doc.defaultView ? doc.defaultView.getComputedStyle : getComputedStyle, // Improved support for Node.js
            nodes = doc.querySelectorAll ( '*' ),
            familiesMap: { [index: string]: boolean } = {}; // In order to de-duplicate the families

      nodes.forEach ( node => {

        const {fontFamily} = getStyle ( node );

        if ( !fontFamily ) return;

        const families = fontFamily.split ( ',' ).map ( Utils.font.sanitizeFamily );

        families.forEach ( family => familiesMap[family] = true );

      });

      return Object.keys ( familiesMap );

    }

  }

};

/* EXPORT */

export default Utils;
