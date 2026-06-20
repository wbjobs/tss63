import { io, Socket } from "socket.io-client";

export default defineNuxtPlugin(() => {
  const socket: Socket = io("http://localhost:3001", {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  return {
    provide: {
      socket,
    },
  };
});
