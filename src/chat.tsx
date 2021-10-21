import type { FormEvent } from "react";
import type { Messages } from "./components/type"

import { useState, useEffect, useMemo } from 'react'
import { auth, currentUser, sendMessage, getRoom, getMessage, db } from "./components/firebase"
import { compare } from './components/type'
import { onSnapshot, collection, query, orderBy, where, limit, doc } from "firebase/firestore";
import { Layout, Button, Input, List, Typography, Divider, Avatar } from 'antd';
const { Text, Link } = Typography;


const Chat = (state: any) => {
    const [ form, setForm ] = useState(true);
    const [ message, setMessage ] = useState("");
    const [ messages, setMessages ] = useState<Messages[]>([]);
    const [ room, setRoom ] = useState<string | undefined>(undefined);

    useEffect(() => {
        async function getState() {
            if (state.room !== undefined && state.room !== "") {
                setMessages(await getMessage(state.room));
                console.log("got message!", state.room);

                const colRef = collection(doc(collection(db, "rooms"), state.room), "messages");
                const q = query(colRef, orderBy("timestamp", "desc"), limit(10));

                const unsubscribe = onSnapshot(q, snapshots => {
                    var res: Messages[] = []
                    snapshots.forEach((d: any) => {
                        const data = d.data()
                        res.push({ message: data.message, uid: data.uid, timestamp: data.timestamp })
                    });
                    console.log("updated!", res.length)
                    setMessages(res)
                    setForm(true);
                }, error => {
                    console.log(error);
                });
                return () => unsubscribe();
            }
        }
        getState();
    }, [ room ]);

    useEffect(() => {
        async function getState() {
            setRoom(await getRoom())
        }
        if (room === undefined) {
            getState();
            console.log("got room!", room)
        }
    }, []);

    const onSubmit = async (event: FormEvent) => {
        if (room) sendMessage(room, message)
        setForm(false)
    };

    const chatList = () => {
        var temp = []
        for (var i = messages.length - 1; i >= 0; i--) {
            if (messages[ i ].uid === state.user.uid) temp.push(<List.Item key={i}><Text style={{ margin: '0 0 0 auto' }}>{messages[ i ].message}</Text></List.Item>)
            else temp.push(<List.Item key={i} style={{ justifyContent: 'flex-start' }}>
                <Text>{messages[ i ].message}</Text>
            </List.Item>)
        }
        return temp
    }

    return <>
        {state.open && room !== undefined && messages.length > 0 ?
            <Layout>
                <List bordered>
                    {chatList()}
                </List>
                <Input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    minLength={1}
                    disabled={!form}
                />
                <Button type="primary" disabled={!form} onClick={onSubmit} >
                    Send
                </Button>
            </Layout> : <></>
        }
    </ >
}

export default Chat
