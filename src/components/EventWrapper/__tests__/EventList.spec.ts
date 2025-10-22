import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EventList from '../EventList.vue'
import { useEventStore } from '@/stores/events'
import type { Event } from '@/types/event'

// Mock the utilities to prevent errors with invalid dates
vi.mock('@/utilities/useTime', () => ({
  formatDate: vi.fn().mockReturnValue('Mocked Date'),
  formatCalendarDate: vi.fn().mockReturnValue({ month: 'JAN', day: '01' }),
}))

// Mock child components
vi.mock('./EventCard.vue', () => ({
  default: {
    name: 'EventCard',
    template: '<div class="event-card">Event Card</div>',
    props: {
      event: {
        type: Object,
        required: true,
      },
    },
  },
}))

describe('EventList', () => {
  let wrapper: VueWrapper
  let pinia: ReturnType<typeof createPinia>
  let eventStore: ReturnType<typeof useEventStore>

  const mockEvent1: Event = {
    name: 'Early Event',
    time: '2025-01-15T10:00:00',
    location: 'Location A',
    description: 'First event',
    image: 'https://example.com/event1.jpg',
    category: 'workshop', // Added category
  }

  const mockEvent2: Event = {
    name: 'Middle Event',
    time: '2025-03-20T14:00:00',
    location: 'Location B',
    description: 'Second event',
    image: 'https://example.com/event2.jpg',
    category: 'conference', // Added category
  }

  const mockEvent3: Event = {
    name: 'Late Event',
    time: '2025-06-30T18:00:00',
    location: 'Location C',
    description: 'Third event',
    image: 'https://example.com/event3.jpg',
    category: 'meetup', // Added category
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    eventStore = useEventStore()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  describe('Happy Path', () => {
    it('should render event list with heading', () => {
      eventStore.events = [mockEvent1]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.event-list').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('Events')
    })

    it('should render EventCard for each event', () => {
      eventStore.events = [mockEvent1, mockEvent2]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      const cards = wrapper.findAllComponents({ name: 'EventCard' })
      expect(cards).toHaveLength(2)
    })

    it('should pass correct event prop to each EventCard', () => {
      eventStore.events = [mockEvent1, mockEvent2]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      const cards = wrapper.findAllComponents({ name: 'EventCard' })
      expect(cards[0]?.props('event')).toEqual(mockEvent1)
      expect(cards[1]?.props('event')).toEqual(mockEvent2)
    })

    it('should sort events by time in ascending order', () => {
      // Add events in wrong order
      eventStore.events = [mockEvent3, mockEvent1, mockEvent2]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      const cards = wrapper.findAllComponents({ name: 'EventCard' })
      expect(cards[0]?.props('event')?.name).toBe('Early Event')
      expect(cards[1]?.props('event')?.name).toBe('Middle Event')
      expect(cards[2]?.props('event')?.name).toBe('Late Event')
    })

    it('should use event name as key for v-for', () => {
      eventStore.events = [mockEvent1, mockEvent2]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      const cards = wrapper.findAllComponents({ name: 'EventCard' })
      expect(cards[0]?.props('event')?.name).toBe(mockEvent1.name)
      expect(cards[1]?.props('event')?.name).toBe(mockEvent2.name)
    })

    it('should render with no events', () => {
      eventStore.events = []

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.event-list').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('No events are available')
      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(0)
    })

    it('should render multiple events correctly', () => {
      eventStore.events = [mockEvent1, mockEvent2, mockEvent3]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(3)
    })
  })

  describe('Null/Undefined Path', () => {
    it('should handle empty events array', () => {
      eventStore.events = []

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(0)
      expect(wrapper.find('h3').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('No events are available')
    })

    it('should handle event with null time', () => {
      const nullTimeEvent: Event = {
        name: 'Null Time Event',
        time: null as any,
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'general', // Added category
      }

      eventStore.events = [mockEvent1, nullTimeEvent]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      // Should still render both cards
      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(2)
    })

    it('should handle event with undefined time', () => {
      const undefinedTimeEvent: Event = {
        name: 'Undefined Time Event',
        time: undefined as any,
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'general', // Added category
      }

      eventStore.events = [mockEvent1, undefinedTimeEvent]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(2)
    })

    it('should handle event with empty string time', () => {
      const emptyTimeEvent: Event = {
        name: 'Empty Time Event',
        time: '',
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'general', // Added category
      }

      eventStore.events = [mockEvent1, emptyTimeEvent]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(2)
    })

    it('should handle event with empty name', () => {
      const emptyNameEvent: Event = {
        name: '',
        time: '2025-01-01',
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'general', // Added category
      }

      eventStore.events = [emptyNameEvent]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(1)
    })
  })

  describe('Bad Data Path', () => {
    it('should handle malformed date strings', () => {
      const badDateEvent: Event = {
        name: 'Bad Date Event',
        time: 'not-a-valid-date',
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'general', // Added category
      }

      eventStore.events = [mockEvent1, badDateEvent]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      // Should still render both cards
      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(2)
    })

    it('should handle events with same timestamp', () => {
      const sameTime1: Event = {
        name: 'Event A',
        time: '2025-01-01T12:00:00',
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'workshop', // Added category
      }

      const sameTime2: Event = {
        name: 'Event B',
        time: '2025-01-01T12:00:00',
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'workshop', // Added category
      }

      eventStore.events = [sameTime1, sameTime2]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(2)
    })

    it('should handle special characters in event name', () => {
      const specialCharsEvent: Event = {
        name: '<script>alert("xss")</script>',
        time: '2025-01-01',
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'general', // Added category
      }

      eventStore.events = [specialCharsEvent]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(1)
    })

    it('should handle very long event name', () => {
      const longNameEvent: Event = {
        name: 'A'.repeat(1000),
        time: '2025-01-01',
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'general', // Added category
      }

      eventStore.events = [longNameEvent]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(1)
    })

    it('should handle unicode and emoji in event name', () => {
      const unicodeEvent: Event = {
        name: '🎉 Event 欢迎 مرحبا',
        time: '2025-01-01',
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'celebration', // Added category
      }

      eventStore.events = [unicodeEvent]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(1)
    })

    it('should handle very large number of events', () => {
      const manyEvents: Event[] = []
      for (let i = 0; i < 100; i++) {
        manyEvents.push({
          name: `Event ${i}`,
          time: `2025-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
          location: 'Location',
          description: 'Description',
          image: 'image.jpg',
          category: 'general', // Added category
        })
      }

      eventStore.events = manyEvents

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(100)
    })

    it('should handle dates far in the past', () => {
      const pastEvent: Event = {
        name: 'Past Event',
        time: '1900-01-01T00:00:00',
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'historical', // Added category
      }

      eventStore.events = [mockEvent1, pastEvent]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      const cards = wrapper.findAllComponents({ name: 'EventCard' })
      // Past event should be sorted first
      expect(cards[0]?.props('event')?.name).toBe('Past Event')
      expect(cards[1]?.props('event')?.name).toBe('Early Event')
    })

    it('should handle dates far in the future', () => {
      const futureEvent: Event = {
        name: 'Future Event',
        time: '2099-12-31T23:59:59',
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'futuristic', // Added category
      }

      eventStore.events = [mockEvent1, futureEvent]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      const cards = wrapper.findAllComponents({ name: 'EventCard' })
      // Future event should be sorted last
      expect(cards[0]?.props('event')?.name).toBe('Early Event')
      expect(cards[1]?.props('event')?.name).toBe('Future Event')
    })
  })

  describe('Sorting Logic', () => {
    it('should sort events chronologically', () => {
      const events = [
        { ...mockEvent2, name: 'March' },
        { ...mockEvent1, name: 'January' },
        { ...mockEvent3, name: 'June' },
      ]

      eventStore.events = events

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      const cards = wrapper.findAllComponents({ name: 'EventCard' })
      expect(cards[0]?.props('event')?.name).toBe('January')
      expect(cards[1]?.props('event')?.name).toBe('March')
      expect(cards[2]?.props('event')?.name).toBe('June')
    })

    it('should not mutate original store events array', () => {
      const events = [mockEvent3, mockEvent1, mockEvent2]
      eventStore.events = events

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      // Original array should maintain insertion order
      expect(eventStore.events[0]?.name).toBe('Late Event')
      expect(eventStore.events[1]?.name).toBe('Early Event')
      expect(eventStore.events[2]?.name).toBe('Middle Event')
    })

    it('should handle mixed valid and invalid dates', () => {
      const validEvent: Event = {
        name: 'Valid Event',
        time: '2025-01-01T00:00:00',
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'general', // Added category
      }

      const invalidEvent: Event = {
        name: 'Invalid Event',
        time: 'invalid-date',
        location: 'Location',
        description: 'Description',
        image: 'image.jpg',
        category: 'general', // Added category
      }

      eventStore.events = [invalidEvent, validEvent]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      // Should render both despite invalid date
      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(2)
    })
  })

  describe('Reactivity', () => {
    it('should update when events are added to store', async () => {
      eventStore.events = [mockEvent1]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(1)

      eventStore.events = [mockEvent1, mockEvent2]
      await wrapper.vm.$nextTick()

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(2)
    })

    it('should update when events are removed from store', async () => {
      eventStore.events = [mockEvent1, mockEvent2]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(2)

      eventStore.events = [mockEvent1]
      await wrapper.vm.$nextTick()

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(1)
    })

    it('should re-sort when event times change', async () => {
      eventStore.events = [mockEvent1, mockEvent2]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      const cards = wrapper.findAllComponents({ name: 'EventCard' })
      expect(cards[0]?.props('event')?.name).toBe('Early Event')

      // Change the order
      eventStore.events = [mockEvent2, mockEvent1]
      await wrapper.vm.$nextTick()

      const updatedCards = wrapper.findAllComponents({ name: 'EventCard' })
      // Should still be sorted by time, not by array order
      expect(updatedCards[0]?.props('event')?.name).toBe('Early Event')
    })

    it('should update when store is cleared', async () => {
      eventStore.events = [mockEvent1, mockEvent2]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(2)

      eventStore.events = []
      await wrapper.vm.$nextTick()

      expect(wrapper.findAllComponents({ name: 'EventCard' })).toHaveLength(0)
    })
  })

  describe('Component Structure', () => {
    it('should have correct DOM structure', () => {
      eventStore.events = [mockEvent1]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.event-list').exists()).toBe(true)
      expect(wrapper.find('.event-list h3').exists()).toBe(true)
      expect(wrapper.find('.event-list').findComponent({ name: 'EventCard' }).exists()).toBe(true)
    })

    it('should render heading inside event-list container', () => {
      eventStore.events = [mockEvent1]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      const container = wrapper.find('.event-list')
      const heading = container.find('h3')

      expect(heading.exists()).toBe(true)
      expect(container.element.contains(heading.element)).toBe(true)
    })

    it('should render all cards inside event-list container', () => {
      eventStore.events = [mockEvent1, mockEvent2]

      wrapper = mount(EventList, {
        global: {
          plugins: [pinia],
        },
      })

      const container = wrapper.find('.event-list')
      const cards = container.findAllComponents({ name: 'EventCard' })

      expect(cards).toHaveLength(2)
    })
  })
})
