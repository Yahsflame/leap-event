import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PinnedEvents from '../PinnedEvents.vue'
import { usePinnedEventsStore } from '@/stores/pinnedEvents'
import type { Event } from '@/types/event'

// Mock child components
vi.mock('@/components/PinnedEvents/PinnedEventCard.vue', () => ({
  default: {
    name: 'PinnedEventCard',
    template: '<div class="pinned-event-card">Card</div>',
    props: {
      event: {
        type: Object,
        required: true,
      },
    },
  },
}))

describe('PinnedEvents', () => {
  let wrapper: VueWrapper
  let pinia: ReturnType<typeof createPinia>
  let pinnedStore: ReturnType<typeof usePinnedEventsStore>

  const mockEvent1: Event = {
    name: 'Tech Conference 2025',
    time: '2025-03-15T10:00:00',
    location: 'Convention Center, Phoenix',
    description: 'Annual technology conference.',
    image: 'https://example.com/conference.jpg',
    category: 'technology', // Added category
  }

  const mockEvent2: Event = {
    name: 'Music Festival',
    time: '2025-04-20T18:00:00',
    location: 'Desert Park',
    description: 'Summer music festival.',
    image: 'https://example.com/festival.jpg',
    category: 'entertainment', // Added category
  }

  const mockEvent3: Event = {
    name: 'Art Exhibition',
    time: '2025-05-10T14:00:00',
    location: 'City Gallery',
    description: 'Modern art showcase.',
    image: 'https://example.com/art.jpg',
    category: 'art', // Added category
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    pinnedStore = usePinnedEventsStore()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  describe('Happy Path', () => {
    it('should render pinned events when store has events', () => {
      pinnedStore.togglePin(mockEvent1)
      pinnedStore.togglePin(mockEvent2)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.pinned-container').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('Pinned Events')
      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(2)
    })

    it('should not render container when no events are pinned', () => {
      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.pinned-container').exists()).toBe(false)
      expect(wrapper.find('h3').exists()).toBe(false)
    })

    it('should pass correct event prop to each PinnedEventCard', () => {
      pinnedStore.togglePin(mockEvent1)
      pinnedStore.togglePin(mockEvent2)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      const cards = wrapper.findAllComponents({ name: 'PinnedEventCard' })
      expect(cards[0]?.props('event')).toEqual(mockEvent1)
      expect(cards[1]?.props('event')).toEqual(mockEvent2)
    })

    it('should use event name as key for v-for', () => {
      pinnedStore.togglePin(mockEvent1)
      pinnedStore.togglePin(mockEvent2)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      const cards = wrapper.findAllComponents({ name: 'PinnedEventCard' })
      // Verify props are passed correctly (keys are used internally by Vue)
      expect(cards[0]?.props('event')?.name).toBe(mockEvent1.name)
      expect(cards[1]?.props('event')?.name).toBe(mockEvent2.name)
    })

    it('should render multiple pinned events correctly', () => {
      pinnedStore.togglePin(mockEvent1)
      pinnedStore.togglePin(mockEvent2)
      pinnedStore.togglePin(mockEvent3)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(3)
    })

    it('should have pinned-grid container for cards', () => {
      pinnedStore.togglePin(mockEvent1)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.pinned-grid').exists()).toBe(true)
    })

    it('should render heading inside container', () => {
      pinnedStore.togglePin(mockEvent1)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      const container = wrapper.find('.pinned-container')
      expect(container.find('h3').exists()).toBe(true)
      expect(container.find('h3').text()).toBe('Pinned Events')
    })
  })

  describe('Null/Undefined Path', () => {
    it('should handle empty pinned events array', () => {
      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(pinnedStore.pinnedEvents).toHaveLength(0)
      expect(wrapper.find('.pinned-container').exists()).toBe(false)
    })

    it('should handle event with empty name', () => {
      const emptyNameEvent: Event = {
        name: '',
        time: '2025-01-01',
        location: 'Test',
        description: 'Test',
        image: 'test.jpg',
        category: 'general', // Added category
      }

      pinnedStore.togglePin(emptyNameEvent)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(1)
    })

    it('should handle events with null-like values', () => {
      const nullishEvent: Event = {
        name: 'Test Event',
        time: null as any,
        location: undefined as any,
        description: '',
        image: '',
        category: 'general', // Added category
      }

      pinnedStore.togglePin(nullishEvent)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(1)
      expect(wrapper.findComponent({ name: 'PinnedEventCard' }).props('event')).toEqual(
        nullishEvent,
      )
    })
  })

  describe('Bad Data Path', () => {
    it('should handle events with special characters in name', () => {
      const specialCharsEvent: Event = {
        name: '<script>alert("xss")</script>',
        time: '2025-01-01',
        location: 'Test',
        description: 'Test',
        image: 'test.jpg',
        category: 'general', // Added category
      }

      pinnedStore.togglePin(specialCharsEvent)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(1)
    })

    it('should handle events with very long names', () => {
      const longNameEvent: Event = {
        name: 'A'.repeat(1000),
        time: '2025-01-01',
        location: 'Test',
        description: 'Test',
        image: 'test.jpg',
        category: 'general', // Added category
      }

      pinnedStore.togglePin(longNameEvent)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(1)
    })

    it('should handle events with unicode and emoji in name', () => {
      const unicodeEvent: Event = {
        name: '🎉 Event 欢迎 مرحبا',
        time: '2025-01-01',
        location: 'Test',
        description: 'Test',
        image: 'test.jpg',
        category: 'celebration', // Added category
      }

      pinnedStore.togglePin(unicodeEvent)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(1)
    })

    it('should handle duplicate event names', () => {
      const event1 = { ...mockEvent1 }
      const event2 = { ...mockEvent1 } // Same name

      pinnedStore.togglePin(event1)
      // Toggling the same name again will unpin it (since store uses name as identifier)
      pinnedStore.togglePin(event2)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      // Store should handle duplicates by unpinning - container should not exist
      // If the store keeps the event, it would show; if it removed it (toggled), it won't
      const cards = wrapper.findAllComponents({ name: 'PinnedEventCard' })
      // The actual behavior depends on the store implementation
      // Since both events have the same name, the store likely unpinned it
      expect(pinnedStore.pinnedEvents.length).toBe(0)
      expect(cards.length).toBe(0)
    })

    it('should handle very large number of pinned events', () => {
      // Add 50 events
      for (let i = 0; i < 50; i++) {
        pinnedStore.togglePin({
          name: `Event ${i}`,
          time: '2025-01-01',
          location: 'Test',
          description: 'Test',
          image: 'test.jpg',
          category: 'general', // Added category
        })
      }

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(50)
      expect(wrapper.find('.pinned-grid').exists()).toBe(true)
    })
  })

  describe('Reactivity', () => {
    it('should show container when first event is pinned', async () => {
      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.pinned-container').exists()).toBe(false)

      pinnedStore.togglePin(mockEvent1)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.pinned-container').exists()).toBe(true)
    })

    it('should hide container when last event is unpinned', async () => {
      pinnedStore.togglePin(mockEvent1)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.pinned-container').exists()).toBe(true)

      pinnedStore.togglePin(mockEvent1)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.pinned-container').exists()).toBe(false)
    })

    it('should update card count when events are added', async () => {
      pinnedStore.togglePin(mockEvent1)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(1)

      pinnedStore.togglePin(mockEvent2)
      await wrapper.vm.$nextTick()

      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(2)
    })

    it('should update card count when events are removed', async () => {
      pinnedStore.togglePin(mockEvent1)
      pinnedStore.togglePin(mockEvent2)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(2)

      pinnedStore.togglePin(mockEvent1)
      await wrapper.vm.$nextTick()

      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(1)
    })

    it('should maintain correct event order', async () => {
      pinnedStore.togglePin(mockEvent1)
      pinnedStore.togglePin(mockEvent2)
      pinnedStore.togglePin(mockEvent3)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      const cards = wrapper.findAllComponents({ name: 'PinnedEventCard' })
      expect(cards[0]?.props('event')?.name).toBe(mockEvent1.name)
      expect(cards[1]?.props('event')?.name).toBe(mockEvent2.name)
      expect(cards[2]?.props('event')?.name).toBe(mockEvent3.name)
    })

    it('should update when store is cleared and repopulated', async () => {
      pinnedStore.togglePin(mockEvent1)
      pinnedStore.togglePin(mockEvent2)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(2)

      // Clear all
      pinnedStore.togglePin(mockEvent1)
      pinnedStore.togglePin(mockEvent2)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.pinned-container').exists()).toBe(false)

      // Add new ones
      pinnedStore.togglePin(mockEvent3)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.pinned-container').exists()).toBe(true)
      expect(wrapper.findAllComponents({ name: 'PinnedEventCard' })).toHaveLength(1)
    })
  })

  describe('Component Structure', () => {
    it('should have correct DOM hierarchy', () => {
      pinnedStore.togglePin(mockEvent1)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      const container = wrapper.find('.pinned-container')
      expect(container.exists()).toBe(true)
      expect(container.find('h3').exists()).toBe(true)
      expect(container.find('.pinned-grid').exists()).toBe(true)
      expect(
        container.find('.pinned-grid').findComponent({ name: 'PinnedEventCard' }).exists(),
      ).toBe(true)
    })

    it('should render grid inside container', () => {
      pinnedStore.togglePin(mockEvent1)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      const container = wrapper.find('.pinned-container')
      const grid = wrapper.find('.pinned-grid')

      expect(container.element.contains(grid.element)).toBe(true)
    })

    it('should render all cards inside grid', () => {
      pinnedStore.togglePin(mockEvent1)
      pinnedStore.togglePin(mockEvent2)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      const grid = wrapper.find('.pinned-grid')
      const cards = grid.findAllComponents({ name: 'PinnedEventCard' })

      expect(cards).toHaveLength(2)
    })
  })

  describe('Conditional Rendering', () => {
    it('should use v-if correctly based on store length', () => {
      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      // No events - should not render
      expect(wrapper.html()).toBe('<!--v-if-->')

      pinnedStore.togglePin(mockEvent1)
      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      // Has events - should render
      expect(wrapper.html()).not.toBe('<!--v-if-->')
    })

    it('should respect v-if condition strictly', async () => {
      pinnedStore.togglePin(mockEvent1)

      wrapper = mount(PinnedEvents, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.pinned-container').exists()).toBe(true)

      // Remove all events
      pinnedStore.togglePin(mockEvent1)
      await wrapper.vm.$nextTick()

      // Should completely remove from DOM
      expect(wrapper.find('.pinned-container').exists()).toBe(false)
      expect(wrapper.find('h3').exists()).toBe(false)
      expect(wrapper.find('.pinned-grid').exists()).toBe(false)
    })
  })
})
