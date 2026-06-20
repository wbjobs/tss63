<template>
  <div class="page">
    <ClientOnly>
      <AuctionRoom />
      <template #fallback>
        <div class="loading">连接竞拍服务器中...</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
useHead({
  htmlAttrs: { lang: "zh-CN" },
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  color: #e2e8f0;
  -webkit-font-smoothing: antialiased;
}

.page {
  min-height: 100vh;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 18px;
  color: #94a3b8;
}
</style>
