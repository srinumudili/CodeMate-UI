// src/utils/socket.js
import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true, // send cookies automatically
      transports: ["websocket"],
    });
  }
  return socket;
};
