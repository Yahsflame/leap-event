<template>
  <div class="event-calendar">
    <span class="calendar-banner" />
    <div class="calendar-time">
      <span class="calendar-month">{{ formatCalendarDate(date).month }}</span>
      <span class="calendar-date">{{ formatCalendarDate(date).day }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCalendarDate } from '@/utilities/useTime'

defineProps<{ date: string }>()
</script>

<style scoped>
.event-calendar {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  width: 5.938rem;
  height: fit-content;
  margin-top: 1rem;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  box-shadow:
    0px 4px 8px -2px var(--color-shadow-primary),
    0px 2px 4px -2px var(--color-shadow-secondary);
  border-radius: 0.5rem;
}
.calendar-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.6875rem 0.5rem 1.25rem;
}
.calendar-banner {
  width: 6rem;
  height: 0.375rem;
  background: var(--color-accent);
}
.calendar-month {
  font-family: 'Red Hat Text';
  font-size: 0.8rem;
  font-weight: 700;
}
.calendar-date {
  font-family: 'Red Hat Display';
  font-size: 2rem;
  font-weight: 900;
}

@media screen and (max-width: 991px) {
  .event-calendar {
    position: absolute;
    top: 0.688rem;
    left: 0.813rem;
    margin-top: 0;
  }
}
</style>
