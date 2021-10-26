import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true })

const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * max);
}

type latLng = { lat: string, lng: string }
const locateDefault: latLng = { lat: "", lng: "" }


const getDistance = (latLng_1: latLng, latLng_2: latLng) => {
    const deg2rad = (degree: number) => degree * (Math.PI / 180);

    const lat_1 = parseFloat(latLng_1.lat)
    const lng_1 = parseFloat(latLng_1.lng)
    const lat_2 = parseFloat(latLng_2.lat)
    const lng_2 = parseFloat(latLng_1.lng)

    const radlat = deg2rad(Math.abs(lat_1 - lat_2));
    const radlng = deg2rad(Math.abs(lng_1 - lng_2));
    const average = deg2rad(lat_1 + ((lat_2 - lat_1) / 2));
    var meridian = 0;
    var prime = 0;

    const temp = 1.0 - 0.00669438 * Math.pow(Math.sin(average), 2);
    meridian = 6335439.0 / Math.sqrt(Math.pow(temp, 3));
    prime = 6378137.0 / Math.sqrt(temp);

    return Math.round(Math.sqrt(Math.pow(meridian * radlat, 2) + Math.pow(prime * Math.cos(average) * radlng, 2))) / 1000;
}

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
    const data = {
        state: state,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    }
    await db.collection('users').doc(uid_1).collection("calender").doc(date + time)
        .set(data, { merge: true });

    await db.collection('users').doc(uid_2).collection("calender").doc(date + time)
        .set(data, { merge: true });


    await db.collection('calender').doc(date).collection(time).doc(uid_1)
        .set(data, { merge: true });

    if (without_2) {
        await db.collection('calender').doc(date).collection(time).doc(uid_2)
            .set(data, { merge: true });
    }
    functions.logger.log('state updated!', date, time);
}

const changeRoomStateId = async (without_2: boolean, room: string, state: number, date: string, time: string, uid_1: string, uid_2: string) => {
    const data = {
        room: room,
        state: state,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    }
    await db.collection('users').doc(uid_1).collection("calender").doc(date + time)
        .set(data, { merge: true });

    await db.collection('users').doc(uid_2).collection("calender").doc(date + time)
        .set(data, { merge: true });


    await db.collection('calender').doc(date).collection(time).doc(uid_1)
        .set(data, { merge: true });


    if (without_2) {
        await db.collection('calender').doc(date).collection(time).doc(uid_2)
            .set(data, { merge: true });
    }
    functions.logger.log('room state updated!', date, time, room);
}

