const staticData = "site-cache-v2";
const assets = [
  //   "/",
  "/index.html",
  "/assets/css/main.css",
  "/assets/css/styles.css",
  "/assets/css/tools.css",
  "/assets/js/main.js",
  "/assets/js/tools.js",
  "/assets/pdf/kongvungsovanreach_cv.pdf",
  "/assets/img/profile/blob.svg",
  "/assets/img/profile/kongvungsovanreach_01.jpeg",
  "/assets/img/profile/kongvungsovanreach_02.jpeg",
  "/assets/img/thumbnail.jpg",
  "/assets/img/tools/color-picker-icon.png",
  "/assets/img/tools/qr-scanner-icon.png",
  "/assets/img/tools/stopwatch-icon.png",
  "/assets/img/tools/wheel-spinning-icon.png",
  "/en/tools.html",
  "/tools/colorpicker/index.html",
  "/tools/colorpicker/css/colorpicker.css",
  "/tools/colorpicker/js/colorpicker-main.js",
  "/tools/colorpicker/js/colorpicker-ui.js",
  "/tools/colorpicker/js/colorpicker-picker.js",
  "/tools/colorpicker/js/colorpicker-palettes.js",
  "/tools/colorpicker/js/colorpicker-image.js",
  "/tools/colorpicker/js/colorpicker-accessibility.js",
  "/tools/colorpicker/js/colorpicker-collections.js",
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