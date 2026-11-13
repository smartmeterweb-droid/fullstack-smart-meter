import { io } from "socket.io-client"
import { BACKEND_URL } from "./axios"

export const socket = io(BACKEND_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
})

export default socket

