<template>
  <div class="pinned-event-card">
    <div class="image-container" @click="openModal">
      <img :src="event.image" :alt="event.name" class="pinned-event-image" />
      <button
        class="pin-icon-button"
        @click.stop="togglePin"
        :aria-label="isPinned ? 'Unpin event' : 'Pin event'"
      >
        <PinIcon :pinned="isPinned" size="1.25rem" />
      </button>
    </div>
    <div class="pinned-event-details" @click="openModal">
      <h4>{{ event.name }}</h4>
      <p class="pinned-event-time">{{ formatDate(event.time) }}</p>
    </div>
  </div>

  <EventModal :event="event" :is-open="isModalOpen" @close="closeModal" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePinnedEventsStore } from '@/stores/pinnedEvents'
import type { Event } from '@/types/event'
import { formatDate } from '@/utilities/useTime'
import EventModal from '../EventModal/EventModal.vue'
import PinIcon from '@/assets/Icons/PinIcon.vue'

const props = defineProps<{ event: Event }>()

const pinnedStore = usePinnedEventsStore()
const isModalOpen = ref(false)

const isPinned = computed(() => {
  return pinnedStore.isPinned(props.event.name)
})

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const togglePin = () => {
  pinnedStore.togglePin(props.event)
}
</script>

<style scoped>
.pinned-event-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 11.25rem;
}

.image-container {
  position: relative;
  cursor: pointer;
}

.pinned-event-image {
  object-fit: cover;
  width: 11.25rem;
  height: 6.5rem;
  border-radius: 1rem;
  margin-right: 3rem;
  display: block;
}

.pin-icon-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  z-index: 10;
}

.pin-icon-button:hover {
  background: white;
  transform: scale(1.1);
}

.pin-icon {
  width: 2rem;
  height: 2rem;
  filter: none;
  transition: filter 0.2s;
}

.pinned-event-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  gap: 0.5rem;
  cursor: pointer;
}

.pinned-event-details h4,
p {
  font-size: 0.875rem;
}

.pinned-event-time {
  margin: 0;
}

.pinned-event-location {
  margin: 0;
}
</style>
