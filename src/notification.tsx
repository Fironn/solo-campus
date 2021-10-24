import { notification } from 'antd';

export const openNotification = (messages: string[], onClose: () => void) => {
    notification.info({
        message: messages[ 0 ],
        description:
            messages.slice(1),
        placement: 'topLeft',
        onClose: onClose,
        duration: null
    });
};

export const closeNotification=()=>{
    notification.destroy()
}