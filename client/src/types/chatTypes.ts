export interface User {
    publicId: string;
    username: string;
}

export interface Message {
    publicId: string;
    message: string;
    username: string;
    timestamp: number;
}
