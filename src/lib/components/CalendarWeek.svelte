<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  let hours: string[] = [];
  let weekDates: { day: string; date: Date }[] = [];

  let currentDay = '';
  let currentTime = '';
  let currentMonth = 0;
  let includeNextMonth = false;
  let currentYear = 0;
  let dateOffset = 0;

  let morningElement: HTMLElement;
  let gridDiv: HTMLElement;

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

      currentTime = new Date().toLocaleTimeString();

      window.addEventListener('resize', updateCurrentTimeBar);

      setInterval(() => {
          currentTime = new Date().toLocaleTimeString();
      }, 60000);
  });

  onDestroy(() => {
      typeof window !== 'undefined' && window.removeEventListener('resize', updateCurrentTimeBar);
  });

  const scrollToStart = () => {
      if (!currentDay) return;
      const hour = getCurrentHour();
      if (hour < 8) {
          refs[currentDay]['12 AM'].scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (hour >= 20) {
          refs[currentDay]['8 PM'].scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (morningElement) {
          morningElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  const getCurrentHour = () => new Date().getHours();
  const getHourString = () => currentTime.replace(currentTime.substring(currentTime.indexOf(':'), currentTime.indexOf(' ')), '');
  const getMinuteFraction = () => parseInt(currentTime.substring(currentTime.indexOf(':') + 1, currentTime.indexOf(':') + 3)) / 60;

  const getWeekDates = () => {
    includeNextMonth = false;
    const today = new Date();
    const day = today.getDay();
    today.setDate(today.getDate() + dateOffset);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - day);
    currentMonth = weekStart.getMonth();
    currentYear = weekStart.getFullYear();

    const tempWeekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      if (date.getMonth() !== currentMonth) {
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

  const compareDates = (date1: Date, date2: Date): boolean => {
    const month1 = date1.getMonth();
    const day1 = date1.getDate();
    const year1 = date1.getFullYear();

    const month2 = date2.getMonth();
    const day2 = date2.getDate();
    const year2 = date2.getFullYear();

    return month1 === month2 && day1 === day2 && year1 === year2;
}

  const updateCurrentTimeBar = () => {
      if (refs[currentDay] && refs[currentDay][getHourString()]) {
          const rect = refs[currentDay][getHourString()].getBoundingClientRect();
          barYPosition = (rect.y + getMinuteFraction() * rect.height);
          const leftEdge = refs['SUN']['12 AM'].getBoundingClientRect().left;
          const rightEdge = refs['SAT']['12 AM'].getBoundingClientRect().right;
          barWidth = rightEdge - leftEdge + 25;
      }
  }

  const changeWeek = (next: boolean) => {
      if (!weekDates.length) return;
      dateOffset += next ? 7 : -7;
      getWeekDates();
  }

  $: morningElement, scrollToStart();

  $: refs, currentTime, updateCurrentTimeBar();
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

<div class="ml-72 mr-4 flex flex-col h-screen">
    {#if currentMonth && currentYear}
        <div class="text-center text-2xl text-gray-800 mr-2 my-2">
            {includeNextMonth ? `${monthNames[currentMonth]} - ${monthNames[(currentMonth + 1) % 12]}` : monthNames[currentMonth] } {currentYear}
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

    <div class="flex-1 overflow-auto" bind:this={gridDiv} on:scroll={updateCurrentTimeBar}>
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
