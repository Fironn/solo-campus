import type { EventHandler, FormEvent } from "react";
import type { UserCalender } from "./components/type"

import { useState, useEffect } from 'react'
import './calender.css';
import { auth, signInAccount, signOutAccount, currentUser, signUpAccount } from "./components/firebase"
import './App.css';
import { Layout, Button, Input, Row, Col } from 'antd';

const { Header, Footer, Sider, Content } = Layout;

const User = (state: any) => {
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");

    const onSubmit = async () => {
        state.onSubmit(false)
    };

    return <>
        <h1>Welcome to Chat Room</h1>
        <Input
            placeholder="email"
            id="email"
            type="email"
            value={email}
            onInput={(e) => setEmail(e.currentTarget.value)}
            disabled={!state.form}
        />
        <Input
            placeholder="password"
            id="password"
            type="password"
            value={password}
            onInput={(e) => setPassword(e.currentTarget.value)}
            disabled={!state.form}
        />
        <Button type="primary" onClick={() => { onSubmit(); signInAccount(email, password) }} disabled={!state.form}>Sign In</Button>
        <Button onClick={() => { onSubmit(); signUpAccount(email, password); }} disabled={!state.form}>Sign Up</Button>
    </>
}

export default User