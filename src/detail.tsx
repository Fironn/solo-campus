import type { UserCalender } from "./components/type"
import { useState, useEffect } from 'react'
import './App.css';
import { Layout, Button, Input, Row, Col, Avatar, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;

const Detail = (state: any) => {
    const onSubmit = async () => {
        state.onSubmit(false)
    };

    return <>
        <Layout>
            {
                state.open ?
                    <>
                        <Text>{state.detail.date}</Text>
                        <Text>{state.detail.time}</Text>
                        <Text>{state.detail.room}</Text>
                        <Text>{state.detail.state}</Text>
                        <Button type="text" onClick={state.showDrawer}>
                            <Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
                        </Button>
                        <Text>{state.pair}</Text>
                        <EnvironmentOutlined /><Text>{state.place}</Text>
                        <Text>{state.state}</Text>
                    </> :
                    <></>
            }
        </Layout>
    </>
}

export default Detail