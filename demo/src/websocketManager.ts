import WebSocket from "ws";
import { EventEmitter } from "events";

interface WebsocketManagerOptions {
  url: string;
  reconnectInterval?: number;
}

export class WebsocketManager extends EventEmitter {
  private ws?: WebSocket;
  private url: string;
  private reconnectInterval: number;

  constructor(options: WebsocketManagerOptions) {
    super();
    this.url = options.url;
    this.reconnectInterval = options.reconnectInterval || 5000;
  }

  public connect(): void {
    console.log(`Connecting to WebSocket at ${this.url}`);
    this.ws = new WebSocket(this.url);

    this.ws.on("open", () => {
      console.log("🎭 WebSocket connection opened!");
      this.emit("open");
    });

    this.ws.on("message", (data: WebSocket.Data) => {
      try {
        const event = JSON.parse(data.toString());
        console.log("Received WebSocket event:", event);
        this.emit("message", event);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        this.emit("error", error);
      }
    });

    this.ws.on("close", () => {
      console.log(
        "WebSocket connection closed, attempting to reconnect in",
        this.reconnectInterval,
        "ms"
      );
      this.emit("close");
      setTimeout(() => this.connect(), this.reconnectInterval);
    });

    this.ws.on("error", (error: Error) => {
      console.error("WebSocket encountered an error:", error);
      this.emit("error", error);
    });
  }

  public send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  }
}
