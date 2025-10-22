<template>
  <div class="event-wrapper">
    <h2>My Events</h2>
    <PinnedEvents />
    <EventList />
  </div>
</template>

<script setup lang="ts">
import { useEventStore } from '@/stores/events'
import { onMounted } from 'vue'
import EventList from './EventList.vue'
import PinnedEvents from '@/components/PinnedEvents/PinnedEvents.vue'

const eventStore = useEventStore()

onMounted(() => {
  eventStore.fetchEvents()
})
</script>

<style scoped>
.event-wrapper {
  max-width: 60rem;
  margin: 3.5rem auto auto;
}
@media screen and (max-width: 991px) {
  .event-wrapper {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
</style>
