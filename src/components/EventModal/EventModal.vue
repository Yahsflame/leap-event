<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-overlay"
        @click="handleOverlayClick"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div class="modal-container" @click.stop>
          <button class="modal-close" @click="closeModal" aria-label="Close modal">
            <CloseIcon size="1.5rem" />
          </button>

          <div class="modal-content">
            <div class="image-container">
              <img :src="event.image" :alt="event.name" class="modal-image" />
              <button
                class="pin-icon-button"
                @click="togglePin"
                :aria-label="isPinned ? 'Unpin event' : 'Pin event'"
              >
                <PinIcon :pinned="isPinned" size="1.25rem" />
                <span class="pin-text">{{ isPinned ? 'Unpin' : 'Pin' }}</span>
              </button>
            </div>

            <div class="modal-details">
              <EventCalendarIcon :date="event.time" />
              <div class="modal-text">
                <h2 id="modal-title">{{ event.name }}</h2>
                <p class="modal-time">{{ formatDate(event.time) }}</p>
                <p class="modal-location">{{ event.location }}</p>
              </div>
              <p class="modal-description">{{ event.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { usePinnedEventsStore } from '@/stores/pinnedEvents'
import { formatDate } from '@/utilities/useTime'
import type { Event } from '@/types/event'
import CloseIcon from '@/assets/Icons/CloseIcon.vue'
import PinIcon from '@/assets/Icons/PinIcon.vue'
import EventCalendarIcon from '../EventCalendarIcon/EventCalendarIcon.vue'

const props = defineProps<{
  event: Event
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const pinnedStore = usePinnedEventsStore()

const isPinned = computed(() => {
  return pinnedStore.isPinned(props.event.name)
})

const closeModal = () => {
  emit('close')
}

const handleOverlayClick = () => {
  closeModal()
}

const togglePin = () => {
  pinnedStore.togglePin(props.event)
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--color-white);
  border-radius: 1rem;
  max-width: 35.5rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow:
    0 20px 25px -5px var(--color-shadow-primary),
    0 10px 10px -5px var(--color-shadow-secondary);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--color-white);
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  box-shadow: 0 2px 8px var(--color-shadow-button);
}

.modal-close:hover {
  background: var(--color-hover);
  transform: scale(1.1);
}

.modal-close svg {
  width: 1.5rem;
  height: 1.5rem;
}

.pin-icon-button {
  position: absolute;
  top: 1rem;
  right: 4.5rem;
  background: var(--color-white);
  border: none;
  border-radius: 48px;
  height: 2.5rem;
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  box-shadow: 0 2px 8px var(--color-shadow-button);
}

.pin-icon-button:hover {
  background: var(--color-hover);
  transform: scale(1.1);
}

.pin-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: filter 0.2s;
}

.pin-text {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

.modal-content {
  display: flex;
  flex-direction: column;
}

.image-container {
  position: relative;
}

.modal-image {
  width: 100%;
  height: 20rem;
  object-fit: cover;
  border-radius: 1rem 1rem 0 0;
  display: block;
}

.modal-details {
  padding: 2rem;
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

:deep(.event-calendar) {
  margin-top: 0;
}

.modal-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-time,
.modal-location {
  font-size: 1.125rem;
}

.modal-details {
  padding: 2rem;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  gap: 1rem;
}

.modal-details h2 {
  font-weight: 700;
  font-size: 1.75rem;
  margin: 0;
}

.modal-description {
  font-size: 0.875rem;
  grid-column: 1 / -1;
  margin: 0;
}

.model- .modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .modal-container {
    max-height: 95vh;
  }

  .modal-image {
    height: 15rem;
  }

  .modal-details {
    padding: 1.5rem;
  }
}
</style>
