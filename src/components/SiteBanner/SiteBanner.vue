<template>
  <div class="site-banner" :style="{ backgroundColor: backgroundColor, color: fontColor }">
    <div class="banner-container">
      <h1>{{ text }}</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string
  backgroundColor: string
  fontColor: string
}>()
</script>

<style scoped>
.site-banner {
  padding: 1.25rem 0;
}

.banner-container {
  max-width: 960px;
  margin: 0 auto;
}

h1 {
  margin: 0;
  text-align: left;
}

@media screen and (max-width: 991px) {
  .site-banner {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
</style>
