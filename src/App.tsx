import type { Pair, User as Users } from "./components/type"
import type { UserCalender } from "./components/type"

import { useState, useEffect } from 'react'
import { auth, db, readMessage, sendVerification, getUserDetail, getImg, getPairDetail, getImgPair, getUserState } from "./components/firebase"
import { onSnapshot, collection, doc, } from "firebase/firestore";
import Chat from './chat'
import Calender from './calender'
import User from './user'
import SignIn from './signIn'
import Detail from './detail'
import UserDrawer from "./userDrawer";
import PairDrawer from "./pairDrawer";
import RegisterDrawer from "./registerDrawer";
import './App.css';
import { Layout, Button, Input, Typography, Row, Col, Drawer, Skeleton, notification, Divider } from 'antd';
import { openNotification, closeNotification } from "./notification";
import deepEqual from "deep-equal";
const { Header, Footer, Sider, Content } = Layout;
const { Text, Link } = Typography;

const App = () => {
  const [ user, setUser ] = useState<Users | undefined>(undefined);
  const [ loading, setLoading ] = useState(true);
  const [ form, setForm ] = useState(true);
  const [ visibleRegister, setVisibleRegister ] = useState(false);
  const [ visibleUser, setVisibleUser ] = useState(false);
  const [ visiblePair, setVisiblePair ] = useState(false);
  const [ detail, setDetail ] = useState<UserCalender | undefined>(undefined);
  const [ userState, setUserState ] = useState<number | undefined>(undefined);
  const [ photoURL, setPhotoURL ] = useState<string | undefined>("");

  const [ pair, setPair ] = useState<Pair | undefined>(undefined);
  const [ photoURLPair, setPhotoURLPair ] = useState<string | undefined>("");


  useEffect(() => {
    const getState = async () => {
      if (pair !== undefined) {
        setPhotoURLPair(await getImgPair(pair));
      }
      setLoading(false)
    }
    if (photoURLPair === "") {
      setLoading(true)
      getState();
    }
    return () => {
    };
  }, [ pair ]);

  useEffect(() => {
    if (detail !== undefined) {
      setLoading(false)
    }
    return () => {
    };
  }, [ detail ]);

  const showDrawer = (page: 1 | 2 | 3) => {
    if (page === 1) {
      setVisibleUser(true);
    } else if (page === 2) {
      setVisiblePair(true);
    } else if (page === 3) {
      setVisibleRegister(true);
    }
  };

  const onClose = () => {
    setVisibleUser(false);
    setVisiblePair(false);
    setVisibleRegister(false);
  };

  const changePhoto = (url: string) => {
    if (url !== "") {
      setPhotoURL(url);
    }
  }

  const changeUserProfile = (data: Users) => {
    if (data && Object.keys(data).length !== 0) {
      setUser({ ...user, ...data })
    }
  }

  useEffect(() => {
    var unsubscribe: Function;
    const getState = async () => {
      setPhotoURL(await getImg());
    }

    const getStates = async (user_change: any) => {
      const userDetail = await getUserDetail(user_change)
      if (userDetail) setUser(userDetail);
    }

    auth.onAuthStateChanged((user_change: any) => {
      try {
        if (user_change) {
          getStates(user_change)
          getState()
          const colRef = collection(doc(db, "users", user_change.uid), "messages");
          unsubscribe = onSnapshot(colRef,
            (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                  const data = change.doc.data();
                  if (data.read === false && data.title && data.message) openNotification([ data.title, data.message ], () => readMessage(colRef, change.doc.id))
                }
              });
            }, (e) => {
              console.error(e)
            });

          return () => unsubscribe();
        } else {
          setUser(undefined);
          setDetail(undefined);
        }
        setLoading(false)
        setForm(true)
      } catch (e) {
        console.error(e)
      }
    });

    return () => {
      unsubscribe();
      closeNotification()
      setForm(true)
    };
  }, []);

  const onSubmit = (state: boolean) => {
    setForm(state)
  };

  const openDetail = async (value: UserCalender | undefined) => {
    if (value !== undefined) {
      setLoading(true)
      setPhotoURLPair("")
      if (value.room) {
        const temp = await getPairDetail(value.room)
        if (temp !== undefined) {
          setPair(temp.pair);
          if (value.locate && value.locate.lat === "") {
            setDetail({ ...value, locate: temp?.locate })
          } else {
            setDetail(value)
          }
        } else {
          setDetail(value)
          setPair(undefined)
          setPhotoURLPair("")
        }
        if (value.state === 2) {
          setUserState(await getUserState(value.room));
        } else {
          setUserState(undefined)
        }
      } else {
        if (deepEqual(value, detail)) {
          setLoading(false)
        } else {
          setDetail(value)
          setUserState(undefined)
          setPair(undefined)
        }
      }
    } else {
      if (detail === undefined) {
        setLoading(false)
      } else {
        setDetail(undefined)
      }
    }
  }

  return (
    <>
      <Header id="header">
        <Layout id="user-bar">
          {user ?
            <User user={user} photoURL={photoURL} onSubmit={onSubmit} showDrawer={showDrawer} form={form} openDetail={openDetail} />
            : <SignIn onSubmit={onSubmit} form={form} showDrawer={showDrawer} />}
        </Layout>
      </Header>
      <Content id="main">
        <Layout id="content">
          {user ? user.emailVerified ?
            <>
              <Row id="group" justify="space-between" gutter={[ 30, 30 ]}>
                <Col flex="500px">
                  <Calender user={user} onSubmit={onSubmit} openDetail={openDetail} form={form} />
                </Col>
                <Col flex="auto">
                  {loading ?
                    <Skeleton active avatar paragraph={{ rows: 4 }} /> :
                    <>
                      <Detail open={detail !== undefined} form={form} pair={pair} userState={userState} onSubmit={onSubmit} photoURLPair={photoURLPair} detail={detail} showDrawer={showDrawer} />
                      {detail && detail.state === 3 ? <Chat user={user} form={form} room={detail ? detail.room : undefined} onSubmit={onSubmit} open={detail !== undefined} />
                        : <></>}
                    </>
                  }
                </Col>
              </Row>
              <UserDrawer changeUserProfile={changeUserProfile} photoURL={photoURL} form={form} onClose={onClose} onSubmit={onSubmit} changePhoto={changePhoto} visible={visibleUser} user={user} />
              {pair ? <PairDrawer pair={pair} onClose={onClose} visible={visiblePair} photoURLPair={photoURLPair} /> : <></>}
            </>
            : <>
              <Row justify="space-between" gutter={[ 30, 30 ]}>
                <Col flex="500px">
                  まだメール承認が完了していません。再送信しますか？
                  <Button type="link" onClick={async () => { onSubmit(false); await sendVerification(); onSubmit(true); }} disabled={!form}>はい</Button>
                </Col>
              </Row>
            </>
            : <>
              <RegisterDrawer onClose={onClose} form={form} onSubmit={onSubmit} visible={visibleRegister} />
            </>
          }
        </Layout>
      </Content>
      <Footer id="footer">@Copyright <Link href="https://ha-shii.com/" target="_blank">しほみスタジオ</Link></Footer>
    </>
  )
}

export default App
