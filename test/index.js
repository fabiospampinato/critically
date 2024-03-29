
/* IMPORT */

import {describe} from 'fava';
import {Window} from 'happy-dom';
import critical from '../dist/index.js';

/* MAIN */

//TODO: Test this better, with many more tests that actually work under Node

describe ( 'Critically', it => {

  it ( 'preserves already minimal html', async t => {

    const input = '<!DOCTYPE html><html><head><title>Title</title></head><body><p>Hello world</p></body></html>';
    const window = new Window ();
    const {document} = window;

    document.write ( input );

    globalThis.window = window;

    const {html, css} = await critical ({ document });

    t.is ( html, input );
    t.is ( css, '' );

  });

  it.skip ( 'minifies html', async t => {

    const input = '<!DOCTYPE html><html><head><title>Title</title><style>p { color: pink; }</style></head><body><p>Hello world</p></body></html>';
    const window = new Window ();
    const {document} = window;

    document.write ( input );

    globalThis.window = window;

    const {html, css} = await critical ({ document });

    t.is ( html, input );
    t.is ( css, '' );

  });

});
