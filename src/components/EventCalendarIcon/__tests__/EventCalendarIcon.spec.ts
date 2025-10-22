import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import EventCalendar from '../EventCalendarIcon.vue'
import * as useTime from '@/utilities/useTime'

// Mock the formatCalendarDate function
vi.mock('@/utilities/useTime', () => ({
  formatCalendarDate: vi.fn(),
}))

describe('EventCalendar', () => {
  describe('Happy Path', () => {
    it('should render calendar with formatted date', () => {
      // Setup mock return value
      vi.mocked(useTime.formatCalendarDate).mockReturnValue({
        month: 'JAN',
        day: '15',
      })

      const wrapper = mount(EventCalendar, {
        props: {
          date: '2025-01-15',
        },
      })

      // Verify the function was called with correct date
      expect(useTime.formatCalendarDate).toHaveBeenCalledWith('2025-01-15')

      // Check rendered output
      expect(wrapper.find('.calendar-month').text()).toBe('JAN')
      expect(wrapper.find('.calendar-date').text()).toBe('15')
    })

    it('should render different dates correctly', () => {
      vi.mocked(useTime.formatCalendarDate).mockReturnValue({
        month: 'DEC',
        day: '31',
      })

      const wrapper = mount(EventCalendar, {
        props: {
          date: '2025-12-31',
        },
      })

      expect(wrapper.find('.calendar-month').text()).toBe('DEC')
      expect(wrapper.find('.calendar-date').text()).toBe('31')
    })
  })

  describe('Null/Undefined Path', () => {
    it('should handle null date gracefully', () => {
      vi.mocked(useTime.formatCalendarDate).mockReturnValue({
        month: '',
        day: '',
      })

      const wrapper = mount(EventCalendar, {
        props: {
          date: null as any,
        },
      })

      expect(useTime.formatCalendarDate).toHaveBeenCalledWith(null)
      expect(wrapper.find('.calendar-month').text()).toBe('')
      expect(wrapper.find('.calendar-date').text()).toBe('')
    })

    it('should handle undefined date gracefully', () => {
      vi.mocked(useTime.formatCalendarDate).mockReturnValue({
        month: '',
        day: '',
      })

      const wrapper = mount(EventCalendar, {
        props: {
          date: undefined as any,
        },
      })

      expect(useTime.formatCalendarDate).toHaveBeenCalledWith(undefined)
      expect(wrapper.find('.calendar-month').text()).toBe('')
      expect(wrapper.find('.calendar-date').text()).toBe('')
    })

    it('should handle empty string date', () => {
      vi.mocked(useTime.formatCalendarDate).mockReturnValue({
        month: '',
        day: '',
      })

      const wrapper = mount(EventCalendar, {
        props: {
          date: '',
        },
      })

      expect(useTime.formatCalendarDate).toHaveBeenCalledWith('')
      expect(wrapper.find('.calendar-month').text()).toBe('')
      expect(wrapper.find('.calendar-date').text()).toBe('')
    })
  })

  describe('Bad Data Path', () => {
    it('should handle invalid date format gracefully', () => {
      // Mock fallback behavior for invalid date
      vi.mocked(useTime.formatCalendarDate).mockReturnValue({
        month: 'INVALID',
        day: '--',
      })

      const wrapper = mount(EventCalendar, {
        props: {
          date: 'not-a-date',
        },
      })

      expect(useTime.formatCalendarDate).toHaveBeenCalledWith('not-a-date')
      expect(wrapper.find('.calendar-month').text()).toBe('INVALID')
      expect(wrapper.find('.calendar-date').text()).toBe('--')
    })

    it('should handle malformed date string', () => {
      vi.mocked(useTime.formatCalendarDate).mockReturnValue({
        month: '---',
        day: '--',
      })

      const wrapper = mount(EventCalendar, {
        props: {
          date: '2025-13-45', // Invalid month and day
        },
      })

      expect(useTime.formatCalendarDate).toHaveBeenCalledWith('2025-13-45')
      expect(wrapper.find('.calendar-month').text()).toBe('---')
      expect(wrapper.find('.calendar-date').text()).toBe('--')
    })

    it('should handle random string input', () => {
      vi.mocked(useTime.formatCalendarDate).mockReturnValue({
        month: '',
        day: '',
      })

      const wrapper = mount(EventCalendar, {
        props: {
          date: 'xyz123!@#',
        },
      })

      expect(useTime.formatCalendarDate).toHaveBeenCalledWith('xyz123!@#')
      expect(wrapper.html()).toContain('calendar-month')
      expect(wrapper.html()).toContain('calendar-date')
    })
  })

  describe('Component Structure', () => {
    it('should render all required elements', () => {
      vi.mocked(useTime.formatCalendarDate).mockReturnValue({
        month: 'JAN',
        day: '15',
      })

      const wrapper = mount(EventCalendar, {
        props: {
          date: '2025-01-15',
        },
      })

      expect(wrapper.find('.event-calendar').exists()).toBe(true)
      expect(wrapper.find('.calendar-banner').exists()).toBe(true)
      expect(wrapper.find('.calendar-time').exists()).toBe(true)
      expect(wrapper.find('.calendar-month').exists()).toBe(true)
      expect(wrapper.find('.calendar-date').exists()).toBe(true)
    })
  })
})
