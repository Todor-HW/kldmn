import { adjectives, usernames } from "../data";

export function generateRandomUsername() {
    const firstWord = adjectives[Math.floor(Math.random() * usernames.length)];
    const secondWord = usernames[Math.floor(Math.random() * usernames.length)];

    const firstUpper = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
    const secondUpper = secondWord.charAt(0).toUpperCase() + secondWord.slice(1);

    const username = firstUpper + secondUpper;
    return username;
}