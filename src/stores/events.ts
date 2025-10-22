import { defineStore } from 'pinia'
import eventsData from '@/data/events.json'
import type { Event } from '@/types/event'

export const useEventStore = defineStore('events', {
  state: () => ({
    events: [] as Event[],
  }),
  actions: {
    fetchEvents() {
      this.events = eventsData
    },
  },
})
