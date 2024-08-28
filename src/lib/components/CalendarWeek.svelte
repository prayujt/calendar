<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  import CalendarWeekEvent from './CalendarWeekEvent.svelte';

  import type { Event, EventPosition } from '$lib/types';
  import { compareDates, getTimeString, getCurrentHour, getMinuteFraction } from '$lib/utils';

  let dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  let hours: string[] = [];
  let weekDates: { day: string; date: Date }[] = [];

  let currentDay = '';
  let currentTime: Date = new Date();
  let weekStart: Date = new Date();

  let includeNextMonth = false;
  let dateOffset = 0;

  let morningElement: HTMLElement;
  let gridDiv: HTMLElement;

  let calendarMounted = false;

  let refs: { [day: string]: { [hour: string]: HTMLElement } } = {
    SUN: {},
    MON: {},
    TUE: {},
    WED: {},
    THU: {},
    FRI: {},
    SAT: {}
  };

  let barYPosition = -1;
  let barWidth = -1;

  let events = [
    {
      id: '1',
      date: new Date('2024-08-29T22:30:00'),
      title: 'Call with Sofia',
      description: 'Discuss the new project',
      duration: 120,
      accepted: true
    } as Event,
    {
      id: '2',
      date: new Date('2024-08-29T13:55:00'),
      title: 'Computer Network Fundamentals',
      description: 'Discuss the new project',
      duration: 120,
      accepted: false
    } as Event,
    {
      id: '3',
      date: new Date('2024-08-30T21:00:00'),
      title: 'Meet with Maalav',
      description: 'Discuss the new project',
      duration: 120,
      accepted: true
    } as Event
  ]

  let eventPositions = new Map<string, EventPosition>();

  onMount(() => {
      getWeekDates();
      let tempHours: string[] = ['12 AM'];
      for (let i = 1; i < 12; i++) {
          tempHours.push(`${i} AM`);
      }
      tempHours.push('12 PM');
      for (let i = 1; i < 12; i++) {
          tempHours.push(`${i} PM`);
      }
      hours = tempHours;
      currentTime = new Date();

      window.addEventListener('resize', updatePositions);

      setInterval(() => {
          currentTime = new Date();
      }, 60000);
  });

  onDestroy(() => {
      typeof window !== 'undefined' && window.removeEventListener('resize', updatePositions);
  });

 /**
  * Scrolls to a specific time on the calendar
  * If the time is between 8 AM and 6 PM, it scrolls to have 8 AM at the top
  * If the time is before 8 AM, it scrolls to have 12 AM at the top
  * If the time is after 6 PM, it scrolls to display the time, which is effectively scrolling to the bottom
  */
  const scrollToStart = (): void => {
      if (!currentDay) return;
      const hour = getCurrentHour();
      if (hour < 8) refs[currentDay]['12 AM'].scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (hour >= 18) refs[currentDay]['8 PM'].scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (morningElement) morningElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /**
   * Sets the weekDates array with the dates of the week
   * The values are offset by dateOffset from today's date
   */
  const getWeekDates = (): void => {
    includeNextMonth = false;
    const today = new Date();
    const day = today.getDay();
    today.setDate(today.getDate() + dateOffset);

    const tempWeekStart = new Date(today);
    tempWeekStart.setDate(today.getDate() - day);
    weekStart = tempWeekStart;

    const tempWeekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      if (date.getMonth() !== weekStart.getMonth()) {
        includeNextMonth = true;
      }

      tempWeekDates.push({
        day: dayNames[date.getDay()],
        date
      });

      if (i === day) {
        currentDay = dayNames[date.getDay()];
      }
    }

    weekDates = [...tempWeekDates];
  }

  /**
   * Updates the positions of the current time bar and the events on the calendar
   * Triggers when the window is resized or scrolled
   */
  const updatePositions = (): void => {
      if (calendarMounted) {
          generateEventPositions();
          const rect = refs[currentDay][getTimeString(false)].getBoundingClientRect();
          barYPosition = (rect.y + getMinuteFraction() * rect.height);
          const leftEdge = refs['SUN']['12 AM'].getBoundingClientRect().left;
          const rightEdge = refs['SAT']['12 AM'].getBoundingClientRect().right;
          barWidth = rightEdge - leftEdge + 25;
      }
  }

  /**
   * Changes the week displayed on the calendar
   * @param next - true if the next week should be displayed, false if the previous week should be displayed
   */
  const changeWeek = (next: boolean): void => {
      if (!weekDates.length) return;
      dateOffset += next ? 7 : -7;
      getWeekDates();
  }

  /**
   * Checks if all the calendar elements have been mounted
   * @returns true if all the calendar elements have been attached to the refs object, false otherwise
   */
  const checkCalendarMounted = (): boolean => {
      let count = 0;
      for (const outerKey in refs) {
          if (refs.hasOwnProperty(outerKey)) {
              count += Object.keys(refs[outerKey]).length;
          }
      }
      return count === 7 * 24;
  }

  /**
   * Generates the positions of the events on the calendar
   */
  const generateEventPositions = (): void => {
      const newEventPositions = new Map<string, EventPosition>();
      for (const event of events) {
          const dayName = dayNames[event.date.getDay()];
          if (!refs[dayName] || !refs[dayName][getTimeString(false, event.date)]) {
            newEventPositions.set(event.id, { top: 0, left: 0, height: 0, width: 0 });
            return;
          }

          const rect = refs[dayName][getTimeString(false, event.date)].getBoundingClientRect();
          const top = rect.y + getMinuteFraction(event.date) * rect.height;
          const left = rect.x;
          const height = event.duration / 60 * rect.height;
          const width = rect.width;

          newEventPositions.set(event.id, { top, left, height, width });
      }
      eventPositions = newEventPositions;
  }

  $: morningElement, scrollToStart();
  $: refs, currentTime, updatePositions();
  $: refs, calendarMounted = checkCalendarMounted();
  $: refs, generateEventPositions();
