const staticData = "site-cache-v3";
const assets = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/main.js",
  "/assets/pdf/kongvungsovanreach_cv.pdf",
  "/assets/img/profile/profile.png",
];

self.addEventListener("install", (installEvent) => {
  installEvent.waitUntil(
    caches.open(staticData).then((cache) => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", (fetchEvent) => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((res) => {
      return res || fetch(fetchEvent.request);
    })
  );
});