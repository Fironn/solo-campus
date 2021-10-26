import './calender.css';
import './App.css';
import { Layout, Button, Skeleton, Input, Row, Col, Avatar, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Header, Footer, Sider, Content } = Layout;
const { Text, Link } = Typography;

const User = (state: any) => {
    const onSubmit = async () => {
        state.onSubmit(false)
    };

    return <Space id="user">
        {state.form ?
            <Button disabled={!state.form} className="icon" type="text" onClick={() => state.showDrawer(1)}>
                {state.user && state.photoURL !== "" ?
                    <Avatar size={50} src={state.photoURL} alt={state.user.displayName} /> :
                    <Avatar size={50} icon={<UserOutlined />} alt="" />
                }
            </Button>
            :
            <Skeleton.Avatar size={50} active />
        }
        <Text id="name">{state.user.email}</Text>
    </Space>
}

export default User