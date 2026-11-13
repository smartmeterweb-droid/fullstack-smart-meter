import { useEffect } from 'react'
import socket from '../api/socket'

const NotificationListener = ({ onNewNotification }) => {
    useEffect(() => {
        const handler = (notification) => {
            if (typeof onNewNotification === 'function') {
                onNewNotification(notification)
            }
        }

        socket.on('newNotification', handler)

        return () => {
            socket.off('newNotification', handler)
        }
    }, [onNewNotification])

    return null
}

export default NotificationListener
