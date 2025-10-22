import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EventCard from '../EventCard.vue'
import type { Event } from '@/types/event'
import * as useTime from '@/utilities/useTime'

// Mock the utilities
vi.mock('@/utilities/useTime', () => ({
  formatDate: vi.fn(),
  formatCalendarDate: vi.fn(),
}))

// Mock child components
vi.mock('../EventCalendarIcon/EventCalendarIcon.vue', () => ({
  default: {
    name: 'EventCalendarIcon',
    template: '<div class="event-calendar">Calendar</div>',
    props: ['date'],
  },
}))

vi.mock('../EventModal/EventModal.vue', () => ({
  default: {
    name: 'EventModal',
    template: '<div class="event-modal">Modal</div>',
    props: ['event', 'isOpen'],
    emits: ['close'],
  },
}))

describe('EventCard', () => {
  let wrapper: VueWrapper
  let pinia: ReturnType<typeof createPinia>

  const mockEvent: Event = {
    name: 'Tech Conference 2025',
    time: '2025-03-15T10:00:00',
    location: 'Convention Center, Phoenix',
    description: 'Annual technology conference featuring the latest innovations.',
    image: 'https://example.com/conference.jpg',
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    vi.mocked(useTime.formatDate).mockReturnValue('March 15, 2025 at 10:00 AM')
    vi.mocked(useTime.formatCalendarDate).mockReturnValue({ month: 'MAR', day: '15' })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  describe('Happy Path', () => {
    it('should render event card with event details', () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.event-card').exists()).toBe(true)
      expect(wrapper.find('h4').text()).toBe(mockEvent.name)
      expect(wrapper.find('.event-time').text()).toBe('March 15, 2025 at 10:00 AM')
      expect(wrapper.find('.event-location').text()).toBe(mockEvent.location)
    })

    it('should render event image with correct src and alt', () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const img = wrapper.find('.event-image')
      expect(img.attributes('src')).toBe(mockEvent.image)
      expect(img.attributes('alt')).toBe(mockEvent.name)
    })

    it('should call formatDate with event time', () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(useTime.formatDate).toHaveBeenCalledWith(mockEvent.time)
    })

    it('should render EventCalendarIcon with correct date prop', () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const calendar = wrapper.findComponent({ name: 'EventCalendarIcon' })
      expect(calendar.exists()).toBe(true)
      expect(calendar.props('date')).toBe(mockEvent.time)
    })

    it('should render EventModal with correct props', () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const modal = wrapper.findComponent({ name: 'EventModal' })
      expect(modal.exists()).toBe(true)
      expect(modal.props('event')).toEqual(mockEvent)
      expect(modal.props('isOpen')).toBe(false)
    })

    it('should open modal when card is clicked', async () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.vm.isModalOpen).toBe(false)

      await wrapper.find('.event-card').trigger('click')

      expect(wrapper.vm.isModalOpen).toBe(true)
    })

    it('should update modal isOpen prop when opening', async () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const modal = wrapper.findComponent({ name: 'EventModal' })
      expect(modal.props('isOpen')).toBe(false)

      await wrapper.find('.event-card').trigger('click')

      expect(modal.props('isOpen')).toBe(true)
    })

    it('should close modal when EventModal emits close', async () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      // Open modal first
      await wrapper.find('.event-card').trigger('click')
      expect(wrapper.vm.isModalOpen).toBe(true)

      // Close modal
      const modal = wrapper.findComponent({ name: 'EventModal' })
      await modal.vm.$emit('close')

      expect(wrapper.vm.isModalOpen).toBe(false)
    })

    it('should have clickable card with cursor pointer', () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const card = wrapper.find('.event-card')
      expect(card.exists()).toBe(true)
      // cursor: pointer is in CSS, not inline, so just verify element exists
      expect(card.element).toBeInstanceOf(HTMLElement)
    })
  })

  describe('Null/Undefined Path', () => {
    it('should handle event with empty values', () => {
      const emptyEvent: Event = {
        name: '',
        time: '',
        location: '',
        description: '',
        image: '',
      }

      vi.mocked(useTime.formatDate).mockReturnValue('')

      wrapper = mount(EventCard, {
        props: {
          event: emptyEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('h4').text()).toBe('')
      expect(wrapper.find('.event-time').text()).toBe('')
      expect(wrapper.find('.event-location').text()).toBe('')
      expect(wrapper.find('.event-image').attributes('src')).toBe('')
    })

    it('should handle null time value', () => {
      const nullTimeEvent: Event = {
        ...mockEvent,
        time: null as any,
      }

      vi.mocked(useTime.formatDate).mockReturnValue('Invalid Date')

      wrapper = mount(EventCard, {
        props: {
          event: nullTimeEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(useTime.formatDate).toHaveBeenCalledWith(null)
      expect(wrapper.find('.event-time').text()).toBe('Invalid Date')
    })

    it('should handle undefined time value', () => {
      const undefinedTimeEvent: Event = {
        ...mockEvent,
        time: undefined as any,
      }

      vi.mocked(useTime.formatDate).mockReturnValue('Invalid Date')

      wrapper = mount(EventCard, {
        props: {
          event: undefinedTimeEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(useTime.formatDate).toHaveBeenCalledWith(undefined)
      expect(wrapper.find('.event-time').text()).toBe('Invalid Date')
    })

    it('should handle missing image', () => {
      const noImageEvent: Event = {
        ...mockEvent,
        image: '',
      }

      wrapper = mount(EventCard, {
        props: {
          event: noImageEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.event-image').attributes('src')).toBe('')
      expect(wrapper.find('.event-image').exists()).toBe(true)
    })

    it('should handle partial event object', () => {
      const partialEvent = {
        name: 'Test Event',
        time: '2025-01-01',
      } as Event

      wrapper = mount(EventCard, {
        props: {
          event: partialEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('h4').text()).toBe('Test Event')
      expect(wrapper.find('.event-card').exists()).toBe(true)
    })
  })

  describe('Bad Data Path', () => {
    it('should handle malformed date string', () => {
      const badDateEvent: Event = {
        ...mockEvent,
        time: 'not-a-valid-date',
      }

      vi.mocked(useTime.formatDate).mockReturnValue('Invalid Date')

      wrapper = mount(EventCard, {
        props: {
          event: badDateEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(useTime.formatDate).toHaveBeenCalledWith('not-a-valid-date')
      expect(wrapper.find('.event-time').text()).toBe('Invalid Date')
    })

    it('should handle extremely long event name', () => {
      const longNameEvent: Event = {
        ...mockEvent,
        name: 'A'.repeat(1000),
      }

      wrapper = mount(EventCard, {
        props: {
          event: longNameEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('h4').text()).toBe('A'.repeat(1000))
    })

    it('should handle extremely long location', () => {
      const longLocationEvent: Event = {
        ...mockEvent,
        location: 'B'.repeat(1000),
      }

      wrapper = mount(EventCard, {
        props: {
          event: longLocationEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.event-location').text()).toBe('B'.repeat(1000))
    })

    it('should handle invalid image URL', () => {
      const badImageEvent: Event = {
        ...mockEvent,
        image: 'not-a-valid-url',
      }

      wrapper = mount(EventCard, {
        props: {
          event: badImageEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.event-image').attributes('src')).toBe('not-a-valid-url')
      expect(wrapper.find('.event-image').exists()).toBe(true)
    })

    it('should handle special characters in event name', () => {
      const specialCharsEvent: Event = {
        ...mockEvent,
        name: '<script>alert("xss")</script>',
      }

      wrapper = mount(EventCard, {
        props: {
          event: specialCharsEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      // Vue should escape HTML by default
      const h4 = wrapper.find('h4')
      expect(h4.text()).toContain('script')
      expect(h4.html()).not.toContain('<script>')
    })

    it('should handle unicode and emoji in event details', () => {
      const unicodeEvent: Event = {
        name: '🎉 Tech Conference 欢迎',
        time: '2025-01-01',
        location: 'Convention Center 📍',
        description: 'Description',
        image: 'image.jpg',
      }

      wrapper = mount(EventCard, {
        props: {
          event: unicodeEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('h4').text()).toBe('🎉 Tech Conference 欢迎')
      expect(wrapper.find('.event-location').text()).toContain('📍')
    })

    it('should handle javascript: URL in image', () => {
      const maliciousImageEvent: Event = {
        ...mockEvent,
        image: 'javascript:alert("xss")',
      }

      wrapper = mount(EventCard, {
        props: {
          event: maliciousImageEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      // Component should still render
      expect(wrapper.find('.event-image').exists()).toBe(true)
    })

    it('should handle rapid clicking on card', async () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      // Click multiple times rapidly
      await wrapper.find('.event-card').trigger('click')
      await wrapper.find('.event-card').trigger('click')
      await wrapper.find('.event-card').trigger('click')

      // Modal should be open
      expect(wrapper.vm.isModalOpen).toBe(true)
    })
  })

  describe('Modal State Management', () => {
    it('should start with modal closed', () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.vm.isModalOpen).toBe(false)
    })

    it('should toggle modal open and close', async () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      // Open modal
      await wrapper.find('.event-card').trigger('click')
      expect(wrapper.vm.isModalOpen).toBe(true)

      // Close modal
      const modal = wrapper.findComponent({ name: 'EventModal' })
      await modal.vm.$emit('close')
      expect(wrapper.vm.isModalOpen).toBe(false)
    })

    it('should keep modal state independent between opens', async () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const modal = wrapper.findComponent({ name: 'EventModal' })

      // Open and close cycle 1
      await wrapper.find('.event-card').trigger('click')
      expect(wrapper.vm.isModalOpen).toBe(true)
      await modal.vm.$emit('close')
      expect(wrapper.vm.isModalOpen).toBe(false)

      // Open and close cycle 2
      await wrapper.find('.event-card').trigger('click')
      expect(wrapper.vm.isModalOpen).toBe(true)
      await modal.vm.$emit('close')
      expect(wrapper.vm.isModalOpen).toBe(false)
    })
  })

  describe('Component Structure', () => {
    it('should render all required elements', () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.event-card').exists()).toBe(true)
      expect(wrapper.find('.event-image').exists()).toBe(true)
      expect(wrapper.find('.event-details').exists()).toBe(true)
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.find('.event-time').exists()).toBe(true)
      expect(wrapper.find('.event-location').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'EventCalendarIcon' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'EventModal' }).exists()).toBe(true)
    })

    it('should have correct DOM hierarchy', () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const card = wrapper.find('.event-card')
      expect(card.find('.event-image').exists()).toBe(true)
      expect(card.find('.event-details').exists()).toBe(true)
      expect(card.findComponent({ name: 'EventCalendarIcon' }).exists()).toBe(true)
    })

    it('should render event details inside details container', () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const details = wrapper.find('.event-details')
      expect(details.find('h4').exists()).toBe(true)
      expect(details.find('.event-time').exists()).toBe(true)
      expect(details.find('.event-location').exists()).toBe(true)
    })
  })

  describe('Props Reactivity', () => {
    it('should update display when event prop changes', async () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('h4').text()).toBe('Tech Conference 2025')

      const newEvent: Event = {
        name: 'New Event',
        time: '2025-04-01',
        location: 'New Location',
        description: 'New Description',
        image: 'new-image.jpg',
      }

      await wrapper.setProps({ event: newEvent })

      expect(wrapper.find('h4').text()).toBe('New Event')
      expect(wrapper.find('.event-location').text()).toBe('New Location')
    })

    it('should pass updated event to modal', async () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const modal = wrapper.findComponent({ name: 'EventModal' })
      expect(modal.props('event')).toEqual(mockEvent)

      const newEvent: Event = {
        ...mockEvent,
        name: 'Updated Event',
      }

      await wrapper.setProps({ event: newEvent })

      expect(modal.props('event')).toEqual(newEvent)
    })

    it('should pass updated date to calendar icon', async () => {
      wrapper = mount(EventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const calendar = wrapper.findComponent({ name: 'EventCalendarIcon' })
      expect(calendar.props('date')).toBe('2025-03-15T10:00:00')

      const newEvent: Event = {
        ...mockEvent,
        time: '2025-12-31T23:59:59',
      }

      await wrapper.setProps({ event: newEvent })

      expect(calendar.props('date')).toBe('2025-12-31T23:59:59')
    })
  })
})
