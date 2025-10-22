<template>
  <div class="event-list">
    <h3>Events</h3>
    <EventCard v-for="event in sortedEvents" :key="event.name" :event="event" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEventStore } from '@/stores/events'
import EventCard from './EventCard.vue'

const eventStore = useEventStore()

const sortedEvents = computed(() => {
  return [...eventStore.events].sort((a, b) => {
    return new Date(a.time).getTime() - new Date(b.time).getTime()
  })
})
</script>

<style scoped>
.event-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.event-list h3 {
  grid-column: 1 / -1;
}

@media (min-width: 768px) and (max-width: 991px) {
  .event-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
