<template>
  <div class="event-card" @click="openModal">
    <img :src="event.image" :alt="event.name" class="event-image" />
    <div class="event-details">
      <h4>{{ event.name }}</h4>
      <p class="event-time">{{ formatDate(event.time) }}</p>
      <p class="event-location">{{ event.location }}</p>
    </div>
    <EventCalendarIcon :date="event.time" />
  </div>

  <EventModal :event="event" :is-open="isModalOpen" @close="closeModal" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Event } from '@/types/event'
import { formatDate } from '@/utilities/useTime'
import EventCalendarIcon from '../EventCalendarIcon/EventCalendarIcon.vue'
import EventModal from '../EventModal/EventModal.vue'

defineProps<{ event: Event }>()

const isModalOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}
</script>

<style scoped>
.event-card {
  display: flex;
  width: 100%;
  overflow: hidden;
  pointer-events: all;
  cursor: pointer;
}
.event-image {
  object-fit: cover;
  width: 100%;
  max-width: 17.063rem;
  aspect-ratio: 359 / 207.77;
  border-radius: 1rem;
  margin-right: 3rem;
}
.event-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  gap: 0.5rem;
}
.event-time {
  margin: 0;
}
.event-location {
  margin: 0;
}

@media screen and (min-width: 768px) and (max-width: 991px) {
  .event-card {
    flex-direction: column;
  }
  .event-image {
    margin: 0;
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 767px) {
  .event-card {
    flex-direction: column;
  }
  .event-image {
    margin: 0;
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 991px) {
  .event-card {
    position: relative;
  }
}
</style>
