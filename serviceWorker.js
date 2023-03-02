const staticData = "site-cache-v1";
const assets = [
  //   "/",
  "/index.html",
  "/assets/css/main.css",
  "/assets/css/styles.css",
  "/assets/js/main.js",
  "/assets/pdf/kongvungsovanreach_cv.pdf",
  "/assets/img/profile/blob.svg",
  "/assets/img/profile/kongvungsovanreach_01.jpeg",
  "/assets/img/profile/kongvungsovanreach_02.png",
  "/assets/img/thumbnail.jpg",
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