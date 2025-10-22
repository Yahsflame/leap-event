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
  background: #f1f1f1;
  border-radius: 0.375rem;
}

.pinned-grid::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 0.375rem;
}

.pinned-grid::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.pinned-grid {
  scrollbar-width: auto;
}
</style>
