import type { Pair, User as Users, dateTime } from "./components/type"
import type { UserCalender } from "./components/type"

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { auth, db, readMessage, sendVerification, getUserDetail, getImg, getPairDetail, getImgPair, getUserState, readMessageDate } from "./components/firebase"
import { onSnapshot, collection, doc, } from "firebase/firestore";
import Chat from './chat'
import Calender from './calender'
import User from './user'
import SignIn from './signIn'
import Detail from './detail'
import UserDrawer from "./userDrawer";
import PairDrawer from "./pairDrawer";
import RegisterDrawer from "./registerDrawer";
import Intro from "./intro"
import './App.css';
import './sp.css';
import Map from './map'
import { Layout, Button, Input, Typography, Row, Col, Drawer, Skeleton, notification, Divider } from 'antd';
import { openNotification, closeNotification, readNotification } from "./notification";
import deepEqual from "deep-equal";
const { Header, Footer, Sider, Content } = Layout;
const { Text, Link, Title } = Typography;

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
  const [ noticeBudge, setNoticeBudge ] = useState<dateTime[]>([]);
  const [ pair, setPair ] = useState<Pair | undefined>(undefined);
  const [ photoURLPair, setPhotoURLPair ] = useState<string | undefined>("");

  const [ device, setDevice ] = useState<string>("")
  const scrollRef = useRef<HTMLInputElement>(null);

  const noticeBudgeTo = useMemo(() => {
    return noticeBudge
  }, [ noticeBudge ])

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
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('iphone') > 0 || ua.indexOf('ipod') > 0 || ua.indexOf('android') > 0 && ua.indexOf('mobile') > 0) {
      setDevice('sp')
    } else if (ua.indexOf('ipad') > 0 || ua.indexOf('android') > 0) {
      // iOS12 まで
      setDevice('tab');
    } else if (ua.indexOf('ipad') > -1 || ua.indexOf('macintosh') > -1 && 'ontouchend' in document) {
      // iOS13 以降
      setDevice('tab');
    } else {
      setDevice('pc');
    }

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
          let noticeBudgeTemp: dateTime[] = []
          unsubscribe = onSnapshot(colRef,
            (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                  const data = change.doc.data();
                  if (data.read === false && data.title && data.message && data.date && data.time) {
                    openNotification([ data.title, data.message, data.date, data.time ], change.doc.id, () => { readMessage(colRef, change.doc.id); })
                    noticeBudgeTemp.push({ date: data.date, time: data.time })
                    setNoticeBudge(noticeBudgeTemp)
                  } else if (data.read === false && data.title && data.message) {
                    openNotification([ data.title, data.message ], change.doc.id, () => readMessage(colRef, change.doc.id))
                  }
                } else if (change.type === "removed" || change.type === "modified") {
                  const data = change.doc.data();
                  if (data.read === true && data.title && data.message && data.date && data.time) {
                    noticeBudgeTemp = noticeBudgeTemp.filter((value) => {
                      return !(value.date.toString() === data.date.toString() && value.time.toString() === data.time.toString())
                    });
                    readNotification(data.date, data.time)
                  }
                }
                setNoticeBudge(noticeBudgeTemp)
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
      onClose()
      setForm(true)
    };
  }, []);

  const onSubmit = (state: boolean) => {
    setForm(state)
  };

  const scrollToDetail = useCallback(() => {
    scrollRef!.current!.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ scrollRef ])


  const openDetail = async (value: UserCalender | undefined) => {
    if (value !== undefined) {
      if (device === 'sp') {
        scrollToDetail();
      }
      setLoading(true)
      setPhotoURLPair("")

      if (value.date && value.time) {
        const temp = noticeBudge.filter((item) => {
          return !(value.date.toString() === item.date.toString() && value.time.toString() === item.time.toString())
        });
        if (temp.length !== noticeBudge.length) {
          setNoticeBudge(temp);
          readMessageDate(value.date, value.time)
        }
      }


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
    <span id={device === 'sp' ? 'sp' : 'pc'}>
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
                <Col flex="500px" id="left">
                  <Calender user={user} onSubmit={onSubmit} openDetail={openDetail} form={form} noticeBudge={noticeBudgeTo} />
                </Col>
                <Col flex="auto" id="right">
                  {loading ?
                    <Skeleton active avatar paragraph={{ rows: 4 }} /> :
                    <>
                      <div ref={scrollRef} />
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
              <Intro />
              <RegisterDrawer onClose={onClose} form={form} onSubmit={onSubmit} visible={visibleRegister} />
            </>
          }
        </Layout>
      </Content>
      <Footer id="footer">@Copyright <Link href="https://ha-shii.com/" target="_blank">しほみスタジオ</Link></Footer>
    </span >
  )
}

export default App
