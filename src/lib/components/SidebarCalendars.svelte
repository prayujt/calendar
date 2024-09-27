<script lang="ts">
  import { toast } from "svelte-sonner";

  import Button from '$lib/scn-components/ui/button/button.svelte';
  import * as HoverCard from "$lib/scn-components/ui/hover-card";

  import { getCalendarsArray } from '$lib/utils';
  import { calendars, selectedCalendars } from '$lib/stores';
  import { API_HOST } from '$lib/vars';

  let calendarNames: Record<string, string> = {};
  let calendarColors: Record<string, string> = {};

  let calendarsArr = getCalendarsArray();

  const syncCalendars = async () => {
      calendarsArr = getCalendarsArray();
      for (const calendar of calendarsArr) {
        calendarNames[calendar.id] = calendar.name;
        calendarColors[calendar.id] = calendar.color;
      }
  };

  const toggleCalendar = (id: string) => {
      const tempSelected = new Set($selectedCalendars);
      if (tempSelected.has(id)) tempSelected.delete(id);
      else tempSelected.add(id);
      selectedCalendars.set(tempSelected);
  };

  const updateCalendar = async (calendarId: string) => {
      const calendarResponse = await fetch(`${API_HOST}/calendars/${calendarId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: calendarNames[calendarId],
          color: calendarColors[calendarId],
        }),
      });
      let calendarJson = await calendarResponse.json();
      if (!calendarResponse.ok) {
        toast.error("Failed to update calendar", {
          description: calendarJson.name,
        });
        return
      }
      const tempCalendars = $calendars;
      tempCalendars.set(calendarId, {
          ...tempCalendars.get(calendarId),
          name: calendarJson.name,
          color: calendarJson.color,
      });
      calendars.set(tempCalendars);
      toast.success("Calendar updated", {
          description: calendarJson.name,
      });
  };

  $: $calendars, selectedCalendars.set(new Set<string>([
      ...$calendars.keys(),
  ]));

  $: $calendars, syncCalendars();
</script>

<div>
    {#each calendarsArr as calendar}
        <HoverCard.Root>
            <HoverCard.Trigger>
                <div class="flex mb-2 items-center cursor-pointer w-min">
                    <input
                      tabindex="0"
                      type="checkbox"
                      on:click={() => toggleCalendar(calendar.id)}
                      checked={$selectedCalendars.has(calendar.id)}
                      class="cursor-pointer w-4 h-4 border-gray-300 rounded text-white"
                      style={`accent-color: ${calendar.color};`}/>
                    <button on:click={() => toggleCalendar(calendar.id)}>
                        <p class="ms-2 text-sm font-medium text-gray-900">
                            {calendar.name}
                        </p>
                    </button>
                </div>
            </HoverCard.Trigger>
            <HoverCard.Content>
                <div class="flex flex-col gap-2">
                    <div class="flex flex-col justify-center">
                        <p class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</p>
                        <input
                          type="text"
                          class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                          bind:value={calendarNames[calendar.id]}
                        />
                    </div>
                    <div class="flex flex-col justify-center">
                        <p class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Color</p>
                        <input
                          type="text"
                          class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                          bind:value={calendarColors[calendar.id]}
                        />
                    </div>

                    <Button on:click={() => updateCalendar(calendar.id)}>
                        Save
                    </Button>
                </div>
            </HoverCard.Content>
        </HoverCard.Root>
    {/each}
</div>
