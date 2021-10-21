import type { FormEvent } from "react";
import type { UserCalender } from "./components/type"

import { useState, useEffect } from 'react'
import { auth, signInAccount, signOutAccount, currentUser, signUpAccount } from "./components/firebase"
import Chat from './chat'
import Calender from './calender'
import User from './user'
import SignIn from './signIn'
import Detail from './detail'
import './App.css';
import { Layout, Button, Input, Row, Col, Drawer } from 'antd';
import UserDrawer from "./userDrawer";

const { Header, Footer, Sider, Content } = Layout;


const App = () => {
  const [ user, setUser ] = useState(() => currentUser());
  const [ email, setEmail ] = useState("");
  const [ form, setForm ] = useState(true);
  const [ visible, setVisible ] = useState(false);
  const [ detail, setDetail ] = useState<UserCalender | undefined>(undefined);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    auth.onAuthStateChanged((user_change: any) => {
      if (user_change) {
        setUser(user_change);
        setEmail(user_change.email ? user_change.email : "");
      } else {
        setUser(null);
      }
      setForm(true)
    });
  }, []);

  const onSubmit = (state: boolean) => {
    setForm(state)
  };

  const openDetail = (value: UserCalender) => {
    console.log(value)
    setDetail(value)
  }

  return (
    <Layout>
      <Header>Header</Header>
      <Content>
        <Layout className="site-layout-background">
          {user ? (
            <Layout id="sign_out">
              <Row>
                <User email={email} onSubmit={onSubmit} showDrawer={showDrawer} form={form} openDetail={openDetail} />
              </Row>
              <Row>
                <Col flex="600px">
                  <Calender user={user} openDetail={openDetail} />
                </Col>
                <Col flex="auto">
                  <Row>
                    <Detail open={detail !== undefined} detail={detail} showDrawer={showDrawer} />
                  </Row>
                  <Row>
                    <Chat user={user} room={detail.room} open={detail !== undefined} />
                  </Row>
                </Col>
              </Row>
              <UserDrawer onClose={onClose} visible={visible} user={user} />
            </Layout>
          ) : (
            <Layout id="sign_in">
              <SignIn onSubmit={onSubmit} form={form} />
            </Layout>
          )}
        </Layout>
      </Content>
      <Footer>Footer</Footer>
    </Layout>
  )
}

export default App
