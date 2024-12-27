export interface User {
    userId: string;
    username: string;
}

export interface Message {
    userId: string;
    message: string;
    username: string;
    timestamp: number;
}