const sendMessage = async (uid: string, date: string, time: string, messages: string[]) => {
    const res = await db.collection('users').doc(uid).collection("messages").add({
        title: messages[ 0 ],
        message: messages.length > 1 ? messages.slice(1).join("　") : "",
        date: date,
        time: time,
        read: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.log('send the message: ', res.id);
}

exports.updateCalender = functions.firestore
    .document('calender/{date}/{time}/{uid}')
    .onWrite(async (change, context) => {
        try {
            const data = change.after.data();
            const previousData = change.before.data();

            functions.logger.log('data:', data, 'previousData:', previousData);

            if (!data || data === {} || data === previousData || (previousData && (data.state === previousData.state)) || data.state !== 1 || (data.room && data.room !== "")) {
                return null;
            }

            const colRef = db.collection('calender').doc(context.params.date).collection(context.params.time);
            const snapshot = await colRef.where('state', '==', 1).get();

            if (snapshot.empty) {
                functions.logger.log('No matching pair.');
                return null;
            }

            var pairUid: string = "";
            const ran: number = getRandomInt(snapshot.size - 1)
            var count: number = 0;

            snapshot.forEach(doc => {
                if (doc.id !== context.params.uid) {
                    if (count === ran && doc.id !== context.params.uid) {
                        const datas = doc.data()
                        if (!datas || datas.room === "") {
                            pairUid = doc.id
                        }
                    }
                    count += 1;
                }
            });

            if (pairUid === "") {
                functions.logger.log('No matching pair uid.');
                return null;
            }

            const pairRef = db.collection('users').doc(pairUid);
            const pairDocs = await pairRef.get();
            var pairName = ""

            const userRef = db.collection('users').doc(context.params.uid);
            const userDocs = await userRef.get();
            var userName = ""

            var locate: latLng = locateDefault;

            if (!pairDocs.exists || !userDocs.exists) {
                functions.logger.log('No matching pair locate.');
                return null;
            } else {
                const pairData = pairDocs.data()
                const userData = userDocs.data()
                if (userData && userData.displayName) userName = userData.displayName
                if (pairData && pairData.displayName) pairName = pairData.displayName

                if (userData && userData.locate && pairData && pairData.locate) {
                    const dis = getDistance(userData.locate, pairData.locate)
                    if (dis <= 2) {
                        if (getRandomInt(2) === 1) {
                            locate = userData.locate
                        } else {
                            locate = pairData.locate
                        }
                    } else {
                        return null
                    }
                }
            }

            const roomId = await addRoom(context.params.date, context.params.time, context.params.uid, pairUid, locate)
            await changeRoomStateId(true, roomId, 2, context.params.date, context.params.time, pairUid, context.params.uid)

            sendMessage(context.params.uid, context.params.date, context.params.time, [ "相手が見つかりました", pairName + "さん" ])
            sendMessage(pairUid, context.params.date, context.params.time, [ "相手が見つかりました", userName + "さん" ])

            return change.after.ref.set({
                room: roomId,
                state: 2,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
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

            if (!data || data === {} || data === previousData || (data.members && data.members.length !== 2) || (data.state && data.state !== 2) || (previousData && data.members === previousData.members)) {
                return null;
            }

            if (data.members[ 0 ].state === 1 && data.members[ 1 ].state === 1) {
                await changeRoomState(false, 3, data.date, data.time, data.members[ 0 ].uid, data.members[ 1 ].uid)
                functions.logger.log('matched:', context.params.id);

                sendMessage(data.members[ 0 ].uid, data.date, data.time, [ "確定しました！" ])
                sendMessage(data.members[ 1 ].uid, data.date, data.time, [ "確定しました！" ])

                return change.after.ref.set({
                    state: 3,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });

            } else if (data.members[ 0 ].state === -1 || data.members[ 1 ].state === -1) {
                await changeRoomStateId(false, "", 1, data.date, data.time, data.members[ 0 ].uid, data.members[ 1 ].uid)
                functions.logger.log('deleted:', context.params.id);

                if (data.members[ 0 ].state === -1) {
                    sendMessage(data.members[ 1 ].uid, data.date, data.time, [ "拒否されました" ])
                }

                if (data.members[ 1 ].state === -1) {
                    sendMessage(data.members[ 0 ].uid, data.date, data.time, [ "拒否されました" ])
                }

                return change.after.ref.delete();
            }

            return null;
        } catch (e) {
            functions.logger.log(e)
            return null;
        }
    });


exports.updateMessage = functions.firestore
    .document('rooms/{id}/messages/{messageId}')
    .onCreate(async (snap, context) => {
        try {
            const newValue = snap.data();
            functions.logger.log(newValue);

            const uid = newValue.uid;
            const message = newValue.message;
            if (uid && message) {
                const roomRef = db.collection('rooms').doc(context.params.id);
                const roomDocs = await roomRef.get();
                functions.logger.log(message);

                if (!roomDocs.exists) {
                    functions.logger.log('No room found');
                } else {
                    const roomData = roomDocs.data()
                    functions.logger.log(roomData);
                    if (roomData && roomData.members && roomData.members.length === 2) {
                        var pairUid = ""
                        roomData.members.forEach((value: any, index: number) => {
                            if (value.uid !== uid) pairUid = value.uid
                        });

                        sendMessage(pairUid, roomData.date, roomData.time, [ "メッセージが届きました", message ])
                    }
                }
            }
        } catch (e) {
            functions.logger.log(e)
        }
        return null;
    });
