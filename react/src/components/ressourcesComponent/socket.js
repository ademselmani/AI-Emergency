/** @format */

import io from "socket.io-client"

const socket = io("http://localhost:3000", {
  withCredentials: true,
  transports: ["websocket", "polling"], // Fallback to polling if WebSocket fails
})

socket.on("connect", () => {
  console.log("Connected to WebSocket server:", socket.id)
})

socket.on("connect_error", (err) => {
  console.error("WebSocket connection error:", err.message)
})

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server")
})

export default socket
