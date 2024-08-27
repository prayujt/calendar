<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  let hours: string[] = [];
  let weekDates: { day: string; date: number }[] = [];
  let currentDay = '';
  let currentTime = '';

  let morningElement: HTMLElement;
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
      for (let i = 1; i < 12; i++) {
          tempHours.push(`${i} PM`);
      }
      hours = tempHours;

      currentTime = new Date().toLocaleTimeString();

      window.addEventListener('resize', updateCurrentTimeBar);

      onDestroy(() => {
          window.removeEventListener('resize', updateCurrentTimeBar);
      });

      setInterval(() => {
          currentTime = new Date().toLocaleTimeString();
      }, 60000);
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

  const getWeekDates = (inputDate = new Date()) => {
    const today = new Date(inputDate);
    const day = today.getDay();

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - day);

    const tempWeekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      tempWeekDates.push({
        day: dayNames[date.getDay()],
        date: date.getDate()
      });

      if (i === day) {
        currentDay = dayNames[date.getDay()];
      }
    }

    weekDates = [...tempWeekDates];
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

  $: morningElement, scrollToStart();

  $: refs, currentTime, updateCurrentTimeBar();
</script>

<div
    class="ml-[22rem] fixed rounded-full h-0.5 w-[calc(100%-22.5rem)] bg-blue-500 text-white overflow-auto"
    style="top: {barYPosition}px; width: {barWidth}px;">
</div>

<div class="ml-72 mr-4 flex flex-col h-screen">
    <div class="ml-20 mb-2 grid grid-cols-7">
        {#each weekDates as weekDate}
            <div class="py-2 flex flex-col items-center">
                <div class={`text-sm ${weekDate.day === currentDay && 'text-blue-700'}`}>{weekDate.day}</div>
                <div class={`mt-1 text-2xl text-center ${weekDate.day === currentDay ? 'w-14 text-white rounded-full bg-blue-500 text-white' : ''}`}>
                    {weekDate.date}
                </div>
            </div>
        {/each}
    </div>

    <div class="flex-1 overflow-auto" on:scroll={updateCurrentTimeBar}>
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
