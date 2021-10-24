import type { latLng, User } from "./components/type";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Map from './map'
import type { ChangeEvent } from "react";
import type { AccountDetail } from "./components/type";
import { useState, useEffect, useRef, } from 'react'
import { signUpAccount } from "./components/firebase"
import './registerDrawer.css';
import './App.css';
import {
    Layout, Button, Skeleton, Typography, Input, Row, Col, Avatar, Upload, message, Drawer, Form, Space
} from 'antd';
import { LoadingOutlined, TagsOutlined, EnvironmentOutlined, EyeInvisibleOutlined, EyeTwoTone, UserOutlined, UploadOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;


const RegisterDrawer = (state: any) => {
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [ newDetail, setNewDetail ] = useState<AccountDetail>(
        {
            displayName: "",
            locate: { lat: "37.523423", lng: "139.938035" },
            tag: []
        }
    );

    const onSubmit = async () => {
        if (inputRef && inputRef.current) inputRef.current.click();
    }

    const onSend = async () => {
        state.onSubmit(false)
        const res = await signUpAccount(newDetail, email, password);
        if (res) {
            state.onClose()
        }
        state.onSubmit(true);
    }

    const onClick = (locate: latLng) => {
        setNewDetail({ ...newDetail, locate: { lat: locate.lat.toString(), lng: locate.lng.toString() } });
    }

    const validateMessages = {
        required: '${name} is required!',
        types: {
            email: '${name} is not a valid email!',
            number: '${name} is not a valid number!',
        },
    };


    const editButton = <Button type="primary" disabled={!state.form} onClick={onSubmit}>
        登録する
    </Button>

    return <>
        <Drawer title="はじめまして" placement="right" onClose={state.onClose} visible={state.visible} width={300} footer={editButton}>
            <Space id="register-drawer" direction="vertical" align="start">
                <Form labelCol={{ span: 4 }} onFinish={onSend} wrapperCol={{ span: 24 }} validateMessages={validateMessages} layout="vertical" className="form">
                    <Space direction="vertical" align="start" style={{ width: "100%" }}>
                        <Text className="sub-title">名前</Text>
                        <Form.Item name="displayName" className="sub-detail" rules={[ { required: true } ]}>
                            <Input placeholder="表示名" value={newDetail.displayName} disabled={!state.form}
                                onInput={(e) => setNewDetail({ ...newDetail, displayName: e.currentTarget.value })} />
                        </Form.Item>
                        <Text className="sub-title">メールアドレス</Text>
                        <Form.Item name="email" className="sub-detail" rules={[ { required: true, type: 'email' } ]}>
                            <Input
                                placeholder="メールアドレス"
                                type="email"
                                value={email}
                                onInput={(e) => setEmail(e.currentTarget.value)}
                                disabled={!state.form}
                                prefix={<UserOutlined className="site-form-item-icon" />}
                            />
                        </Form.Item>
                        <Text className="sub-title">パスワード</Text>
                        <Form.Item className="sub-detail" name="password" rules={[ { required: true } ]}>
                            <Input.Password
                                placeholder="パスワード"
                                type="password"
                                value={password}
                                onInput={(e) => setPassword(e.currentTarget.value)}
                                disabled={!state.form}
                                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>
                        <Text className="sub-title">タグ</Text>
                        <span><TagsOutlined /><Text className="sub-detail">なし</Text></span>
                        <Text className="sub-title">待ち合わせポイント</Text>
                        <Row>
                            <Col ><EnvironmentOutlined /></Col>
                            <Col span={11} className="sub-detail">{newDetail.locate.lat}</Col>
                            <Col span={11} className="sub-detail">{newDetail.locate.lng}</Col>
                        </Row>
                        <Map marker={newDetail.locate} onClick={onClick} />
                        <Button hidden ref={inputRef} type="primary" htmlType="submit" >
                            Submit
                        </Button>
                    </Space>
                </Form >
                {/* <Map /> */}
            </Space>
        </Drawer >
    </>
}

export default RegisterDrawer
