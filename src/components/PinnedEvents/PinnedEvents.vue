<template>
  <div v-if="pinnedStore.pinnedEvents.length > 0" class="pinned-container">
    <h3>Pinned Events</h3>
    <div class="pinned-grid">
      <PinnedEventCard v-for="event in pinnedStore.pinnedEvents" :key="event.name" :event="event" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePinnedEventsStore } from '@/stores/pinnedEvents'
import PinnedEventCard from '@/components/PinnedEvents/PinnedEventCard.vue'

const pinnedStore = usePinnedEventsStore()
</script>

<style scoped>
.pinned-container {
  max-width: 60rem;
}

.pinned-container h3 {
  margin-bottom: 0;
}

.pinned-grid {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.pinned-grid::-webkit-scrollbar {
  height: 0.75rem;
}

.pinned-grid::-webkit-scrollbar-track {
  background: var(--color-scrollbar-track);
  border-radius: 0.375rem;
}

.pinned-grid::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar);
  border-radius: 0.375rem;
}

.pinned-grid::-webkit-scrollbar-thumb:hover {
  background: var(--color-scrollbar-hover);
}

.pinned-grid {
  scrollbar-width: auto;
}
</style>
