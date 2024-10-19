import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import 'es-module-lexer';
import { g as decodeKey } from './chunks/astro/server_kIar0qXw.mjs';
import 'clsx';
import 'html-escaper';

const NOOP_MIDDLEWARE_FN = (_, next) => next();

const codeToStatusMap = {
  // Implemented from tRPC error code table
  // https://trpc.io/docs/server/error-handling#error-codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 405,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/ceciliehansenroras/code/ceciliehrr/foodstalker/","adapterName":"@astrojs/netlify","routes":[{"file":"404.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"dev/components/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/dev/components","isIndex":false,"type":"page","pattern":"^\\/dev\\/components\\/?$","segments":[[{"content":"dev","dynamic":false,"spread":false}],[{"content":"components","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/dev/components.astro","pathname":"/dev/components","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"kart/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/kart","isIndex":false,"type":"page","pattern":"^\\/kart\\/?$","segments":[[{"content":"kart","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/kart.astro","pathname":"/kart","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"om-oss/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/om-oss","isIndex":false,"type":"page","pattern":"^\\/om-oss\\/?$","segments":[[{"content":"om-oss","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/om-oss.astro","pathname":"/om-oss","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/src/pages/404.astro",{"propagation":"none","containsHead":true}],["/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/src/pages/kart.astro",{"propagation":"none","containsHead":true}],["/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/src/pages/om-oss.astro",{"propagation":"none","containsHead":true}],["/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/src/pages/oppskrift/[id].astro",{"propagation":"none","containsHead":true}],["/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/src/pages/oppskrift/[kategori].astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/404@_@astro":"pages/404.astro.mjs","\u0000@astro-page:src/pages/dev/components@_@astro":"pages/dev/components.astro.mjs","\u0000@astro-page:src/pages/kart@_@astro":"pages/kart.astro.mjs","\u0000@astro-page:src/pages/om-oss@_@astro":"pages/om-oss.astro.mjs","\u0000@astro-page:src/pages/oppskrift/[id]@_@astro":"pages/oppskrift/_id_.astro.mjs","\u0000@astro-page:src/pages/oppskrift/[kategori]@_@astro":"pages/oppskrift/_kategori_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_YFm_OqUf.mjs","/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/src/components/FoodMap.vue":"_astro/FoodMap.DYpF4fTf.js","/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/src/components/SearchBar.vue":"_astro/SearchBar.B3HFTAEX.js","/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/src/components/Ingredients.vue":"_astro/Ingredients.BQYJO-Us.js","/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/src/components/Navbar.vue":"_astro/Navbar.DAix8D0k.js","/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/src/components/Footer.vue":"_astro/Footer.BJnZ9B_J.js","src/components/CookingMode.vue":"_astro/CookingMode.DbnYHk03.js","@astrojs/vue/client.js":"_astro/client.Db1AWTio.js","/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/node_modules/leaflet/dist/images/marker-icon-2x.png":"_astro/marker-icon-2x.CnfaMW6I.js","/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/node_modules/leaflet/dist/images/marker-icon.png":"_astro/marker-icon.MpuoAVVj.js","/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/node_modules/leaflet/dist/images/marker-shadow.png":"_astro/marker-shadow.DsMWTr_u.js","/Users/ceciliehansenroras/code/ceciliehrr/foodstalker/node_modules/leaflet/dist/leaflet-src.esm.js":"_astro/leaflet-src.esm.HdBnhJze.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/tur.De02k1Sn.svg","/_astro/taco.DQBh9MmS.svg","/_astro/broccoli.Lm1lVd2f.svg","/_astro/donut.BuvSzvVg.svg","/_astro/tropical-drink.CNIy3HDa.svg","/_astro/tilbehor.DXYPfXtD.svg","/_astro/sitron2.Bqse1mj9.jpg","/_astro/_id_.BPB7249V.css","/_astro/index.wFVD_ZcR.css","/_astro/index.Cc4HXO9h.css","/_astro/index.8upUIiry.css","/_astro/kart.DIGyOTyf.css","/favicon.ico","/lime-35x35.png","/logo-pink35x35.png","/_astro/CookingMode.DFK2mwJc.css","/_astro/CookingMode.DbnYHk03.js","/_astro/FoodMap.DYpF4fTf.js","/_astro/Footer.BJnZ9B_J.js","/_astro/Ingredients.BQYJO-Us.js","/_astro/Navbar.DAix8D0k.js","/_astro/SearchBar.B3HFTAEX.js","/_astro/SmallCards.B7HIMSrc.js","/_astro/_id_.BvPOdCYG.css","/_astro/_plugin-vue_export-helper.DlAUqK2U.js","/_astro/client.Db1AWTio.js","/_astro/index.CL7m7kP3.css","/_astro/leaflet-src.DTmlu4rB.js","/_astro/leaflet-src.esm.HdBnhJze.js","/_astro/marker-icon-2x.CnfaMW6I.js","/_astro/marker-icon-2x._ZA0WGCc.png","/_astro/marker-icon.MpuoAVVj.js","/_astro/marker-icon.hN30_KVU.png","/_astro/marker-shadow.DsMWTr_u.js","/_astro/marker-shadow.f7SaPCxT.png","/_astro/runtime-core.esm-bundler.grJHBPkP.js","/_astro/runtime-dom.esm-bundler.B-A4iHLu.js","/404.html","/dev/components/index.html","/kart/index.html","/om-oss/index.html","/index.html"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"+KPUfCz+W19TgI1lkk0YfgQSdanfKodVGBxE3hIBEto=","experimentalEnvGetSecretEnabled":false});

export { manifest };
