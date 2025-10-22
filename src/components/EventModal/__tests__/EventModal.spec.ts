import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EventModal from '../EventModal.vue'
import { usePinnedEventsStore } from '@/stores/pinnedEvents'
import * as useTime from '@/utilities/useTime'
import type { Event } from '@/types/event'

// Mock the utilities
vi.mock('@/utilities/useTime', () => ({
  formatDate: vi.fn(),
  formatCalendarDate: vi.fn(),
}))

// Mock child components
vi.mock('@/assets/Icons/CloseIcon.vue', () => ({
  default: { name: 'CloseIcon', template: '<div class="close-icon"></div>' },
}))

vi.mock('@/assets/Icons/PinIcon.vue', () => ({
  default: { name: 'PinIcon', template: '<div class="pin-icon"></div>', props: ['pinned', 'size'] },
}))

vi.mock('../EventCalendarIcon/EventCalendarIcon.vue', () => ({
  default: {
    name: 'EventCalendarIcon',
    template: '<div class="event-calendar"></div>',
    props: ['date'],
  },
}))

describe('EventModal', () => {
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

  // Helper to mount modal
  const mountModal = async (props: { event: Event; isOpen: boolean }) => {
    wrapper = mount(EventModal, {
      props,
      global: {
        plugins: [pinia],
      },
      attachTo: document.getElementById('app')!,
    })
    await wrapper.vm.$nextTick()
    return wrapper
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    pinnedStore = usePinnedEventsStore()

    vi.mocked(useTime.formatDate).mockReturnValue('March 15, 2025 at 10:00 AM')
    vi.mocked(useTime.formatCalendarDate).mockReturnValue({ month: 'MAR', day: '15' })

    // Clear body and create fresh container for each test
    document.body.innerHTML = '<div id="app"></div>'
  })

  afterEach(() => {
    // Reset body overflow first
    document.body.style.overflow = ''
    wrapper?.unmount()
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  describe('Happy Path', () => {
    it('should render modal when isOpen is true', async () => {
      await mountModal({ event: mockEvent, isOpen: true })

      expect(document.querySelector('.modal-overlay')).toBeTruthy()
      expect(document.querySelector('.modal-container')).toBeTruthy()
    })

    it('should not render modal when isOpen is false', async () => {
      await mountModal({ event: mockEvent, isOpen: false })

      expect(document.querySelector('.modal-overlay')).toBeFalsy()
    })

    it('should display event information correctly', async () => {
      await mountModal({ event: mockEvent, isOpen: true })

      expect(document.querySelector('#modal-title')?.textContent).toBe(mockEvent.name)
      expect(document.querySelector('.modal-time')?.textContent).toBe('March 15, 2025 at 10:00 AM')
      expect(document.querySelector('.modal-location')?.textContent).toBe(mockEvent.location)
      expect(document.querySelector('.modal-description')?.textContent).toBe(mockEvent.description)
      expect(document.querySelector<HTMLImageElement>('.modal-image')?.src).toContain(
        mockEvent.image,
      )
      expect(document.querySelector<HTMLImageElement>('.modal-image')?.alt).toBe(mockEvent.name)
    })

    it('should emit close event when close button is clicked', async () => {
      await mountModal({ event: mockEvent, isOpen: true })

      const closeButton = document.querySelector('.modal-close') as HTMLElement
      closeButton.click()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('should emit close event when overlay is clicked', async () => {
      await mountModal({ event: mockEvent, isOpen: true })

      const overlay = document.querySelector('.modal-overlay') as HTMLElement
      overlay.click()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should not close when clicking inside modal container', async () => {
      await mountModal({ event: mockEvent, isOpen: true })

      const container = document.querySelector('.modal-container') as HTMLElement
      container.click()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('should close modal on Escape key press', async () => {
      await mountModal({ event: mockEvent, isOpen: true })

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(escapeEvent)
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should toggle pin status when pin button is clicked', async () => {
      await mountModal({ event: mockEvent, isOpen: true })

      const initialCount = pinnedStore.pinnedEvents.length

      const pinButton = document.querySelector('.pin-icon-button') as HTMLElement
      pinButton.click()
      await wrapper.vm.$nextTick()

      expect(pinnedStore.pinnedEvents.length).toBe(initialCount + 1)
    })

    it('should show correct pin text based on pin status', async () => {
      await mountModal({ event: mockEvent, isOpen: true })

      expect(document.querySelector('.pin-text')?.textContent).toBe('Pin')

      pinnedStore.togglePin(mockEvent)
      await wrapper.vm.$nextTick()

      expect(document.querySelector('.pin-text')?.textContent).toBe('Unpin')
    })

    it('should manage body overflow when modal opens and closes', async () => {
      await mountModal({ event: mockEvent, isOpen: false })

      expect(document.body.style.overflow).toBe('')

      await wrapper.setProps({ isOpen: true })
      await wrapper.vm.$nextTick()
      expect(document.body.style.overflow).toBe('hidden')

      await wrapper.setProps({ isOpen: false })
      await wrapper.vm.$nextTick()
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Null/Undefined Path', () => {
    it('should handle event with null/empty values', async () => {
      const emptyEvent: Event = {
        name: '',
        time: '',
        location: '',
        description: '',
        image: '',
      }

      vi.mocked(useTime.formatDate).mockReturnValue('')

      await mountModal({ event: emptyEvent, isOpen: true })

      expect(document.querySelector('#modal-title')?.textContent).toBe('')
      expect(document.querySelector('.modal-time')?.textContent).toBe('')
      expect(document.querySelector('.modal-location')?.textContent).toBe('')
      expect(document.querySelector('.modal-description')?.textContent).toBe('')
    })

    it('should handle missing image src', async () => {
      const noImageEvent: Event = {
        ...mockEvent,
        image: '',
      }

      await mountModal({ event: noImageEvent, isOpen: true })

      expect(document.querySelector<HTMLImageElement>('.modal-image')?.src).toBeTruthy()
    })

    it('should handle null time value', async () => {
      const nullTimeEvent: Event = {
        ...mockEvent,
        time: null as any,
      }

      vi.mocked(useTime.formatDate).mockReturnValue('Invalid Date')

      await mountModal({ event: nullTimeEvent, isOpen: true })

      expect(useTime.formatDate).toHaveBeenCalledWith(null)
      expect(document.querySelector('.modal-time')?.textContent).toBe('Invalid Date')
    })

    it('should handle undefined event properties', async () => {
      const partialEvent = {
        name: 'Test Event',
        time: '2025-01-01',
      } as Event

      await mountModal({ event: partialEvent, isOpen: true })

      expect(document.querySelector('.modal-location')?.textContent).toBe('')
      expect(document.querySelector('.modal-description')?.textContent).toBe('')
    })
  })

  describe('Bad Data Path', () => {
    it('should handle malformed date string', async () => {
      const badDateEvent: Event = {
        ...mockEvent,
        time: 'not-a-valid-date',
      }

      vi.mocked(useTime.formatDate).mockReturnValue('Invalid Date')

      await mountModal({ event: badDateEvent, isOpen: true })

      expect(useTime.formatDate).toHaveBeenCalledWith('not-a-valid-date')
      expect(document.querySelector('.modal-time')?.textContent).toBe('Invalid Date')
    })

    it('should handle extremely long text content', async () => {
      const longTextEvent: Event = {
        ...mockEvent,
        name: 'A'.repeat(1000),
        description: 'B'.repeat(5000),
        location: 'C'.repeat(500),
      }

      await mountModal({ event: longTextEvent, isOpen: true })

      expect(document.querySelector('#modal-title')?.textContent).toBe('A'.repeat(1000))
      expect(document.querySelector('.modal-description')?.textContent).toBe('B'.repeat(5000))
      expect(document.querySelector('.modal-location')?.textContent).toBe('C'.repeat(500))
    })

    it('should handle invalid image URL', async () => {
      const badImageEvent: Event = {
        ...mockEvent,
        image: 'not-a-valid-url',
      }

      await mountModal({ event: badImageEvent, isOpen: true })

      expect(document.querySelector('.modal-image')).toBeTruthy()
    })

    it('should handle special characters in event data', async () => {
      const specialCharsEvent: Event = {
        name: '<script>alert("xss")</script>',
        time: '2025-01-01',
        location: '"; DROP TABLE events; --',
        description: '{{malicious}}',
        image: 'javascript:alert("xss")',
      }

      await mountModal({ event: specialCharsEvent, isOpen: true })

      // Vue should escape these by default - check that actual script tag doesn't exist
      const titleElement = document.querySelector('#modal-title')
      expect(titleElement?.innerHTML).toContain('&lt;script&gt;')
      expect(titleElement?.textContent).toContain('script')

      // Ensure no actual executable script tag
      const scripts = document.querySelectorAll('script')
      const hasXSSScript = Array.from(scripts).some((script) =>
        script.textContent?.includes('alert("xss")'),
      )
      expect(hasXSSScript).toBe(false)
    })

    it('should not crash with random keyboard events when modal is closed', async () => {
      await mountModal({ event: mockEvent, isOpen: false })

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(escapeEvent)
      await wrapper.vm.$nextTick()

      // Should not emit close since modal is already closed
      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      await mountModal({ event: mockEvent, isOpen: true })

      const overlay = document.querySelector('.modal-overlay')
      expect(overlay?.getAttribute('role')).toBe('dialog')
      expect(overlay?.getAttribute('aria-modal')).toBe('true')
      expect(overlay?.getAttribute('aria-labelledby')).toBe('modal-title')
    })

    it('should have aria-label on close button', async () => {
      await mountModal({ event: mockEvent, isOpen: true })

      expect(document.querySelector('.modal-close')?.getAttribute('aria-label')).toBe('Close modal')
    })

    it('should have dynamic aria-label on pin button', async () => {
      await mountModal({ event: mockEvent, isOpen: true })

      expect(document.querySelector('.pin-icon-button')?.getAttribute('aria-label')).toBe(
        'Pin event',
      )

      pinnedStore.togglePin(mockEvent)
      await wrapper.vm.$nextTick()

      expect(document.querySelector('.pin-icon-button')?.getAttribute('aria-label')).toBe(
        'Unpin event',
      )
    })
  })

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      await mountModal({ event: mockEvent, isOpen: true })

      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should restore body overflow on unmount', async () => {
      // Mount with isOpen: false first
      wrapper = mount(EventModal, {
        props: {
          event: mockEvent,
          isOpen: false,
        },
        global: {
          plugins: [pinia],
        },
        attachTo: document.getElementById('app')!,
      })
      await wrapper.vm.$nextTick()

      // Now open it to trigger the watcher
      await wrapper.setProps({ isOpen: true })
      await wrapper.vm.$nextTick()

      // Body overflow should be hidden when modal is open
      expect(document.body.style.overflow).toBe('hidden')

      // Manually unmount without afterEach interference
      const currentWrapper = wrapper
      wrapper = null as any // Prevent afterEach from unmounting
      currentWrapper.unmount()

      // Should be restored after unmount
      expect(document.body.style.overflow).toBe('')
    })
  })
})
