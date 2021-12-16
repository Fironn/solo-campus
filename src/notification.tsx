import { notification } from 'antd';

export const openNotification = (messages: string[], id: string | undefined, onClose: () => void) => {
    const date = messages[ 2 ] ? messages[ 2 ].substring(0, 4) + "/" + messages[ 2 ].substring(4, 6) + "/" + messages[ 2 ].substring(6, 8) : ""
    const time = messages[ 3 ] ? messages[ 3 ].substring(0, 2) + ":" + messages[ 3 ].substring(2, 4) : ""
    notification.open({
        key: messages[ 2 ] && messages[ 3 ] ? (messages[ 2 ] + messages[ 3 ]) : undefined,
        message: messages[ 0 ],
        description:
            messages[ 1 ] + " " + date + " " + time,
        onClose: onClose,
        placement: 'topLeft',
        duration: 0
    });
};

export const closeNotification = () => {
    notification.destroy()
}

export const readNotification = (date: string, time: string) => {
    notification.close(date + time)
}