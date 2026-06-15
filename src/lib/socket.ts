import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

console.log("SOCKET_URL =", SOCKET_URL);

export const socket = io(SOCKET_URL!, {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Socket Connected", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Socket Error:", err);
});