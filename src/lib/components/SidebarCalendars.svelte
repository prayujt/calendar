<script lang="ts">
  import { getCalendarsArray } from '$lib/utils';
  import { calendars, selectedCalendar, selectedCalendars, showCalendarDetails } from '$lib/stores';
  import type { Calendar } from '$lib/types';

  import CalendarInformation from './CalendarInformation.svelte';

  let calendarsArr = getCalendarsArray();

  const toggleCalendar = (id: string) => {
      const tempSelected = new Set($selectedCalendars);
      if (tempSelected.has(id)) tempSelected.delete(id);
      else tempSelected.add(id);
      selectedCalendars.set(tempSelected);
  };

  const selectCalendar = (calendar: Calendar) => {
      selectedCalendar.set(calendar);
      showCalendarDetails.set(true);
  };

  $: $calendars, selectedCalendars.set(new Set<string>([
      ...$calendars.keys(),
  ]));

  $: $calendars, calendarsArr = getCalendarsArray();
</script>

<div class="flex flex-col">
    {#each calendarsArr as calendar}
        <div class="flex mb-2 items-center cursor-pointer w-min">
            <input
              tabindex="0"
              type="checkbox"
              on:click={() => toggleCalendar(calendar.id)}
              checked={$selectedCalendars.has(calendar.id)}
              class="cursor-pointer w-4 h-4 border-gray-300 rounded text-white"
              style={`accent-color: ${calendar.color};`}/>

            <div on:click={() => selectCalendar(calendar)}>
                <p class="ms-2 text-sm font-medium text-gray-900">
                    {calendar.name}
                </p>
            </div>
        </div>
    {/each}
</div>

{#if $showCalendarDetails}
    <CalendarInformation />
{/if}
