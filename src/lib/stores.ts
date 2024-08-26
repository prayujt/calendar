import { writable } from "svelte/store";
import type { User } from "./types";

export const userInfo = writable<User>({});
