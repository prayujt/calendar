export interface IdpUser {
    identity: {
        id: string;
        traits: {
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
    };
}

export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string;
}

export interface Calendar {
    id: string;
    name: string;
    color: string;
    isDefault: boolean;
}

export interface Event {
    id: string;
    calendarId: string;
    date: Date;
    title: string;
    description: string;
    duration: number;
    recurrenceId?: string;
    recurring?: boolean;
}

export interface EventPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

export enum TaskPriority {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2,
}

export interface Task {
    id: string;
    userId: string;
    calendarId: string;
    title: string;
    description: string;
    duration?: number;
    deadline: Date;
    difficulty: number;
    priority: TaskPriority;
    completed: boolean;
}
