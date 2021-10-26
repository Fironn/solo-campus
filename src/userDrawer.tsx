import type { ChangeEvent } from "react";
import type { latLng, User, AccountDetail } from "./components/type";
import { useState, useEffect, useRef, } from 'react'
import { setUserDetail, getImg, setImg, signOutAccount } from "./components/firebase"
import './userDrawer.css';
import './App.css';
import Map from './map'
import {
    Layout, Button, Skeleton, Typography, Input, Row, Col, Avatar, Upload, message, Drawer, Form, Space
} from 'antd';

import { openNotification, closeNotification } from "./notification";
import { LoadingOutlined, TagsOutlined, EnvironmentOutlined, UserOutlined, UploadOutlined } from '@ant-design/icons';
import deepEqual from "deep-equal";

const { Text, Link } = Typography;


const UserDrawer = (state: any) => {
    const [ edit, setEdit ] = useState(false);
    const [ onEdit, setOnEdit ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const [ photo, setPhoto ] = useState<Blob | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);
    const [ newDetail, setNewDetail ] = useState<AccountDetail>(
        {
            displayName: state.user.displayName,
            locate: { lat: state.user.locate.lat, lng: state.user.locate.lng },
            tag: state.user.tag
        }
    );

    const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const image = event.target.files[ 0 ];
            if (image === undefined) {
                console.log("ファイルが選択されていません");
            } else {
                setPhoto(image);
            }
        }
    };

    const fileUpload = () => {
        if (inputRef && inputRef.current) inputRef.current.click();
    };

    const next = (snapshot: any) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(percent + "% done");
    };

    const error = (error: string) => {
        console.log(error);
        setLoading(false);
    };

    const complete = async () => {
        console.log('uploaded!');
        setLoading(false);
        state.changePhoto(await getImg())
    };

    useEffect(() => {
        if (photo !== undefined) {
            state.onSubmit(true)
            setLoading(true);
            setImg(photo, next, error, complete)
        }
        return () => {
        };
    }, [ photo ]);

    const onSubmit = async () => {
        state.onSubmit(true)
        const send = checkEqualDetail(newDetail, state.user)
        const res = await setUserDetail(send);
        if (res) state.changeUserProfile(send);
        setOnEdit(false);
        state.onSubmit(true);
    }

    const checkEqualDetail = (newData: AccountDetail, oldData: any) => {
        var diff: any = {};
        if (newData.displayName !== oldData.displayName) diff.displayName = newData.displayName
        if (!deepEqual(newData.locate, oldData.locate)) diff.locate = newData.locate
        if (!deepEqual(newData.tag, oldData.tag)) diff.tag = newData.tag
        return diff
    }

    const onEdits = (s: boolean) => {
        const data = checkEqualDetail(newDetail, state.user)
        if (s === false && Object.keys(data).length !== 0) {
            setNewDetail({
                displayName: state.user.displayName,
                locate: { lat: state.user.locate.lat, lng: state.user.locate.lng },
                tag: state.user.tag
            })
        }
        setOnEdit(s);
    }

    const onClick = (locate: latLng) => {
        setNewDetail({ ...newDetail, locate: { lat: locate.lat.toString(), lng: locate.lng.toString() } });
    }

    const editButton = !onEdit ? <Space>
        <Button type="primary" disabled={!state.form} onClick={() => onEdits(true)}>
            編集
        </Button>
        <Button onClick={() => { onSubmit(); closeNotification(); signOutAccount() }} disabled={!state.form} >ログアウト</Button>
    </Space>
        : <Space>
            <Button type="primary" disabled={!state.form} onClick={onSubmit}>
                保存
            </Button>
            <Button disabled={!state.form} onClick={() => onEdits(false)}>
                キャンセル
            </Button>
        </Space>

    const editForm = <Form labelCol={{ span: 4 }} wrapperCol={{ span: 24 }} layout="vertical" className="form">
        <Space direction="vertical" align="start">
            <Text className="sub-detail" style={{ color: 'red' }}>プロトタイプのテストに参加する方：表示名を[テスト中]にすることで直接会うことを拒否します。</Text>
            <Text className="sub-title">名前</Text>
            <Form.Item className="sub-detail">
                <Input placeholder={state.user.displayName} value={newDetail.displayName} disabled={!state.form}
                    onInput={(e) => setNewDetail({ ...newDetail, displayName: e.currentTarget.value })} />
            </Form.Item>
            <Text className="sub-title">メールアドレス</Text>
            <Text className="sub-detail">{state.user.email}</Text>
            <Text className="sub-title">タグ</Text>
            <span><TagsOutlined /><Text className="sub-detail">{state.user.tag && state.user.tag.length > 0 ? state.user.tag[ 0 ] : "なし"}</Text></span>
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


    return <>
        <Drawer title="プロフィール" placement="right" onClose={state.onClose} visible={state.visible} width={300} footer={editButton}>
            <Space id="user-drawer" direction="vertical" align="start">
                <Layout className="icon" >
                    <span style={{ zIndex: 1, height: '100%', width: '100%' }} onMouseEnter={() => setEdit(true)} onMouseLeave={() => setEdit(false)}>
                        {loading ?
                            <div className="icon-button">
                                <LoadingOutlined />
                                <div style={{ marginTop: 8 }}>Uploading</div>
                            </div> :
                            <div className="icon-button" style={{ display: !edit ? 'none' : 'block' }}>
                                <Button type="text" onClick={fileUpload} disabled={!state.form} >
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                    <UploadOutlined />
                                </Button>
                                <input hidden ref={inputRef} type="file" accept="image/*" onChange={handleImage} />
                            </div>
                        }
                    </span>
                    <span style={{ position: 'absolute', height: '100%', width: '100%', top: 0 }}>
                        {loading ? <Skeleton.Avatar active size={70} /> :
                            state.user && state.photoURL !== "" ?
                                <Avatar size={70} src={state.photoURL} alt={state.user.displayName} /> :
                                <Avatar size={70} icon={<UserOutlined />} alt="" />
                        }
                    </span>
                </Layout>
                {state.user ? onEdit ? editForm :
                    <><Text className="sub-title">名前</Text>
                        <Text className="sub-detail">{state.user.displayName}</Text>
                        <Text className="sub-title">メールアドレス</Text>
                        <Text className="sub-detail">{state.user.email}</Text>
                        <Text className="sub-title">タグ</Text>
                        <span><TagsOutlined /><Text className="sub-detail">{state.user.tag && state.user.tag.length > 0 ? state.user.tag[ 0 ] : "なし"}</Text></span>
                        <Text className="sub-title">待ち合わせポイント</Text>
                        <span><EnvironmentOutlined /><Text className="sub-detail">{state.user.locate && state.user.locate.lat && state.user.locate.lng ? <Link href={"https://www.google.com/maps/search/?api=1&query=" + state.user.locate.lat + "," + state.user.locate.lng} target="_blank" className="sub-detail"> {state.user.locate.lat}, {state.user.locate.lng} </Link> :
                            "なし"}</Text></span>
                        <Map marker={state.user.locate} />
                    </> :
                    <>
                    </>}
            </Space>
        </Drawer>
    </>
}

export default UserDrawer