import { io } from "socket.io-client";

export const createSocketConnection = () => {
  return io(import.meta.env.VITE_API_BASE_URL);
};
