import { useState, useEffect } from 'react'
import { auth, signInAccount, signOutAccount, currentUser, signUpAccount } from "./components/firebase"
import './App.css';
import { Layout, Button, Input, Row, Col, Avatar, Drawer } from 'antd';


const UserDrawer = (state: any) => {
    const editImg = () => {
    }

    return <>
        <Drawer title="User" placement="right" onClose={state.onClose} visible={state.visible}>
            <Button type="text" onClick={editImg}>
                <Avatar src={state.user.photoURL} alt="Han Solo" />
            </Button>
            <p>Name</p>
            <p>{state.user.displayName}</p>
            <p>Email</p>
            <p>{state.user.email}</p>
        </Drawer>
    </>
}

export default UserDrawer