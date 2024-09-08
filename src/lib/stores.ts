import { writable } from "svelte/store";
import type { User } from "./types";

export const commandMenuOpen = writable(false);

export const userInfo = writable<User>({});

export const calendars = writable<Calendar[]>([]);
export const events = writable<Event[]>([]);

export const outsideClick = writable(false);
export const showEventDetails = writable(false);
export const selectedEvent = writable<Event>(undefined);
export const selectedPosition = writable<EventPosition>(undefined);
