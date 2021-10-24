import type { UserCalender } from "./components/type"
import { useState, useEffect } from 'react'
import './App.css';
import './detail.css';
import { Layout, Button, Input, Row, Col, Avatar, Typography, Space } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { setUserState } from "./components/firebase"

const { Text, Link } = Typography;

const Detail = (state: any) => {
    const [ userStateNow, setUserStateNow ] = useState<boolean | undefined>(undefined);

    const onSubmit = async (s: boolean) => {
        state.onSubmit(false)
        if (state.detail.room) {
            await setUserState(state.detail.room, s)
            setUserStateNow(s)
        }
        state.onSubmit(true)
    };

    return <Layout id="detail">
        {
            state.open ?
                <>
                    <Row className="user-status">
                        <Space size="large">
                            {state.userState === 0 && userStateNow === undefined ?
                                <>
                                    <Text>承認しますか？</Text>
                                    <>
                                        <Button type="primary" disabled={!state.form} onClick={() => onSubmit(true)}>
                                            承認
                                        </Button>
                                        <Button disabled={!state.form} onClick={() => onSubmit(false)}>
                                            拒否
                                        </Button>
                                    </>
                                </>
                                : state.userState === 1 || userStateNow === true ?
                                    <Text>承認しました</Text>
                                    : state.userState === -1 || userStateNow === false ?
                                        <Text>拒否しました</Text>
                                        : <></>
                            }
                        </Space>
                    </Row>
                    <Row id="room">
                        <Col span={8}><Text className="sub-title">予定日時</Text><Text className="sub-detail">{state.detail.date.substring(0, 4)}/{state.detail.date.substring(4, 6)}/{state.detail.date.substring(6, 8)}</Text></Col>
                        <Col flex="auto"><Text className="sub-title">予定時間</Text><Text className="sub-detail">{state.detail.time.substring(0, 2)}:{state.detail.time.substring(2, 4)}</Text></Col>
                        <Col hidden><Text className="sub-title">部屋ID</Text><Text className="sub-detail">{state.detail.room}</Text></Col>
                        <Col span={8}><Text className="sub-title">ステータス</Text>
                            {
                                state.detail.state === 1 ? <Text className="sub-detail status-no" />
                                    : state.detail.state === 2 ? <Text className="sub-detail status-wait" />
                                        : state.detail.state === 3 ? <Text className="sub-detail status-yes" />
                                            : <Text className="sub-detail status-end" />
                            }
                        </Col>

                    </Row>
                    <Row justify="center" align="middle">
                        <EnvironmentOutlined />
                        {state.detail.locate && state.detail.locate.lat && state.detail.locate.lng ? <Link href={"https://www.google.com/maps/search/?api=1&query=" + state.detail.locate.lat + "," + state.detail.locate.lng} target="_blank"> {state.detail.locate.lat}, {state.detail.locate.lng} </Link> :
                            <Text className="sub-detail">未確定</Text>}
                    </Row>
                    {state.pair && state.pair !== undefined ?
                        <>
                            <Row justify="center" className="icon">
                                <Button type="text" onClick={() => state.showDrawer(2)} disabled={!state.form}>
                                    {state.pair && state.photoURLPair && state.photoURLPair !== "" ?
                                        <Avatar size={64} src={state.photoURLPair} alt={state.pair.displayName} /> :
                                        <Avatar size={64} icon={<UserOutlined />} alt="" />
                                    }
                                </Button>
                            </Row>
                            <Row justify="center">
                                <Text>{state.pair.displayName}</Text>
                            </Row>
                            <Row justify="center" className="status"><Text>返答：</Text>
                                {state.pair.state === -1 ? <Text className="status-no" /> : state.pair.state === 0 ? <Text className="status-wait" /> : <Text className="status-yes" />}
                            </Row>
                        </> :
                        <></>
                    }
                </> :
                <></>
        }
    </Layout >
}

export default Detail