import { useState, useEffect } from 'react'
import './calender.css';
import { auth, signInAccount, signOutAccount, currentUser, signUpAccount } from "./components/firebase"
import './App.css';
import { Layout, Button, Input, Row, Col, Avatar } from 'antd';

const { Header, Footer, Sider, Content } = Layout;

const User = (state: any) => {
    const onSubmit = async () => {
        state.onSubmit(false)
    };

    return <>
        <h2>Chat With Friends</h2>
        <Button type="text" onClick={state.showDrawer}>
            <Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
        </Button>
        <h2>{state.email}</h2>
        <Button type="primary" onClick={() => { onSubmit(); signOutAccount() }} disabled={!state.form} >Sign Out</Button>
    </>
}

export default User