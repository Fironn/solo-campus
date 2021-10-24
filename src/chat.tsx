import type { FormEvent } from "react";
import type { Messages } from "./components/type"

import { useState, useEffect, useMemo } from 'react'
import { auth, currentUser, sendMessage, getMessage, db } from "./components/firebase"
import { compare } from './components/type'
import { onSnapshot, collection, query, orderBy, where, limit, doc } from "firebase/firestore";
import { Layout, Button, Input, List, Typography, Divider, Avatar, Row, Col } from 'antd';
import './chat.css'
const { Text, Link } = Typography;


const Chat = (state: any) => {
    const [ message, setMessage ] = useState("");
    const [ messages, setMessages ] = useState<Messages[]>([]);

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
                    state.onSubmit(true)
                }, error => {
                    console.log(error);
                });
                return () => unsubscribe();
            }
        }
        getState();
        return () => {
        };
    }, [ state.room ]);

    const onSubmit = async (event: FormEvent) => {
        if (state.room) sendMessage(state.room, message)
        state.onSubmit(false)
    };

    const chatList = () => {
        var temp = []
        for (var i = messages.length - 1; i >= 0; i--) {
            if (messages[ i ].uid === state.user.uid) temp.push(<List.Item className="chat-list-child chat-list-child-user" key={i}><Text>{messages[ i ].message}</Text></List.Item>)
            else if (messages[ i ].uid === "admin") temp.push(<List.Item className="chat-list-child chat-list-child-admin" key={i}><Text>{messages[ i ].message}</Text></List.Item>)
            else temp.push(<List.Item className="chat-list-child" key={i} style={{ justifyContent: 'flex-start' }}>
                <Text>{messages[ i ].message}</Text>
            </List.Item>)
        }
        return temp
    }

    return <>
        {state.open && state.room !== undefined && state.room !== "" ?
            <Layout id="chat">
                <List id="chat-list">
                    {chatList()}
                </List>
                <Row>
                    <Col flex="auto">
                        <Input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            minLength={1}
                            disabled={!state.form}
                            id="chat-input"
                        />
                    </Col>
                    <Col flex="40px">
                        <Button type="primary" disabled={!state.form} onClick={onSubmit} id="chat-button">
                            送信
                        </Button>
                    </Col>
                </Row>
            </Layout> : <></>
        }
    </ >
}

export default Chat
