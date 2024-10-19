import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_YFm_OqUf.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/dev/components.astro.mjs');
const _page3 = () => import('./pages/kart.astro.mjs');
const _page4 = () => import('./pages/om-oss.astro.mjs');
const _page5 = () => import('./pages/oppskrift/_id_.astro.mjs');
const _page6 = () => import('./pages/oppskrift/_kategori_.astro.mjs');
const _page7 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/dev/components.astro", _page2],
    ["src/pages/kart.astro", _page3],
    ["src/pages/om-oss.astro", _page4],
    ["src/pages/oppskrift/[id].astro", _page5],
    ["src/pages/oppskrift/[kategori].astro", _page6],
    ["src/pages/index.astro", _page7]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "d6aaab80-6a0e-4ded-a25d-1d5d282e19a2"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
