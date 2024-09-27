<script lang="ts">
  import * as Select from "$lib/scn-components/ui/select";

  import { calendars } from "$lib/stores";
  import { getCalendarsArray } from "$lib/utils";

  export let selected: string | undefined;
  let selectedCalendar = {
    label: selected ? $calendars.get(selected).name : "Calendar",
    value: selected,
  };
</script>

<Select.Root
    selected={selectedCalendar}
    onSelectedChange={(s) => selected = s.value}>
    <Select.Trigger class="w-[180px]">
        <div class="flex items-center">
            {#if selected}
                <div
                  class="rounded-sm w-3 h-3 mr-2"
                  style="background-color: {$calendars.get(selected).color};">
                </div>
            {/if}
            <Select.Value placeholder="Calendar" />
        </div>
    </Select.Trigger>
    <Select.Content>
        {#each getCalendarsArray() as calendar (calendar.id)}
            <Select.Item value={calendar.id}>
                <div class="flex items-center">
                    <div
                      class="rounded-sm w-3 h-3"
                      style="background-color: {calendar.color};">
                    </div>
                    <div class="flex items-center">
                        <p class="text-sm ml-2">
                            {calendar.name}
                        </p>
                    </div>
                </div>
            </Select.Item>
        {/each}
    </Select.Content>
</Select.Root>
