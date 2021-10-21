import type { Timestamp } from "firebase/firestore";

export type Messages = { message: string, uid: string, timestamp: Timestamp }
export type UserCalender = { date: string,time: string, state: number,room:string }

export function compare(a: Messages, b: Messages) {
    if (a.timestamp.nanoseconds > b.timestamp.nanoseconds) {
        return 1;
    } else if (a.timestamp.nanoseconds < b.timestamp.nanoseconds) {
        return -1;
    } else {
        return 0;
    }
}
