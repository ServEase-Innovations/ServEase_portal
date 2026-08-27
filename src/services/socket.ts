// src/services/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (process.env.REACT_APP_API_URL || 'http://localhost:4000/').replace(/\/$/, '');

let socket: Socket | null = null;

// The backend reads the JWT from the same HTTP-only cookie the REST API
// uses (withCredentials), so no token needs to be passed manually here.
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export default getSocket;
