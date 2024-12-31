export interface User {
    publicId: string;
    username: string;
}

export interface Message {
    from: string;
    to: string;
    message: string;
    // username: string;
    timestamp: number;
}
