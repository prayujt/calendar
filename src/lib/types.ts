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

export interface Event {
    id: string;
    date: Date;
    title: string;
    description: string;
    duration: number;
    accepted: boolean;
}

export interface EventPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}
