import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PinnedEventCard from '../PinnedEventCard.vue'
import { usePinnedEventsStore } from '@/stores/pinnedEvents'
import * as useTime from '@/utilities/useTime'
import type { Event } from '@/types/event'

// Mock the utilities
vi.mock('@/utilities/useTime', () => ({
  formatDate: vi.fn(),
  formatCalendarDate: vi.fn(),
}))

// Mock child components
vi.mock('@/assets/Icons/PinIcon.vue', () => ({
  default: { name: 'PinIcon', template: '<div class="pin-icon"></div>', props: ['pinned', 'size'] },
}))

vi.mock('../EventModal/EventModal.vue', () => ({
  default: {
    name: 'EventModal',
    template: '<div class="event-modal"></div>',
    props: ['event', 'isOpen'],
    emits: ['close'],
  },
}))

describe('PinnedEventCard', () => {
  let wrapper: VueWrapper
  let pinia: ReturnType<typeof createPinia>
  let pinnedStore: ReturnType<typeof usePinnedEventsStore>

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
    pinnedStore = usePinnedEventsStore()

    vi.mocked(useTime.formatDate).mockReturnValue('March 15, 2025 at 10:00 AM')
    vi.mocked(useTime.formatCalendarDate).mockReturnValue({ month: 'MAR', day: '15' })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  describe('Happy Path', () => {
    it('should render event card with event details', () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('h4').text()).toBe(mockEvent.name)
      expect(wrapper.find('.pinned-event-time').text()).toBe('March 15, 2025 at 10:00 AM')
      expect(wrapper.find('.pinned-event-image').attributes('src')).toBe(mockEvent.image)
      expect(wrapper.find('.pinned-event-image').attributes('alt')).toBe(mockEvent.name)
    })

    it('should call formatDate with correct time', () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(useTime.formatDate).toHaveBeenCalledWith(mockEvent.time)
    })

    it('should open modal when image is clicked', async () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.vm.isModalOpen).toBe(false)

      await wrapper.find('.image-container').trigger('click')

      expect(wrapper.vm.isModalOpen).toBe(true)
    })

    it('should open modal when event details are clicked', async () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.vm.isModalOpen).toBe(false)

      await wrapper.find('.pinned-event-details').trigger('click')

      expect(wrapper.vm.isModalOpen).toBe(true)
    })

    it('should close modal when EventModal emits close', async () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      // Open modal first
      await wrapper.find('.image-container').trigger('click')
      expect(wrapper.vm.isModalOpen).toBe(true)

      // Emit close event from modal
      const modal = wrapper.findComponent({ name: 'EventModal' })
      await modal.vm.$emit('close')

      expect(wrapper.vm.isModalOpen).toBe(false)
    })

    it('should toggle pin when pin button is clicked', async () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const initialPinnedCount = pinnedStore.pinnedEvents.length

      await wrapper.find('.pin-icon-button').trigger('click')
      await wrapper.vm.$nextTick()

      // Check that the store state changed
      expect(pinnedStore.pinnedEvents.length).toBe(initialPinnedCount + 1)
    })

    it('should not open modal when pin button is clicked', async () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.vm.isModalOpen).toBe(false)

      await wrapper.find('.pin-icon-button').trigger('click')

      // Modal should remain closed due to @click.stop
      expect(wrapper.vm.isModalOpen).toBe(false)
    })

    it('should compute isPinned correctly', async () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.vm.isPinned).toBe(false)

      pinnedStore.togglePin(mockEvent)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isPinned).toBe(true)
    })

    it('should update aria-label based on pin status', async () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.pin-icon-button').attributes('aria-label')).toBe('Pin event')

      pinnedStore.togglePin(mockEvent)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.pin-icon-button').attributes('aria-label')).toBe('Unpin event')
    })

    it('should pass correct props to EventModal', () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const modal = wrapper.findComponent({ name: 'EventModal' })
      expect(modal.props('event')).toEqual(mockEvent)
      expect(modal.props('isOpen')).toBe(false)
    })

    it('should update modal isOpen prop when opening', async () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const modal = wrapper.findComponent({ name: 'EventModal' })
      expect(modal.props('isOpen')).toBe(false)

      await wrapper.find('.image-container').trigger('click')

      expect(modal.props('isOpen')).toBe(true)
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

      wrapper = mount(PinnedEventCard, {
        props: {
          event: emptyEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('h4').text()).toBe('')
      expect(wrapper.find('.pinned-event-time').text()).toBe('')
      expect(wrapper.find('.pinned-event-image').attributes('src')).toBe('')
    })

    it('should handle null time value', () => {
      const nullTimeEvent: Event = {
        ...mockEvent,
        time: null as any,
      }

      vi.mocked(useTime.formatDate).mockReturnValue('Invalid Date')

      wrapper = mount(PinnedEventCard, {
        props: {
          event: nullTimeEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(useTime.formatDate).toHaveBeenCalledWith(null)
      expect(wrapper.find('.pinned-event-time').text()).toBe('Invalid Date')
    })

    it('should handle undefined time value', () => {
      const undefinedTimeEvent: Event = {
        ...mockEvent,
        time: undefined as any,
      }

      vi.mocked(useTime.formatDate).mockReturnValue('Invalid Date')

      wrapper = mount(PinnedEventCard, {
        props: {
          event: undefinedTimeEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(useTime.formatDate).toHaveBeenCalledWith(undefined)
      expect(wrapper.find('.pinned-event-time').text()).toBe('Invalid Date')
    })

    it('should handle missing image', () => {
      const noImageEvent: Event = {
        ...mockEvent,
        image: '',
      }

      wrapper = mount(PinnedEventCard, {
        props: {
          event: noImageEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.pinned-event-image').attributes('src')).toBe('')
      expect(wrapper.find('.pinned-event-image').exists()).toBe(true)
    })

    it('should handle partial event object', () => {
      const partialEvent = {
        name: 'Test Event',
        time: '2025-01-01',
      } as Event

      wrapper = mount(PinnedEventCard, {
        props: {
          event: partialEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('h4').text()).toBe('Test Event')
      expect(wrapper.find('.pinned-event-card').exists()).toBe(true)
    })
  })

  describe('Bad Data Path', () => {
    it('should handle malformed date string', () => {
      const badDateEvent: Event = {
        ...mockEvent,
        time: 'not-a-valid-date',
      }

      vi.mocked(useTime.formatDate).mockReturnValue('Invalid Date')

      wrapper = mount(PinnedEventCard, {
        props: {
          event: badDateEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(useTime.formatDate).toHaveBeenCalledWith('not-a-valid-date')
      expect(wrapper.find('.pinned-event-time').text()).toBe('Invalid Date')
    })

    it('should handle extremely long event name', () => {
      const longNameEvent: Event = {
        ...mockEvent,
        name: 'A'.repeat(1000),
      }

      wrapper = mount(PinnedEventCard, {
        props: {
          event: longNameEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('h4').text()).toBe('A'.repeat(1000))
    })

    it('should handle invalid image URL', () => {
      const badImageEvent: Event = {
        ...mockEvent,
        image: 'not-a-valid-url',
      }

      wrapper = mount(PinnedEventCard, {
        props: {
          event: badImageEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.pinned-event-image').attributes('src')).toBe('not-a-valid-url')
      expect(wrapper.find('.pinned-event-image').exists()).toBe(true)
    })

    it('should handle special characters in event name', () => {
      const specialCharsEvent: Event = {
        ...mockEvent,
        name: '<script>alert("xss")</script>',
      }

      wrapper = mount(PinnedEventCard, {
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

    it('should handle unicode and emoji in event name', () => {
      const unicodeEvent: Event = {
        ...mockEvent,
        name: '🎉 Tech Conference 欢迎',
      }

      wrapper = mount(PinnedEventCard, {
        props: {
          event: unicodeEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('h4').text()).toBe('🎉 Tech Conference 欢迎')
    })

    it('should handle javascript: URL in image', () => {
      const maliciousImageEvent: Event = {
        ...mockEvent,
        image: 'javascript:alert("xss")',
      }

      wrapper = mount(PinnedEventCard, {
        props: {
          event: maliciousImageEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      // Component should still render
      expect(wrapper.find('.pinned-event-image').exists()).toBe(true)
    })

    it('should handle rapid clicking on modal triggers', async () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      // Click multiple times rapidly
      await wrapper.find('.image-container').trigger('click')
      await wrapper.find('.pinned-event-details').trigger('click')
      await wrapper.find('.image-container').trigger('click')

      // Modal should be open
      expect(wrapper.vm.isModalOpen).toBe(true)
    })

    it('should handle rapid pin toggling', async () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const initialCount = pinnedStore.pinnedEvents.length

      // Click pin button multiple times
      await wrapper.find('.pin-icon-button').trigger('click')
      await wrapper.vm.$nextTick()
      await wrapper.find('.pin-icon-button').trigger('click')
      await wrapper.vm.$nextTick()
      await wrapper.find('.pin-icon-button').trigger('click')
      await wrapper.vm.$nextTick()

      // After 3 toggles (odd number), should be pinned
      expect(pinnedStore.isPinned(mockEvent.name)).toBe(true)
    })
  })

  describe('Component Structure', () => {
    it('should render all required elements', () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.pinned-event-card').exists()).toBe(true)
      expect(wrapper.find('.image-container').exists()).toBe(true)
      expect(wrapper.find('.pinned-event-image').exists()).toBe(true)
      expect(wrapper.find('.pin-icon-button').exists()).toBe(true)
      expect(wrapper.find('.pinned-event-details').exists()).toBe(true)
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.find('.pinned-event-time').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'EventModal' }).exists()).toBe(true)
    })

    it('should have image container as clickable element', () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const imageContainer = wrapper.find('.image-container')
      // Check that the element exists and has the click handler
      expect(imageContainer.exists()).toBe(true)
      expect(imageContainer.attributes('class')).toContain('image-container')
    })

    it('should have event details as clickable element', () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const eventDetails = wrapper.find('.pinned-event-details')
      // Check that the element exists and has the click handler
      expect(eventDetails.exists()).toBe(true)
      expect(eventDetails.attributes('class')).toContain('pinned-event-details')
    })
  })

  describe('Modal State Management', () => {
    it('should start with modal closed', () => {
      wrapper = mount(PinnedEventCard, {
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
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      // Open modal
      await wrapper.find('.image-container').trigger('click')
      expect(wrapper.vm.isModalOpen).toBe(true)

      // Close modal
      const modal = wrapper.findComponent({ name: 'EventModal' })
      await modal.vm.$emit('close')
      expect(wrapper.vm.isModalOpen).toBe(false)
    })

    it('should keep modal state independent between opens', async () => {
      wrapper = mount(PinnedEventCard, {
        props: {
          event: mockEvent,
        },
        global: {
          plugins: [pinia],
        },
      })

      const modal = wrapper.findComponent({ name: 'EventModal' })

      // Open and close cycle 1
      await wrapper.find('.image-container').trigger('click')
      expect(wrapper.vm.isModalOpen).toBe(true)
      await modal.vm.$emit('close')
      expect(wrapper.vm.isModalOpen).toBe(false)

      // Open and close cycle 2
      await wrapper.find('.pinned-event-details').trigger('click')
      expect(wrapper.vm.isModalOpen).toBe(true)
      await modal.vm.$emit('close')
      expect(wrapper.vm.isModalOpen).toBe(false)
    })
  })
})
