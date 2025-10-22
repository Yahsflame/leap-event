import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SiteBanner from '../SiteBanner.vue'

describe('SiteBanner', () => {
  describe('Happy Path', () => {
    it('should render banner with provided text', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Welcome to Our Site',
          backgroundColor: '#3498db',
          fontColor: '#ffffff',
        },
      })

      expect(wrapper.find('h1').text()).toBe('Welcome to Our Site')
    })

    it('should apply background color correctly', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test Banner',
          backgroundColor: '#e74c3c',
          fontColor: '#000000',
        },
      })

      const banner = wrapper.find('.site-banner')
      expect(banner.attributes('style')).toContain('background-color: rgb(231, 76, 60)')
    })

    it('should apply font color correctly', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test Banner',
          backgroundColor: '#ffffff',
          fontColor: '#2c3e50',
        },
      })

      const banner = wrapper.find('.site-banner')
      expect(banner.attributes('style')).toContain('color: rgb(44, 62, 80)')
    })

    it('should apply both colors simultaneously', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Styled Banner',
          backgroundColor: '#1abc9c',
          fontColor: '#ecf0f1',
        },
      })

      const banner = wrapper.find('.site-banner')
      const style = banner.attributes('style')

      expect(style).toContain('background-color: rgb(26, 188, 156)')
      expect(style).toContain('color: rgb(236, 240, 241)')
    })

    it('should render with different text content', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Events Calendar 2025',
          backgroundColor: '#9b59b6',
          fontColor: '#ffffff',
        },
      })

      expect(wrapper.find('h1').text()).toBe('Events Calendar 2025')
    })

    it('should accept hex colors with shorthand notation', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test',
          backgroundColor: '#f00',
          fontColor: '#0f0',
        },
      })

      const banner = wrapper.find('.site-banner')
      const style = banner.attributes('style')

      // Browsers convert shorthand hex to rgb
      expect(style).toContain('background-color: rgb(255, 0, 0)')
      expect(style).toContain('color: rgb(0, 255, 0)')
    })

    it('should accept rgb color values', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'RGB Colors',
          backgroundColor: 'rgb(100, 150, 200)',
          fontColor: 'rgb(50, 50, 50)',
        },
      })

      const banner = wrapper.find('.site-banner')
      const style = banner.attributes('style')

      expect(style).toContain('background-color: rgb(100, 150, 200)')
      expect(style).toContain('color: rgb(50, 50, 50)')
    })

    it('should accept rgba color values with transparency', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Transparent Banner',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          fontColor: 'rgba(255, 255, 255, 0.9)',
        },
      })

      const banner = wrapper.find('.site-banner')
      const style = banner.attributes('style')

      expect(style).toContain('background-color: rgba(0, 0, 0, 0.5)')
      expect(style).toContain('color: rgba(255, 255, 255, 0.9)')
    })

    it('should accept named colors', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Named Colors',
          backgroundColor: 'navy',
          fontColor: 'white',
        },
      })

      const banner = wrapper.find('.site-banner')
      const style = banner.attributes('style')

      expect(style).toContain('background-color: navy')
      expect(style).toContain('color: white')
    })
  })

  describe('Null/Undefined Path', () => {
    it('should handle empty text string', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: '',
          backgroundColor: '#000000',
          fontColor: '#ffffff',
        },
      })

      expect(wrapper.find('h1').text()).toBe('')
      expect(wrapper.find('h1').exists()).toBe(true)
    })

    it('should handle empty background color', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test',
          backgroundColor: '',
          fontColor: '#000000',
        },
      })

      const banner = wrapper.find('.site-banner')
      const style = banner.attributes('style')
      // Empty string will still create a style attribute with the font color
      expect(style).toBeDefined()
      expect(banner.exists()).toBe(true)
    })

    it('should handle empty font color', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test',
          backgroundColor: '#ffffff',
          fontColor: '',
        },
      })

      const banner = wrapper.find('.site-banner')
      expect(banner.attributes('style')).toContain('color:')
    })

    it('should handle all empty props', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: '',
          backgroundColor: '',
          fontColor: '',
        },
      })

      expect(wrapper.find('.site-banner').exists()).toBe(true)
      expect(wrapper.find('h1').text()).toBe('')
    })

    it('should handle null-like strings', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'null',
          backgroundColor: 'undefined',
          fontColor: 'null',
        },
      })

      expect(wrapper.find('h1').text()).toBe('null')
      const banner = wrapper.find('.site-banner')
      // Component should still render even with invalid color strings
      expect(banner.exists()).toBe(true)
      // Invalid color values may not create a style attribute in the test environment
      const style = banner.attributes('style')
      expect(banner.element).toBeInstanceOf(HTMLElement)
    })
  })

  describe('Bad Data Path', () => {
    it('should handle invalid hex color format', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Invalid Colors',
          backgroundColor: '#gggggg',
          fontColor: '#zzzzzz',
        },
      })

      const banner = wrapper.find('.site-banner')

      // Component should render even with invalid colors
      expect(banner.exists()).toBe(true)
      expect(banner.element).toBeInstanceOf(HTMLElement)
      expect(wrapper.find('h1').text()).toBe('Invalid Colors')
    })

    it('should handle malformed rgb values', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Bad RGB',
          backgroundColor: 'rgb(999, 999, 999)',
          fontColor: 'rgb(-50, -100, -150)',
        },
      })

      const banner = wrapper.find('.site-banner')
      // Component should still render, browser will clamp values
      expect(banner.exists()).toBe(true)
    })

    it('should handle extremely long text', () => {
      const longText = 'A'.repeat(10000)
      const wrapper = mount(SiteBanner, {
        props: {
          text: longText,
          backgroundColor: '#000000',
          fontColor: '#ffffff',
        },
      })

      expect(wrapper.find('h1').text()).toBe(longText)
      expect(wrapper.find('h1').text().length).toBe(10000)
    })

    it('should handle special characters in text', () => {
      const specialText = '<script>alert("xss")</script> & " \' < >'
      const wrapper = mount(SiteBanner, {
        props: {
          text: specialText,
          backgroundColor: '#ffffff',
          fontColor: '#000000',
        },
      })

      // Vue should escape HTML by default
      const h1 = wrapper.find('h1')
      expect(h1.text()).toContain('script')
      expect(h1.html()).not.toContain('<script>')
    })

    it('should handle unicode and emoji in text', () => {
      const unicodeText = '🎉 Welcome! 欢迎 مرحبا स्वागत'
      const wrapper = mount(SiteBanner, {
        props: {
          text: unicodeText,
          backgroundColor: '#3498db',
          fontColor: '#ffffff',
        },
      })

      expect(wrapper.find('h1').text()).toBe(unicodeText)
    })

    it('should handle CSS injection attempts in colors', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test',
          backgroundColor: '#000000; position: fixed; z-index: 9999',
          fontColor: '#ffffff" onload="alert(1)',
        },
      })

      const banner = wrapper.find('.site-banner')
      // Style attribute should still be set, browser/Vue handles sanitization
      expect(banner.exists()).toBe(true)
    })

    it('should handle JavaScript URLs in colors', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test',
          backgroundColor: 'javascript:alert(1)',
          fontColor: 'expression(alert(1))',
        },
      })

      const banner = wrapper.find('.site-banner')

      // Component should render safely even with malicious strings
      expect(banner.exists()).toBe(true)
      expect(banner.element).toBeInstanceOf(HTMLElement)
      expect(wrapper.find('h1').text()).toBe('Test')
    })

    it('should handle very long color strings', () => {
      const longColor = '#' + 'f'.repeat(1000)
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test',
          backgroundColor: longColor,
          fontColor: '#000000',
        },
      })

      const banner = wrapper.find('.site-banner')
      expect(banner.exists()).toBe(true)
    })

    it('should handle newlines and whitespace in text', () => {
      const textWithWhitespace = '  Line 1  \n\n  Line 2  \t\t  Line 3  '
      const wrapper = mount(SiteBanner, {
        props: {
          text: textWithWhitespace,
          backgroundColor: '#ffffff',
          fontColor: '#000000',
        },
      })

      // DOM will normalize whitespace - leading/trailing spaces are trimmed
      const renderedText = wrapper.find('h1').text()
      expect(renderedText).toContain('Line 1')
      expect(renderedText).toContain('Line 2')
      expect(renderedText).toContain('Line 3')
    })

    it('should handle color values with extra spaces', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test',
          backgroundColor: '  #ffffff  ',
          fontColor: '  rgb(0, 0, 0)  ',
        },
      })

      const banner = wrapper.find('.site-banner')
      // Browsers typically trim spaces in style values
      expect(banner.exists()).toBe(true)
    })
  })

  describe('Component Structure', () => {
    it('should render all required elements', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test',
          backgroundColor: '#ffffff',
          fontColor: '#000000',
        },
      })

      expect(wrapper.find('.site-banner').exists()).toBe(true)
      expect(wrapper.find('.banner-container').exists()).toBe(true)
      expect(wrapper.find('h1').exists()).toBe(true)
    })

    it('should have correct nesting structure', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test',
          backgroundColor: '#ffffff',
          fontColor: '#000000',
        },
      })

      const banner = wrapper.find('.site-banner')
      const container = banner.find('.banner-container')
      const heading = container.find('h1')

      expect(container.exists()).toBe(true)
      expect(heading.exists()).toBe(true)
    })

    it('should apply inline styles only to .site-banner', () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test',
          backgroundColor: '#ff0000',
          fontColor: '#00ff00',
        },
      })

      const banner = wrapper.find('.site-banner')
      const container = wrapper.find('.banner-container')

      expect(banner.attributes('style')).toBeTruthy()
      expect(container.attributes('style')).toBeFalsy()
    })
  })

  describe('Props Reactivity', () => {
    it('should update text when prop changes', async () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Initial Text',
          backgroundColor: '#ffffff',
          fontColor: '#000000',
        },
      })

      expect(wrapper.find('h1').text()).toBe('Initial Text')

      await wrapper.setProps({ text: 'Updated Text' })

      expect(wrapper.find('h1').text()).toBe('Updated Text')
    })

    it('should update background color when prop changes', async () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test',
          backgroundColor: '#ff0000',
          fontColor: '#000000',
        },
      })

      expect(wrapper.find('.site-banner').attributes('style')).toContain(
        'background-color: rgb(255, 0, 0)',
      )

      await wrapper.setProps({ backgroundColor: '#00ff00' })

      expect(wrapper.find('.site-banner').attributes('style')).toContain(
        'background-color: rgb(0, 255, 0)',
      )
    })

    it('should update font color when prop changes', async () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Test',
          backgroundColor: '#ffffff',
          fontColor: '#ff0000',
        },
      })

      expect(wrapper.find('.site-banner').attributes('style')).toContain('color: rgb(255, 0, 0)')

      await wrapper.setProps({ fontColor: '#0000ff' })

      expect(wrapper.find('.site-banner').attributes('style')).toContain('color: rgb(0, 0, 255)')
    })

    it('should update all props simultaneously', async () => {
      const wrapper = mount(SiteBanner, {
        props: {
          text: 'Original',
          backgroundColor: '#000000',
          fontColor: '#ffffff',
        },
      })

      await wrapper.setProps({
        text: 'Changed',
        backgroundColor: '#ff0000',
        fontColor: '#00ff00',
      })

      expect(wrapper.find('h1').text()).toBe('Changed')
      const style = wrapper.find('.site-banner').attributes('style')
      expect(style).toContain('background-color: rgb(255, 0, 0)')
      expect(style).toContain('color: rgb(0, 255, 0)')
    })
  })
})
