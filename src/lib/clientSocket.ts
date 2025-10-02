import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getClientSocket() {
    if (socket && socket.connected) return socket;

    const origin = process.env.NEXT_PUBLIC_API_URL!;

    socket = io(origin, {
        withCredentials: true,
        transports: ['websocket'],
    });

    return socket;
}
