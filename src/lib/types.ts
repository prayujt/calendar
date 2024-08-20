export interface IdpUser {
    identity: {
        id: string;
        traits: {
            email: string;
            username: string;
            firstName: string;
            lastName: string;
        };
    };
}

export interface User {
    id: string;
    name: string;
    email: string;
}
