import type { ChangeEvent } from "react";
import { useState, useEffect, useRef, MouseEventHandler, MouseEvent, EventHandler } from 'react'
import { auth, signInAccount, signOutAccount, currentUser, signUpAccount, getImgPair, setImg, getPairDetail } from "./components/firebase"
import './pairDrawer.css';
import './App.css';
import { Layout, Button, Input, Row, Col, Avatar, Space, Upload, message, Drawer, Form, Typography } from 'antd';
import { LoadingOutlined, UserOutlined, UploadOutlined, TagsOutlined } from '@ant-design/icons';
import { async } from "@firebase/util";
const { Text, Link } = Typography;

const PairDrawer = (state: any) => {

    return <>
        <Drawer title="プロフィール" placement="right" onClose={state.onClose} visible={state.visible} width={300}>
            <Space id="pair-drawer" direction="vertical" align="start">
                <Layout className="icon" >
                    <span style={{ height: '100%', width: '100%' }}>
                        {state.pair && state.pair.photoURL !== "" ?
                            <Avatar size={64} src={state.pair.photoURL} alt={state.pair.displayName} /> :
                            <Avatar size={64} icon={<UserOutlined />} alt="" />
                        }
                    </span>
                </Layout>
                {state.pair ?
                    <><Text className="sub-title">名前</Text>
                        <Text className="sub-detail">{state.pair.displayName}</Text>
                        <Text className="sub-title">タグ</Text>
                        <span><TagsOutlined /><Text className="sub-detail">{state.pair.tag && state.pair.tag.length > 0 ? state.pair.tag[ 0 ] : "なし"}</Text></span>
                    </> : <></>}
            </Space>
        </Drawer>
    </>
}

export default PairDrawer