import type { Messages, UserCalender, Pair, RoomMember, User, AccountDetail, latLng } from "./type"
import { getApps, initializeApp } from "firebase/app"
import {
    getAuth, sendEmailVerification, signOut, updateProfile, browserSessionPersistence,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged
} from "firebase/auth";
import { Timestamp, writeBatch, onSnapshot, setDoc, getFirestore, arrayUnion, arrayRemove, updateDoc, collection, query, orderBy, startAt, endAt, where, limit, addDoc, getDocs, getDoc, doc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage"
import { async } from "@firebase/util";
import { zeroPadding, getDateRangeString, getDateTimeString } from "./time"
import { openNotification } from "../notification";

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
const storage = getStorage();

auth.setPersistence(browserSessionPersistence);

export const getImg = async () => {
    const user = await getUserDetail(undefined);
    if (user && user.photoURL) {
        const path = "gs://" + process.env.REACT_APP_FIREBASE_STORAGE_BUCKET + "/users/" + user.uid + "/" + user.photoURL
        const photoRef = ref(storage, path);
        const photoURL = await getDownloadURL(photoRef);
        return photoURL
    } else {
        return ""
    }
}

export const setUserState = async (room: string, state: boolean) => {
    const user = currentUser();
    if (user && room && room !== undefined && room !== "") {
        const docRef = doc(collection(db, "rooms"), room);
        await updateDoc(docRef, {
            members: arrayRemove({ state: 0, uid: user.uid })
        });

        await updateDoc(docRef, {
            members: arrayUnion({ state: state === true ? 1 : -1, uid: user.uid })
        });
        console.log("upload!", state);
    } else {
    }

}

export const getUserState = async (room: string) => {
    const user = currentUser();
    if (user && room && room !== undefined && room !== "") {
        const docRef = doc(collection(db, "rooms"), room);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const members = data.members;
            const uids = members.filter((item: { uid: string, state: number }) => { if (item.uid === user.uid) return true; });
            if (uids.length > 0) return uids[ 0 ].state;
            else return undefined
        } else {
            return undefined
        }
    } else {
        return undefined
    }
}

const getPairLocate = async (room: string) => {
    const user = currentUser();
    if (user && room && room !== undefined && room !== "") {
        const docRef = doc(collection(db, "rooms"), room);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const members = data.members;
            const uids = members.filter((item: { uid: string, state: number }) => { if (item.uid !== user.uid) return true; });
            if (uids.length > 0) return { pair: uids[ 0 ], locate: data.locate };
            else return undefined
        } else {
            return undefined
        }
    } else {
        return undefined
    }
}

export const setUserDetail = async (data: User) => {
    const user = currentUser();
    if (user && Object.keys(data).length !== 0) {
        const docRef = doc(collection(db, "users"), user.uid);
        try {
            const result = await updateDoc(docRef, {
                ...data,
                timestamp: timestamp()
            });

            console.log("upload!", {
                ...data,
                timestamp: timestamp()
            });
        } catch (e) {
            console.error(e)
            return false
        }
        return true
    } else {
        return false
    }
}

export const getUserDetail = async (user: any) => {
    if (user) {
        const docRef = doc(collection(db, "users"), user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                displayName: data.displayName ? data.displayName : "",
                locate: data.locate ? { lat: data.locate.lat, lng: data.locate.lng } : { lat: "", lng: "" },
                photoURL: data.photoURL ? data.photoURL : "",
                tag: data.tag ? data.tag : []
            }
        } else {
            return undefined
        }
    } else {
        const users = currentUser();
        if (users) {
            const docRef = doc(collection(db, "users"), users.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    uid: users.uid,
                    email: users.email,
                    emailVerified: users.emailVerified,
                    displayName: data.displayName ? data.displayName : "",
                    locate: data.locate ? { lat: data.locate.lat, lng: data.locate.lng } : { lat: "", lng: "" },
                    photoURL: data.photoURL ? data.photoURL : "",
                    tag: data.tag ? data.tag : []
                }
            } else {
                return undefined
            }
        } else {
            return undefined
        }
    }
}

export const getPairDetail = async (room: string | undefined) => {
    if (room !== undefined && room !== "") {
        const temp: { pair: RoomMember, locate: latLng } | undefined = await getPairLocate(room);
        if (temp !== undefined) {
            const member: RoomMember = temp.pair;
            const user = currentUser();
            if (user && member !== undefined) {
                const docRef = doc(collection(db, "users"), member.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    data.uid = member.uid;
                    return {
                        pair: {
                            uid: member.uid, state: member.state,
                            displayName: data.displayName ? data.displayName : "",
                            photoURL: data.photoURL ? data.photoURL : "",
                            tag: data.tag ? data.tag : []
                        },
                        locate: temp.locate
                    }
                }
            }
        }
    }
    return undefined
}

export const getImgPair = async (pair: Pair) => {
    if (pair) {
        const path = "gs://" + process.env.REACT_APP_FIREBASE_STORAGE_BUCKET + "/users/" + pair.uid + "/" + pair.photoURL
        const photoRef = ref(storage, path);

        const photoURL = await getDownloadURL(photoRef).catch(() => "");
        return photoURL
    } else {
        return ""
    }
}

export const setImg = async (file: Blob, next: any, error: any, complete: any) => {
    const user = currentUser();
    if (user) {
        const photoURL = "0.jpg"
        const path = "gs://" + process.env.REACT_APP_FIREBASE_STORAGE_BUCKET + "/users/" + user.uid + "/" + photoURL
        const imageRef = ref(storage, path);
        const uploadTaskSnap = await uploadBytesResumable(imageRef, file)
        const uploadTask = uploadTaskSnap.task

        uploadTask.on(
            "state_changed",
            next,
            error,
            complete
        );
        const docRef = doc(collection(db, "users"), user.uid);
        const result = await updateDoc(docRef, {
            photoURL: photoURL,
            timestamp: timestamp()
        });

        console.log("upload!", photoURL);
    } else {
    }
}

export const sendVerification = async () => {
    const user = currentUser();
    if (user) {
        const sendEmail = await sendEmailVerification(user);
        openNotification([ "承認メールを送信しました。", "" ])
        return true
    } else {
        return false
    }
}

export const signUpAccount = async (data: AccountDetail, email: string, password: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const sendEmail = await sendEmailVerification(user);

        const docRef = doc(collection(db, "users"), user.uid);
        const update = await setDoc(docRef, {
            ...data,
            photoURL: "",
            timestamp: timestamp()
        });
    } catch (e: any) {
        openNotification([ e.code, e.message ])
        console.error(e.code, e.message)
        return false
    }
    return true
}

export const signInAccount = async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        return user
    } catch (e: any) {
        openNotification([ e.code, e.message ])
        console.error(e.code, e.message)
        return undefined
    }
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

export const getMessage = async (room: string) => {
    const user = currentUser();
    if (user && room && room !== undefined && room !== "") {
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
            data.push({ date: temp.date, time: temp.time, state: Number(temp.state), room: temp.room ? temp.room : "", locate: { lat: "", lng: "" } })
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
            batch.set(docRefs, { state: value.state, room: "" }, { merge: true })
        });
        await batch.commit();
        console.log("uploaded!", data.length)
    } else {
    }
}