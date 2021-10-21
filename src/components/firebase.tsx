import type { Messages, UserCalender } from "./type"
import { getApps, initializeApp } from "firebase/app"
import {
    getAuth, sendEmailVerification, signOut, updateProfile, browserSessionPersistence,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged
} from "firebase/auth";
import { Timestamp, writeBatch, onSnapshot, setDoc, getFirestore, collection, query, orderBy, startAt, endAt, where, limit, addDoc, getDocs, getDoc, doc } from "firebase/firestore";
import { async } from "@firebase/util";
import { zeroPadding, getDateRangeString, getDateTimeString } from "./time"

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
    databeseURL: process.env.REACT_APP_FIREBASE_DATABASE,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APPID,
};

const app = typeof window !== "undefined" && !getApps().length ? initializeApp(firebaseConfig) : getApps()[ 0 ];

export const auth = app ? getAuth(app) : getAuth(initializeApp(firebaseConfig));
export const db = getFirestore();
auth.setPersistence(browserSessionPersistence);


export const signUpAccount = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const sendEmail = await sendEmailVerification(user);
    const name = await updateProfile(user, { displayName: email });
}

export const signInAccount = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const id = await user.getIdToken();
}

export const signOutAccount = async () => {
    const result = await signOut(auth);
}

export const currentUser = () => {
    return auth.currentUser;
};

const timestamp = () => {
    return Timestamp.fromDate(new Date());
};

export const getRoom = async () => {
    const user = currentUser();
    if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().room
        } else {
            return undefined
        }
    } else {
        return undefined
    }
}

export const getMessage = async (room: string) => {
    const user = currentUser();
    if (user) {
        const colRef = collection(doc(collection(db, "rooms"), room), "messages");
        const q = query(colRef, orderBy("timestamp", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        var res: Messages[] = []
        querySnapshot.forEach((d) => {
            const data = d.data()
            res.push({ message: data.message, uid: data.uid, timestamp: data.timestamp })
        });

        return res;
    } else {
        return []
    }
}

export const sendMessage = async (room: string, message: string) => {
    const user = currentUser();
    if (user) {
        const colRef = collection(doc(collection(db, "rooms"), room), "messages");
        const result = await addDoc(colRef, {
            message: message,
            uid: user.uid,
            timestamp: timestamp()
        });
        console.log("send!", message);
    }
}

export const getCalender = async (date: Date) => {
    const user = currentUser();
    const dateTimeStr = getDateTimeString(date);
    const dateStr = dateTimeStr.date
    const timeStr = dateTimeStr.time

    if (user) {
        const docRef = doc(collection(doc(collection(db, "calender"), dateStr), timeStr), user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const res = docSnap.data()
            console.log("Document data:", docSnap.data());
            return res;
        } else {
            console.log("No such document!");
            return {}
        }
    } else {
        return {}
    }
}

export const getCalenderRange = async (dates: string[]) => {
    const user = currentUser();
    var data: UserCalender[] = []
    if (user) {
        const colRef = collection(doc(collection(db, "users"), user.uid), "calender");

        const q = query(colRef, orderBy("date"), startAt(dates[ 0 ]), endAt(dates[ dates.length - 1 ]));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((d) => {
            const temp = d.data();
            data.push({ date: temp.date, time: temp.time, state: Number(temp.state) ,room:temp.room?temp.room:""})
        });

        return data
    } else {
        return []
    }
}

export const setCalenderRange = async (data: UserCalender[]) => {
    const user = currentUser();
    const batch = writeBatch(db);

    if (user) {
        data.forEach(async (value: UserCalender, index: number) => {
            const docRef = doc(collection(doc(collection(db, "users"), user.uid), "calender"), value.date + value.time);
            batch.set(docRef, value, { merge: true })
            const docRefs = doc(collection(doc(collection(db, "calender"), value.date), value.time), user.uid);
            batch.set(docRefs, { state: value.state }, { merge: true })
        });
        await batch.commit();
        console.log("uploaded!", data.length)
    } else {
    }
}