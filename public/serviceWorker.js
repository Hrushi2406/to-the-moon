importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');

// workbox.setConfig({ debug: false });

// // Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
// workbox.routing.registerRoute(
//   ({ url }) => url.origin === 'https://fonts.googleapis.com',
//   new workbox.strategies.CacheFirst({
//     cacheName: 'google-fonts-stylesheets'
//   })
// );

// // Cache the underlying font files with a cache-first strategy.
// workbox.routing.registerRoute(
//   ({ url }) => url.origin === 'https://fonts.gstatic.com',
//   new workbox.strategies.CacheFirst({
//     cacheName: 'google-fonts-webfonts'
//   })
// );

// // Cache images
// workbox.routing.registerRoute(
//   ({ request }) => request.destination === 'image',
//   new workbox.strategies.CacheFirst({
//     cacheName: 'images'
//   })
// );

// workbox.routing.registerRoute(new RegExp('/.*'), new workbox.strategies.CacheFirst());

workbox.routing.registerRoute(
    new RegExp('/.*'),
    new workbox.strategies.CacheFirst({
        cacheName: 'all-cache',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxAgeSeconds: 1 * 24 * 60 * 60
            })
        ]
    })
);
