import { io, Socket } from "socket.io-client";
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class SocketService {
  private socket: Socket | null = null;
  private socketUrl: string = VITE_API_BASE_URL; // Your Socket.IO server URL
  private isConnected: boolean = false;
  constructor() {
  }

  static instance: SocketService;

  // Connect to the Socket.IO server
  public connect() {
      if (this.socket && this.isConnected) {
          return;
      }

      this.socket = io(this.socketUrl, {
          transports: ["websocket"], // Ensure WebSocket is used for transport
          reconnection: true, // Enable automatic reconnection
          reconnectionAttempts: Infinity, // Retry indefinitely
          reconnectionDelay: 2000, // Delay between reconnection attempts
      });

      // Handle the connection event
      this.socket.on("connect", () => {
          this.isConnected = true;
          console.log("Socket.IO connection established");
      });

      // Handle the disconnect event
      this.socket.on("disconnect", () => {
          this.isConnected = false;
          console.log("Socket.IO connection disconnected");
      });

      // Handle errors
      this.socket.on("connect_error", (error: Error) => {
          console.error("Socket.IO error:", error);
      });
  }

  // Send a message to the server
  public send(event: string, message: any) {
      if (this.socket && this.isConnected) {
          this.socket.emit(event, message);
      } else {
          console.log("Socket.IO is not connected");
      }
  }

  // Close the socket connection
  public close() {
      if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
      }
  }

  // Get the socket instance
  public getSocket() {
    if(!this.isConnected) {
        this.connect();
    }
    return this.socket;
  }

  // Check connection status
  public getConnectionStatus() {
      return this.isConnected;
  }
}

const socketServiceInstance = new SocketService();
SocketService.instance = socketServiceInstance;

export const socketService = socketServiceInstance;