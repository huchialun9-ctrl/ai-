const WS_URL = "ws://localhost:3001/api/v1/agent/ws";

type MessageHandler = (data: any) => void;

export class WebSocketClient {
    private socket: WebSocket | null = null;
    private listeners: MessageHandler[] = [];
    private isConnected: boolean = false;

    connect() {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this.socket = new WebSocket(WS_URL);

        this.socket.onopen = () => {
            console.log("WebSocket Connected");
            this.isConnected = true;
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.listeners.forEach(listener => listener(data));
            } catch (e) {
                console.error("Failed to parse WS message:", e);
            }
        };

        this.socket.onclose = () => {
            console.log("WebSocket Disconnected");
            this.isConnected = false;
            // Simple reconnect logic could go here
            this.socket = null;
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };
    }

    send(type: string, payload: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type, ...payload }));
        } else {
            console.warn("WebSocket not connected, cannot send message");
        }
    }

    active() {
        return this.isConnected;
    }

    onMessage(handler: MessageHandler) {
        this.listeners.push(handler);
        return () => {
            this.listeners = this.listeners.filter(h => h !== handler);
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

export const wsClient = new WebSocketClient();
