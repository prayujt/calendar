<script lang="ts">
  import { onMount } from 'svelte';

  let dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  let hours: string[] = [];
  let weekDates: { day: string; date: number }[] = [];
  let currentDay = '';
  let currentTime = '';

  let scrollTopElement: HTMLElement;
  let refs: { [day: string]: { [hour: string]: HTMLElement } } = {};

  const scrollToStart = () => {
    if (scrollTopElement)
      scrollTopElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
  });

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
    currentTime = today.toLocaleTimeString();
    console.log(currentTime)
  }

  $: scrollTopElement, scrollToStart();
</script>

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

    <div class="flex-1 overflow-auto">
        {#each hours as hour}
            <div class="flex">
                {#if hour === '8 AM'}
                  <div class="text-xs text-gray-600 -mt-1 mr-2 ml-2 w-16 text-center" bind:this={scrollTopElement}>
                      {hour}
                  </div>
                {:else}
                  <div class="text-xs text-gray-600 -mt-1 mr-2 ml-2 w-16 text-center">
                      {hour}
                  </div>
                {/if}

                {#each dayNames as _}
                    <div
                        class="hour-card flex-1 p-2 border-t border-l border-gray-200 bg-white hover:bg-gray-100 transition-colors cursor-pointer"
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
