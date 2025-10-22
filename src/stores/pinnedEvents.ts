import { defineStore } from 'pinia'
import type { Event } from '@/types/event'

export const usePinnedEventsStore = defineStore('pinnedEvents', {
  state: () => ({
    pinnedEvents: [] as Event[],
  }),

  actions: {
    addPinnedEvent(event: Event) {
      const alreadyPinned = this.pinnedEvents.some((e) => e.name === event.name)
      if (!alreadyPinned) {
        this.pinnedEvents.push(event)
      }
    },

    removePinnedEvent(eventName: string) {
      this.pinnedEvents = this.pinnedEvents.filter((e) => e.name !== eventName)
    },

    togglePin(event: Event) {
      const index = this.pinnedEvents.findIndex((e) => e.name === event.name)
      if (index > -1) {
        this.removePinnedEvent(event.name)
      } else {
        this.addPinnedEvent(event)
      }
    },

    isPinned(eventName: string): boolean {
      return this.pinnedEvents.some((e) => e.name === eventName)
    },
  },
})
