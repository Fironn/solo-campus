import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import deepEqual from "deep-equal";

admin.initializeApp();

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true })

const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * max);
}

type latLng = { lat: string, lng: string }
const locateDefault: latLng = { lat: "", lng: "" }

const addRoom = async (date: string, time: string, uid_1: string, uid_2: string, locate: latLng) => {
    const res = await db.collection('rooms').add({
        members: [ { uid: uid_1, state: 0 }, { uid: uid_2, state: 0 } ],
        state: 2,
        date: date,
        time: time,
        locate: locate
    });

    functions.logger.log('room created: ', res.id);
    return res.id
}

const changeRoomState = async (without_2: boolean, state: number, date: string, time: string, uid_1: string, uid_2: string) => {
    await db.collection('users').doc(uid_1).collection("calender").doc(date + time)
        .set({
            state: state,
        }, { merge: true });

    await db.collection('users').doc(uid_2).collection("calender").doc(date + time)
        .set({
            state: state,
        }, { merge: true });


    await db.collection('calender').doc(date).collection(time).doc(uid_1)
        .set({
            state: state,
        }, { merge: true });

    if (without_2) {
        await db.collection('calender').doc(date).collection(time).doc(uid_2)
            .set({
                state: state,
            }, { merge: true });
    }
    functions.logger.log('state updated!', date, time);
}

const changeRoomStateId = async (without_2: boolean, room: string, state: number, date: string, time: string, uid_1: string, uid_2: string) => {
    await db.collection('users').doc(uid_1).collection("calender").doc(date + time)
        .set({
            room: room,
            state: state,
        }, { merge: true });

    await db.collection('users').doc(uid_2).collection("calender").doc(date + time)
        .set({
            room: room,
            state: state,
        }, { merge: true });


    await db.collection('calender').doc(date).collection(time).doc(uid_1)
        .set({
            room: room,
            state: state,
        }, { merge: true });


    if (without_2) {
        await db.collection('calender').doc(date).collection(time).doc(uid_2)
            .set({
                room: room,
                state: state,
            }, { merge: true });
    }
    functions.logger.log('room state updated!', date, time, room);
}

exports.updateCalender = functions.firestore
    .document('calender/{date}/{time}/{uid}')
    .onWrite(async (change, context) => {
        try {
            const data = change.after.data();
            const previousData = change.before.data();

            functions.logger.log('data:', data, 'previousData:', previousData);

            if (!data || (previousData && (data.state === previousData.state)) || data.state !== 1 || (data.room && data.room !== "")) {
                return null;
            }

            const colRef = db.collection('calender').doc(context.params.date).collection(context.params.time);
            const snapshot = await colRef.where('state', '==', 1).get();

            if (snapshot.empty) {
                functions.logger.log('No matching pair.');
                return null;
            }
            var pairUid: string = "";
            var locate: latLng = locateDefault;
            const ran: number = getRandomInt(snapshot.size - 1)
            var count: number = 0;

            snapshot.forEach(doc => {
                if (doc.id !== context.params.uid) {
                    if (count === ran && doc.id !== context.params.uid) {
                        const pairData = doc.data()
                        functions.logger.log('pairData', pairData);
                        if (!pairData || pairData.room === "") {
                            pairUid = doc.id
                            locate = pairData.locate
                        }
                    }
                    count += 1;
                }
            });

            if (pairUid === "" || locate === locateDefault) {
                functions.logger.log('No matching pair uid.');
                return null;
            }

            const ref = db.collection('users').doc(context.params.uid);
            const docs = await ref.get();

            if (!docs.exists) {
                functions.logger.log('No user document!');
            } else {
                const userData = docs.data()
                if (userData && userData.locate) {
                    functions.logger.log('userData', userData);
                    if (getRandomInt(2) == 1) {
                        locate = userData.locate
                    }
                }
            }

            const roomId = await addRoom(context.params.date, context.params.time, context.params.uid, pairUid, locate)
            await changeRoomStateId(true, roomId, 2, context.params.date, context.params.time, pairUid, context.params.uid)

            return change.after.ref.set({
                room: roomId,
                state: 2,
            }, { merge: true });

        } catch (e) {
            functions.logger.log(e);
            return null;
        }
    });

exports.updateState = functions.firestore
    .document('rooms/{id}')
    .onWrite(async (change, context) => {
        try {
            const data = change.after.data();
            const previousData = change.before.data();

            functions.logger.log('data:', data, 'previousData:', previousData);

            if (!data || data == {} || (data.members && data.members.length !== 2) || (data.state && data.state !== 2) || (previousData && (deepEqual(data.members, previousData.members)))) {
                return null;
            }

            if (data.members[ 0 ].state === 1 && data.members[ 1 ].state === 1) {
                functions.logger.log('matched:', context.params.id);

                await changeRoomState(false, 3, data.date, data.time, data.members[ 0 ].uid, data.members[ 1 ].uid)

                return change.after.ref.set({
                    state: 3,
                }, { merge: true });
            } else if (data.members[ 0 ].state === -1 || data.members[ 1 ].state === -1) {
                await changeRoomStateId(false, "", 1, data.date, data.time, data.members[ 0 ].uid, data.members[ 1 ].uid)
                return change.after.ref.delete();
            }

            return null;
        } catch (e) {
            functions.logger.log(e)
            return null;
        }
    });