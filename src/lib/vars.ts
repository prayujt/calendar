export const VITE_ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT;

export const API_HOST =
    VITE_ENVIRONMENT === "development"
        ? "http://localhost:8080"
        : "https://api.calendar.prayujt.com";
