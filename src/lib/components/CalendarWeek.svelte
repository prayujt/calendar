<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  import CalendarWeekEvent from './CalendarWeekEvent.svelte';
  import EventDetailPopup from './EventDetailPopup.svelte';

  import type { Calendar, Event, EventPosition } from '$lib/types';
  import { calendars, editingEventDetails, events, eventPositions, gridItemHeight, gridItemWidth, selectedCalendars, showEventDetails } from '$lib/stores';
  import { clickOutside, compareDates, convertToEvent, getTimeString, getCurrentHour, getMinuteFraction } from '$lib/utils';
  import { API_HOST, VITE_ENVIRONMENT } from '$lib/vars';


  let dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
    Sun: {},
    Mon: {},
    Tue: {},
    Wed: {},
    Thu: {},
    Fri: {},
    Sat: {}
  };

  let barYPosition = -1;
  let barWidth = -1;

  onMount(async () => {
      try {
          const calendarResponse = await fetch(`${API_HOST}/calendars`, {
            credentials: 'include',
          });
          let calendarJson = await calendarResponse.json();

          if (calendarJson.length === 0 && VITE_ENVIRONMENT !== 'development') {
            const createCalendarResponse = await fetch(`${API_HOST}/calendars`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                name: 'Personal',
                color: '#93c4fd',
                isDefault: true
              }),
            });
            const newCalendar = await createCalendarResponse.json();
            calendarJson = [newCalendar];
          }
          const calendarMap = new Map<string, any>();
          // index the calendars by id
          calendars.set(
              calendarJson.reduce((acc: Map<string, Calendar>, calendar: Calendar) => {
                acc.set(calendar.id, calendar);
                return acc;
              }, calendarMap)
          );

          const eventResponse  = await fetch(`${API_HOST}/events`, {
            credentials: 'include',
          })
          const eventsJson = await eventResponse.json();
          events.set(eventsJson.map((eventJson: any) => convertToEvent(eventJson)));
      } catch (error) {
          console.error('Error fetching events', error);
      }

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

      calendarMounted = checkCalendarMounted();
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
    tempWeekStart.setHours(0, 0, 0, 0);
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
          gridItemHeight.set(refs['Sun']['12 AM'].getBoundingClientRect().height);
          gridItemWidth.set(refs['Sun']['12 AM'].getBoundingClientRect().width);
          generateEventPositions();
          const rect = refs[currentDay][getTimeString(false)].getBoundingClientRect();
          barYPosition = (rect.y + getMinuteFraction() * rect.height);
          const leftEdge = refs['Sun']['12 AM'].getBoundingClientRect().left;
          const rightEdge = refs['Sat']['12 AM'].getBoundingClientRect().right;
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
    const eventSlots = new Map<string, Event[]>();

    for (const event of $events) {
        const dayName = dayNames[event.date.getDay()];
        if (!refs[dayName] || !refs[dayName][getTimeString(false, event.date)]) {
            newEventPositions.set(event.id, { top: 0, left: 0, height: 0, width: 0 });
            continue;
        }

        const timeSlotKey = `${dayName}-${event.date.getTime()}`;
        if (!eventSlots.has(timeSlotKey)) {
            eventSlots.set(timeSlotKey, []);
        }
        eventSlots.get(timeSlotKey)!.push(event);
    }

    for (const [timeSlotKey, eventsInSlot] of eventSlots) {
        const dayName = timeSlotKey.split('-')[0];
        const events = eventsInSlot;
        const rect = refs[dayName][getTimeString(false, new Date(parseInt(timeSlotKey.split('-')[1])))]?.getBoundingClientRect();

        if (!rect) continue;

        events.sort((a, b) => (b.duration - a.duration));

        const numEvents = events.length;
        // subtracting 2 to allow for 1 px left and right
        const width = (rect.width - 2) / numEvents;
        const baseLeft = rect.x;

        // need to fix calculation here to only take away from left and right most events
        for (let i = 0; i < numEvents; i++) {
            const event = events[i];
            const left = baseLeft + i * width + (1 / numEvents);
            const top = rect.y + getMinuteFraction(event.date) * rect.height;
            const height = (event.duration / 60) * rect.height;

            newEventPositions.set(event.id, { top, left, height, width });
        }
    }

    eventPositions.set(newEventPositions);
  };

  /**
   * Scrolls the gridDiv element by the deltaY value of the event
   * @param event - the wheel event
   */
  const scrollFixedElement = (event: WheelEvent): void => {
      event.preventDefault();
      const delta = event.deltaY || event.wheelDeltaY || event.detail;

      if (!$showEventDetails) gridDiv.scrollBy({ top: delta });
  }

  $: morningElement, scrollToStart();
  $: refs, currentTime, calendarMounted, $events, updatePositions();
  $: refs, calendarMounted = checkCalendarMounted();
  $: refs, gridDiv, generateEventPositions();
