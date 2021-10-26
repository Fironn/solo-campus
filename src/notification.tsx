import { notification } from 'antd';

export const openNotification = (messages: string[], onClose: () => void) => {
    const date = messages[ 2 ] ? messages[ 2 ].substring(0, 4) + "/" + messages[ 2 ].substring(4, 6) + "/" + messages[ 2 ].substring(6, 8) : ""
    const time = messages[ 3 ] ? messages[ 3 ].substring(0, 2) + ":" + messages[ 3 ].substring(2, 4) : ""
    notification.info({
        message: messages[ 0 ],
        description:
            messages[ 1 ] + " " + date + " " + time,
        placement: 'topLeft',
        onClose: onClose,
        duration: null
    });
};

export const closeNotification = () => {
    notification.destroy()
}