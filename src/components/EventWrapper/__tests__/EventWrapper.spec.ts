import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EventWrapper from '../EventWrapper.vue'
import { useEventStore } from '@/stores/events'

// Mock child components
vi.mock('./EventList.vue', () => ({
  default: {
    name: 'EventList',
    template: '<div class="event-list">Event List</div>',
  },
}))

vi.mock('@/components/PinnedEvents/PinnedEvents.vue', () => ({
  default: {
    name: 'PinnedEvents',
    template: '<div class="pinned-events">Pinned Events</div>',
  },
}))

describe('EventWrapper', () => {
  let wrapper: VueWrapper
  let pinia: ReturnType<typeof createPinia>
  let eventStore: ReturnType<typeof useEventStore>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    eventStore = useEventStore()

    // Mock fetchEvents
    vi.spyOn(eventStore, 'fetchEvents').mockResolvedValue(undefined)
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  describe('Happy Path', () => {
    it('should render wrapper with heading', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.event-wrapper').exists()).toBe(true)
      expect(wrapper.find('h2').text()).toBe('My Events')
    })

    it('should render PinnedEvents component', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findComponent({ name: 'PinnedEvents' }).exists()).toBe(true)
    })

    it('should render EventList component', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.findComponent({ name: 'EventList' }).exists()).toBe(true)
    })

    it('should fetch events on mount', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      expect(eventStore.fetchEvents).toHaveBeenCalledTimes(1)
    })

    it('should have proper ARIA role', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.event-wrapper').attributes('role')).toBe('main')
    })

    it('should render components in correct order', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      const wrapperElement = wrapper.find('.event-wrapper')
      const html = wrapperElement.html()

      const h2Index = html.indexOf('<h2')
      const pinnedIndex = html.indexOf('pinned-events')
      const eventListIndex = html.indexOf('event-list')

      expect(h2Index).toBeLessThan(pinnedIndex)
      expect(pinnedIndex).toBeLessThan(eventListIndex)
    })
  })

  describe('Null/Undefined Path', () => {
    it('should handle fetchEvents returning undefined', async () => {
      vi.spyOn(eventStore, 'fetchEvents').mockResolvedValue(undefined)

      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.find('.event-wrapper').exists()).toBe(true)
    })

    it('should handle fetchEvents returning null', async () => {
      vi.spyOn(eventStore, 'fetchEvents').mockResolvedValue(null as any)

      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.find('.event-wrapper').exists()).toBe(true)
    })
  })

  describe('Bad Data Path', () => {
    it('should handle fetchEvents throwing an error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(eventStore, 'fetchEvents').mockRejectedValue(new Error('Network error'))

      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      await wrapper.vm.$nextTick()

      // Component should still render even if fetch fails
      expect(wrapper.find('.event-wrapper').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'EventList' }).exists()).toBe(true)

      consoleErrorSpy.mockRestore()
    })

    it('should handle fetchEvents with network timeout', async () => {
      vi.spyOn(eventStore, 'fetchEvents').mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(undefined), 5000)
        })
      })

      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      // Component should render immediately, not waiting for fetch
      expect(wrapper.find('.event-wrapper').exists()).toBe(true)
    })

    it('should handle multiple rapid mounts', () => {
      const fetchSpy = vi.spyOn(eventStore, 'fetchEvents')

      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      wrapper.unmount()

      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      // Each mount should call fetchEvents
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('Component Structure', () => {
    it('should have all required elements', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      expect(wrapper.find('.event-wrapper').exists()).toBe(true)
      expect(wrapper.find('h2').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'PinnedEvents' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'EventList' }).exists()).toBe(true)
    })

    it('should render heading inside wrapper', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      const wrapperEl = wrapper.find('.event-wrapper')
      const heading = wrapperEl.find('h2')

      expect(heading.exists()).toBe(true)
      expect(wrapperEl.element.contains(heading.element)).toBe(true)
    })

    it('should render PinnedEvents inside wrapper', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      const wrapperEl = wrapper.find('.event-wrapper')
      const pinnedEvents = wrapper.findComponent({ name: 'PinnedEvents' })

      expect(wrapperEl.element.contains(pinnedEvents.element)).toBe(true)
    })

    it('should render EventList inside wrapper', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      const wrapperEl = wrapper.find('.event-wrapper')
      const eventList = wrapper.findComponent({ name: 'EventList' })

      expect(wrapperEl.element.contains(eventList.element)).toBe(true)
    })
  })

  describe('Store Integration', () => {
    it('should use eventStore', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      // Verify store method was called
      expect(eventStore.fetchEvents).toHaveBeenCalled()
    })

    it('should only fetch events once on mount', () => {
      const fetchSpy = vi.spyOn(eventStore, 'fetchEvents')

      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      // Should be called exactly once
      expect(fetchSpy).toHaveBeenCalledTimes(1)
      expect(fetchSpy).toHaveBeenCalledWith()
    })

    it('should not fetch events again after initial mount', async () => {
      const fetchSpy = vi.spyOn(eventStore, 'fetchEvents')

      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      expect(fetchSpy).toHaveBeenCalledTimes(1)

      // Trigger some updates
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Should still only be called once
      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Lifecycle', () => {
    it('should call fetchEvents in onMounted hook', () => {
      const fetchSpy = vi.spyOn(eventStore, 'fetchEvents')

      // Before mount - not called
      expect(fetchSpy).not.toHaveBeenCalled()

      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      // After mount - called
      expect(fetchSpy).toHaveBeenCalled()
    })

    it('should handle unmount gracefully', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      expect(() => wrapper.unmount()).not.toThrow()
    })

    it('should not call fetchEvents on unmount', () => {
      const fetchSpy = vi.spyOn(eventStore, 'fetchEvents')

      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      fetchSpy.mockClear()

      wrapper.unmount()

      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      const mainElement = wrapper.find('[role="main"]')
      expect(mainElement.exists()).toBe(true)
      expect(mainElement.element.tagName.toLowerCase()).toBe('div')
    })

    it('should have proper heading hierarchy', () => {
      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      const h2 = wrapper.find('h2')
      expect(h2.exists()).toBe(true)
      expect(h2.text()).toBe('My Events')
    })
  })

  describe('Edge Cases', () => {
    it('should render even if store is empty', () => {
      // Create fresh store with no data
      const emptyPinia = createPinia()
      setActivePinia(emptyPinia)
      const emptyStore = useEventStore()
      vi.spyOn(emptyStore, 'fetchEvents').mockResolvedValue(undefined)

      wrapper = mount(EventWrapper, {
        global: {
          plugins: [emptyPinia],
        },
      })

      expect(wrapper.find('.event-wrapper').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'EventList' }).exists()).toBe(true)
    })

    it('should handle concurrent mounts with shared store', async () => {
      const fetchSpy = vi.spyOn(eventStore, 'fetchEvents')

      const wrapper1 = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      const wrapper2 = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      // Each instance should call fetchEvents
      expect(fetchSpy).toHaveBeenCalledTimes(2)

      wrapper1.unmount()
      wrapper2.unmount()
    })

    it('should maintain component state after fetch completes', async () => {
      let resolveFetch: (value: any) => void
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve
      })

      vi.spyOn(eventStore, 'fetchEvents').mockReturnValue(fetchPromise as any)

      wrapper = mount(EventWrapper, {
        global: {
          plugins: [pinia],
        },
      })

      // Component should be rendered before fetch completes
      expect(wrapper.find('.event-wrapper').exists()).toBe(true)

      // Resolve the fetch
      resolveFetch!(undefined)
      await wrapper.vm.$nextTick()

      // Component should still be rendered after fetch completes
      expect(wrapper.find('.event-wrapper').exists()).toBe(true)
    })
  })
})