</script>

{#if gridDiv && barYPosition > gridDiv.getBoundingClientRect().top}
    <div
        class="ml-[4rem] fixed rounded-full h-0.5 bg-blue-500 text-white"
        style="top: {barYPosition}px; width: {barWidth}px;"
        on:wheel={(e) => e.preventDefault()}
    >
    </div>
{/if}

{#if calendarMounted}
    {#each $events as event}
        {#if $selectedCalendars.has(event.calendarId) && $eventPositions.has(event.id) && event.date >= weekStart && event.date < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)}
          <div class="overflow-y-auto" on:wheel={scrollFixedElement}>
            <CalendarWeekEvent {event} position={$eventPositions.get(event.id)}/>
          </div>
        {/if}
    {/each}
{/if}

<div class="flex flex-col h-screen">
    <div
      class="select-none z-40 bg-white"
      on:wheel={(e) => e.preventDefault()}>
        <div class="flex items-center">
            <div
              class="mt-2 ml-8 cursor-pointer rounded-full bg-white shadow-md pr-3 p-2 transition-colors hover:bg-gray-100"
              on:click={() => changeWeek(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </div>
            {#if weekStart.getMonth() && weekStart.getFullYear()}
                <div class="grow text-2xl text-gray-800 mr-2 my-2">
                    <div class="flex items-center justify-center">
                        <p class="font-bold mr-2">
                            {monthNames[weekStart.getMonth()]} {includeNextMonth ? `- ${monthNames[(weekStart.getMonth() + 1) % 12]}` : ''}
                        </p>
                        <p>
                            {weekStart.getFullYear()}
                        </p>
                    </div>
                </div>
            {/if}

            <div
                class="mt-2 mr-8 cursor-pointer rounded-full bg-white shadow-md pl-3 p-2 transition-colors hover:bg-gray-100"
                on:click={() => changeWeek(true)}
                on:wheel={(e) => e.preventDefault()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </div>

        </div>

        <div class="ml-20 mb-2 flex">
            {#each weekDates as weekDate}
                <div class="py-2 flex justify-center items-center w-full">
                    <div class={`text-sm ${compareDates(weekDate.date, new Date()) && 'text-blue-700'}`}>{weekDate.day}</div>
                    <div class={`ml-3 text-xl text-center ${compareDates(weekDate.date, new Date()) ? 'w-14 text-white rounded-full bg-blue-500 text-white' : ''}`}>
                        {weekDate.date.getDate()}
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class={`no-scrollbar flex-1 overscroll-none ${$showEventDetails ? 'overflow-hidden' : 'overflow-auto'}`} bind:this={gridDiv} on:scroll={updatePositions}>
        {#each hours as hour}
            <div class="flex">
                {#if hour === '8 AM'}
                  <div class="text-xs text-gray-600 -mt-1 mr-2 ml-2 w-16 text-center select-none" bind:this={morningElement}>
                      {hour}
                  </div>
                {:else}
                  <div class="text-xs text-gray-600 -mt-1 mr-2 ml-2 w-16 text-center select-none">
                      {hour}
                  </div>
                {/if}

                {#each dayNames as dayName}
                    <div
                        class="hour-card flex-1 p-2 border-t border-l border-gray-200 bg-white hover:bg-gray-100 transition-colors"
                        bind:this={refs[dayName][hour]}
                    >
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>

{#if $showEventDetails}
    <div class="mr-72" use:clickOutside on:clickOutside={() => { showEventDetails.set(false); editingEventDetails.set(false); }}>
        <EventDetailPopup {gridDiv} />
    </div>
{/if}


<style>
    .hour-card {
        min-height: 50px;
        max-height: 75px;
    }
</style>
