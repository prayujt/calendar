import { get } from "svelte/store";

import { calendars, events } from "./stores";
import { API_HOST } from "./vars";

/**
 * Get the current hour
 */
export const getCurrentHour = (): number => new Date().getHours();

/**
 * Get the fraction of the current hour of the specified time
 */
export const getMinuteFraction = (time: Date = new Date()): number =>
    time.getMinutes() / 60;

/**
 * Get the current time as a string formatted (e.g. "3:30 PM")
 * @param includeMinutes Whether to include the minutes in the time string
 */
export const getTimeString = (
    includeMinutes: boolean = true,
    time: Date = new Date(),
): string => {
    const options: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        ...(includeMinutes ? { minute: "numeric" } : {}),
        hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(time);
};

/**
 * Get the current date as a string formatted (e.g. "Wednesday, September 1, 2021")
 */
export const getDateString = (date: Date = new Date()): string =>
    new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);

/**
 * Get the time range of the specified date and duration in the format "start - end"
 * @param startDate The start date of the time range
 * @param duration The duration of the time range in minutes
 * @returns The time range in the format "start - end", e.g. "3:30 PM - 4:30 PM"
 */
export const getTimeRange = (startDate: Date, duration: number): string => {
    const startTime = getTimeString(true, startDate);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
    const endTime = getTimeString(true, endDate);

    return `${startTime} - ${endTime}`;
};

/**
 * Compare two dates to see if they are the same
 */
export const compareDates = (date1: Date, date2: Date): boolean =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

/**
 * Converts an ISO string event payload to an Event object
 */
export const convertToEvent = (event: any): any => {
    return {
        ...event,
        date: new Date(event.date),
    };
};

/**
 * Utility function for creating a custom event listener that listens for clicks outside of a specified node
 */
export const clickOutside = (node) => {
    const handleClick = (event) => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(new CustomEvent("clickOutside", node));
        }
    };

    document.addEventListener("click", handleClick, true);

    return {
        destroy() {
            document.removeEventListener("click", handleClick, true);
        },
    };
};

/**
 * Utility function for creating an array from the calendars map
 * @returns An array of calendars with the personal calendar first
 */
export const getCalendarsArray = () => {
    return Array.from(get(calendars).values()).sort((a, b) =>
        a.name === "Personal" ? -1 : b.name === "Personal" ? 1 : 0,
    );
};

/**
 * Utility function for fetching all events and updating the events store
 */
export const fetchEvents = async () => {
    const newEvents = await fetch(`${API_HOST}/events`, {
        credentials: "include",
    });
    const eventsJson = await newEvents.json();
    events.set(eventsJson.map((eventJson: any) => convertToEvent(eventJson)));
};
