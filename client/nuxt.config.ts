export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: false },
  app: {
    head: {
      title: "实时竞拍房间",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
  css: [],
  vite: {
    optimizeDeps: {
      exclude: ["chart.js"],
    },
  },
});
