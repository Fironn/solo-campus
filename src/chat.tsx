import type { FormEvent } from "react";
import type { Messages } from "./components/type"

import { useState, useEffect, useRef } from 'react'
import { auth, currentUser, sendMessage, getMessage, db } from "./components/firebase"
import { compare } from './components/type'
import { onSnapshot, collection, query, orderBy, where, limit, doc } from "firebase/firestore";
import { Layout, Button, Form, Input, List, Typography, Divider, Avatar, Row, Col } from 'antd';
import './chat.css'
const { Text, Link } = Typography;


const Chat = (state: any) => {
    const [ message, setMessage ] = useState("");
    const [ messages, setMessages ] = useState<Messages[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        var unsubscribe: Function;
        async function getState() {
            if (state.room !== undefined && state.room !== "") {
                setMessages(await getMessage(state.room));
                console.log("got message!", state.room);

                const colRef = collection(doc(collection(db, "rooms"), state.room), "messages");
                const q = query(colRef, orderBy("timestamp", "desc"), limit(10));

                unsubscribe = onSnapshot(q, snapshots => {
                    var res: Messages[] = []
                    snapshots.forEach((d: any) => {
                        const data = d.data()
                        res.push({ message: data.message, uid: data.uid, timestamp: data.timestamp })
                    });
                    console.log("updated!", res.length)
                    setMessages(res)
                    state.onSubmit(true)
                }, (e) => {
                    console.log(e);
                });
                return () => unsubscribe();
            }
        }
        getState();
        return () => {
            unsubscribe()
        };
    }, [ state.room ]);

    const onSend = async () => {
        if (state.room && message.length > 0) await sendMessage(state.room, message)
        setMessage("")
        state.onSubmit(true)
    };

    const onSubmit = () => {
        state.onSubmit(false)
        if (inputRef && inputRef.current) inputRef.current.click();
    }

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
                <Row id="chat-send">
                    <Col flex="auto">
                        <Input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            minLength={1}
                            disabled={!state.form}
                            id="chat-input"
                            onKeyPress={e => {
                                if (e.key == 'Enter') {
                                    e.preventDefault()
                                    onSubmit()
                                }
                            }}
                        />
                    </Col>
                    <Col flex="40px">
                        <Button type="primary" ref={inputRef} disabled={!state.form} onClick={onSend} id="chat-button">
                            送信
                        </Button>
                    </Col>
                </Row>
            </Layout> : <></>
        }
    </ >
}

export default Chat
