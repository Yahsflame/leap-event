/**
 * Formats a date string into a readable format to match design system requirements
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

/**
 * Extracts the day of month and the three letter month from a date string
 */
export const formatCalendarDate = (dateString: string): { month: string; day: string } => {
  const date = new Date(dateString)
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const day = date.getDate().toString()
  return { month, day }
}
