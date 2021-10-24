import type { Timestamp } from "firebase/firestore";

export type Messages = {
    message: string,
    uid: string,
    timestamp: Timestamp
}
export type UserCalender = {
    date: string,
    time: string,
    state: number,
    room: string,
    locate: { lat: string, lng: string }
}
export type Pair = {
    uid: string,
    state: number,
    displayName: string,
    photoURL: string,
    tag: string[]
}
export type User = {
    uid: string,
    email: string,
    emailVerified: boolean,
    displayName: string,
    locate: { lat: string, lng: string },
    photoURL: string,
    tag: string[]
}

export type AccountDetail = {
    displayName: string,
    locate: { lat: string, lng: string },
    tag: string[]
}
export type latLng = { lat: string, lng: string }

export type RoomMember = { uid: string, state: number }

export function compare(a: Messages, b: Messages) {
    if (a.timestamp.nanoseconds > b.timestamp.nanoseconds) {
        return 1;
    } else if (a.timestamp.nanoseconds < b.timestamp.nanoseconds) {
        return -1;
    } else {
        return 0;
    }
}