</script>

<div
    class="fixed top-14 right-2 cursor-pointer rounded-full bg-white shadow-md pl-3 p-2 transition-colors hover:bg-gray-100"
    on:click={() => changeWeek(true)}
>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
        <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
</div>

{#if gridDiv && barYPosition > gridDiv.getBoundingClientRect().top}
    <div
        class="ml-[22rem] fixed rounded-full h-0.5 bg-blue-500 text-white"
        style="top: {barYPosition}px; width: {barWidth}px;">
    </div>
{/if}

{#if calendarMounted}
    {#each events as event}
        {#if eventPositions.has(event.id) && event.date >= weekStart && event.date < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)}
            <CalendarWeekEvent {event} position={eventPositions.get(event.id)}/>
        {/if}
    {/each}
{/if}

<div class="ml-72 mr-4 flex flex-col h-screen">
    {#if weekStart.getMonth() && weekStart.getFullYear()}
        <div class="text-center text-2xl text-gray-800 mr-2 my-2">
            {includeNextMonth ? `${monthNames[weekStart.getMonth()]} - ${monthNames[(weekStart.getMonth() + 1) % 12]}` : monthNames[weekStart.getMonth()] } {weekStart.getFullYear()}
        </div>
    {/if}
    <div class="flex items-center">
        <div
            class="ml-8 mb-4 cursor-pointer rounded-full bg-white shadow-md pr-3 p-2 transition-colors hover:bg-gray-100"
            on:click={() => changeWeek(false)}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
        </div>

        <div class="mb-2 grid grid-cols-7 w-full">
            {#each weekDates as weekDate}
                <div class="py-2 flex flex-col items-center">
                    <div class={`text-sm ${compareDates(weekDate.date, new Date()) && 'text-blue-700'}`}>{weekDate.day}</div>
                    <div class={`mt-1 text-2xl text-center ${compareDates(weekDate.date, new Date()) ? 'w-14 text-white rounded-full bg-blue-500 text-white' : ''}`}>
                        {weekDate.date.getDate()}
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="flex-1 overflow-auto" bind:this={gridDiv} on:scroll={updatePositions}>
        {#each hours as hour}
            <div class="flex">
                {#if hour === '8 AM'}
                  <div class="text-xs text-gray-600 -mt-1 mr-2 ml-2 w-16 text-center" bind:this={morningElement}>
                      {hour}
                  </div>
                {:else}
                  <div class="text-xs text-gray-600 -mt-1 mr-2 ml-2 w-16 text-center">
                      {hour}
                  </div>
                {/if}

                {#each dayNames as dayName}
                    <div
                        class="hour-card flex-1 p-2 border-t border-l border-gray-200 bg-white hover:bg-gray-100 transition-colors cursor-pointer"
                        bind:this={refs[dayName][hour]}
                    >
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>

<style>
    .hour-card {
        min-height: 75px;
        max-height: 100px;
    }
</style>
