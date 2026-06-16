import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
  timeout: 20000,
});

socket.on("connect", () => {
  console.log("✅ Socket Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Socket Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.warn("⚠️ Reconnecting:", err.message);
});