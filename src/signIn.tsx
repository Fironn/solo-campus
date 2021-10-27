import type { EventHandler, FormEvent } from "react";
import type { UserCalender } from "./components/type"

import { useState, useEffect } from 'react'
import './calender.css';
import { auth, signInAccount, signOutAccount, currentUser, signUpAccount } from "./components/firebase"
import './signIn.css';
import { Layout, Button, Input, Row, Col, Space } from 'antd';
import { InfoCircleOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const { Header, Footer, Sider, Content } = Layout;

const User = (state: any) => {
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");

    const onSubmit = async (e: string, p: string) => {
        state.onSubmit(false)
        const res = await signInAccount(e, p)
        if (res === undefined) {
            state.onSubmit(true)
        }
        state.onSubmit(true)
    };

    return <Space id="signin">
        <Input
            placeholder="email"
            type="email"
            value={email}
            onInput={(e) => setEmail(e.currentTarget.value)}
            disabled={!state.form}
            prefix={<UserOutlined className="site-form-item-icon" />}
        />
        <Input.Password
            placeholder="password(6 characters minimum)"
            type="password"
            value={password}
            onInput={(e) => setPassword(e.currentTarget.value)}
            disabled={!state.form}
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
        <Button type="primary" onClick={async () => { onSubmit(email, password) }} disabled={!state.form}>ログイン</Button>
        <Button style={{ color: 'white' }} type="text" onClick={() => { state.showDrawer(3) }} disabled={!state.form}>新規登録する</Button>
    </Space>
}

export default User