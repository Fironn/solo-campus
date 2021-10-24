import { Layout, Button, Input, Row, Col, Drawer, Skeleton, notification, Divider } from 'antd';

export const openNotification = (messages: string[]) => {
    notification.info({
        message: messages[ 0 ],
        description:
            messages.slice(1),
        placement: 'topLeft',
    });
};