import type { Messages, UserCalender, Pair, RoomMember, User, AccountDetail, latLng } from "./type"
import type { DocumentReference } from "firebase/firestore"
import { getApps, initializeApp } from "firebase/app"
import {
    getAuth, sendEmailVerification, signOut, browserSessionPersistence,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, isSignInWithEmailLink, signInWithEmailLink
} from "firebase/auth";
import { Timestamp, writeBatch, setDoc, getFirestore, arrayUnion, arrayRemove, updateDoc, collection, query, orderBy, startAt, endAt, limit, addDoc, getDocs, getDoc, doc, where } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage"
import { getDateTimeString } from "./time"
import { openNotification } from "../notification";
import { getAnalytics } from "firebase/analytics";
import loadImage from 'blueimp-load-image';
import { async } from "@firebase/util";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
    databeseURL: process.env.REACT_APP_FIREBASE_DATABASE,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APPID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = typeof window !== "undefined" && !getApps().length ? initializeApp(firebaseConfig) : getApps()[ 0 ];
const analytics = getAnalytics(app);

export const auth = app ? getAuth(app) : getAuth(initializeApp(firebaseConfig));
export const db = getFirestore();
const storage = getStorage();

auth.setPersistence(browserSessionPersistence);


export const readMessage = async (refs: any, id: string) => {
    try {
        await updateDoc(doc(refs, id), {
            read: true
        });
        console.log("read message", id)
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
    }
}

export const readMessageDate = async (date: string, time: string) => {
    try {
        const user = currentUser();
        if (user) {
            const colRef = collection(doc(db, "users", user.uid), "messages");
            const q = query(colRef, where("date", "==", date), where("time", "==", time));

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (docs) => {
                await updateDoc(docs.ref, {
                    read: true
                });
            });
            console.log("read message Data", date, time)
        }
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
    }
}

export const getImg = async () => {
    try {
        const user = await getUserDetail(undefined);
        if (user && user.photoURL) {
            const path = "gs://" + process.env.REACT_APP_FIREBASE_STORAGE_BUCKET + "/users/" + user.uid + "/" + user.photoURL
            const photoRef = ref(storage, path);
            const photoURL = await getDownloadURL(photoRef);
            return photoURL
        } else {
            return ""
        }
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return ""
    }
}

export const setUserState = async (room: string, state: boolean) => {
    try {
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
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
    }
}

export const getUserState = async (room: string) => {
    try {
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
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return undefined
    }
}

const getPairLocate = async (room: string) => {
    try {
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
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return undefined
    }
}

export const setUserDetail = async (data: User) => {
    try {
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
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return false
    }
}

export const getUserDetail = async (user: any) => {
    try {
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
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return undefined
    }
}

export const getPairDetail = async (room: string | undefined) => {
    try {
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
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return undefined
    }
}

export const getImgPair = async (pair: Pair) => {
    try {
        if (pair) {
            const path = "gs://" + process.env.REACT_APP_FIREBASE_STORAGE_BUCKET + "/users/" + pair.uid + "/" + pair.photoURL
            const photoRef = ref(storage, path);

            const photoURL = await getDownloadURL(photoRef).catch(() => "");
            return photoURL
        } else {
            return ""
        }
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return ""
    }
}

export const setImg = async (file: Blob, next: any, error: any, complete: any) => {
    try {
        const user = currentUser();
        if (user) {
            const photoURL = "0.jpg"
            const path = "gs://" + process.env.REACT_APP_FIREBASE_STORAGE_BUCKET + "/users/" + user.uid + "/" + photoURL
            const imageRef = ref(storage, path);

            const canvas = await loadImage(file, { maxWidth: 100, canvas: true })

            if (canvas.image instanceof HTMLCanvasElement) {
                canvas.image.toBlob(async (blob: Blob | null) => {
                    if (blob) {
                        const uploadTaskSnap = await uploadBytesResumable(imageRef, blob)
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
                    }
                });
            }
        } else {
        }
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
    }
}

export const sendVerification = async () => {
    try {
        const user = currentUser();
        if (user) {
            const sendEmail = await sendEmailVerification(user);
            openNotification([ "承認メールを送信しました。", "" ], undefined, () => { })
            return true
        } else {
            return false
        }
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return false
    }
}

export const signUpAccount = async (data: AccountDetail, email: string, password: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const sendEmail = await sendEmailVerification(user);
        openNotification([ "登録完了", "承認メールを送信しました。" ], undefined, () => { })

        const docRef = doc(collection(db, "users"), user.uid);
        const update = await setDoc(docRef, {
            ...data,
            photoURL: "",
            timestamp: timestamp()
        });
        window.location.reload();
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
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
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return undefined
    }
}

export const signOutAccount = async () => {
    try {
        const result = await signOut(auth);
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return undefined
    }
}

export const currentUser = () => {
    return auth.currentUser;
};

const timestamp = () => {
    return Timestamp.fromDate(new Date());
};

export const getMessage = async (room: string) => {
    try {
        const user = currentUser();
        if (user && room && room !== undefined && room !== "") {
            const colRef = collection(doc(collection(db, "rooms"), room), "messages");
            const q = query(colRef, orderBy("timestamp", "desc"), limit(10));
            const querySnapshot = await getDocs(q);
            var res: Messages[] = []
            querySnapshot.forEach((d) => {
                const data = d.data()
                res.push({ id: d.id, message: data.message, uid: data.uid, timestamp: data.timestamp })
            });

            return res;
        } else {
            return []
        }
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return []
    }
}

export const sendMessage = async (room: string, message: string) => {
    try {
        const user = currentUser();
        if (user) {
            const colRef = collection(doc(collection(db, "rooms"), room), "messages");
            const result = await addDoc(colRef, {
                message: message,
                read: false,
                uid: user.uid,
                timestamp: timestamp()
            });
            console.log("send!", message);
        }
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
    }
}

export const getCalender = async (date: Date) => {
    try {
        const user = currentUser();
        const dateTimeStr = getDateTimeString(date, 0);
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
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return {}
    }
}

export const getCalenderRange = async (dates: string[]) => {
    try {
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
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
        return []
    }
}

export const setCalenderRange = async (data: UserCalender[]) => {
    try {
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
    } catch (e: any) {
        openNotification([ e.code, e.message ], undefined, () => { })
        console.error(e.code, e.message)
    }
}